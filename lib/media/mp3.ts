/**
 * Lossless MP3 cutting: copies whole MPEG audio frames byte-for-byte (no re-encoding),
 * the same technique as `ffmpeg -c copy`. Quality is identical to the original.
 * Pure functions over Uint8Array so they run in Node scripts and unit tests.
 */

const BITRATES_V1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const BITRATES_V2_L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const SAMPLE_RATES_V1 = [44100, 48000, 32000];

export interface Mp3Frame {
  offset: number;
  length: number;
  /** Start time of the frame in seconds, relative to the first audio frame. */
  time: number;
}

export interface Mp3Info {
  sampleRate: number;
  samplesPerFrame: number;
  frameDuration: number;
  frames: Mp3Frame[];
  duration: number;
  /**
   * Samples that decoders trim at the start (encoder delay from the LAME/Lavc tag + 529
   * decoder delay). A cut file has no such tag, so its audio appears this much later.
   */
  startDelaySamples: number;
}

function id3v2Size(bytes: Uint8Array): number {
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return 0; // "ID3"
  const size = ((bytes[6]! & 0x7f) << 21) | ((bytes[7]! & 0x7f) << 14) | ((bytes[8]! & 0x7f) << 7) | (bytes[9]! & 0x7f);
  const footer = (bytes[5]! & 0x10) !== 0 ? 10 : 0;
  return 10 + size + footer;
}

interface Header {
  length: number;
  sampleRate: number;
  samplesPerFrame: number;
}

function parseHeader(b: Uint8Array, i: number): Header | null {
  if (i + 4 > b.length) return null;
  if (b[i] !== 0xff || (b[i + 1]! & 0xe0) !== 0xe0) return null;
  const version = (b[i + 1]! >> 3) & 0x03; // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
  const layer = (b[i + 1]! >> 1) & 0x03; // 1=Layer III
  if (version === 1 || layer !== 1) return null;
  const bitrateIndex = (b[i + 2]! >> 4) & 0x0f;
  const srIndex = (b[i + 2]! >> 2) & 0x03;
  const padding = (b[i + 2]! >> 1) & 0x01;
  if (bitrateIndex === 0 || bitrateIndex === 15 || srIndex === 3) return null;
  const v1 = version === 3;
  const bitrate = (v1 ? BITRATES_V1_L3 : BITRATES_V2_L3)[bitrateIndex]! * 1000;
  const sampleRate = SAMPLE_RATES_V1[srIndex]! / (v1 ? 1 : version === 2 ? 2 : 4);
  const coef = v1 ? 144 : 72;
  return { length: Math.floor((coef * bitrate) / sampleRate) + padding, sampleRate, samplesPerFrame: v1 ? 1152 : 576 };
}

const DECODER_DELAY = 529;

/**
 * If this is the Xing/Info metadata frame (no audio), returns the gapless start delay in
 * samples read from its LAME-style extension; otherwise null.
 */
function infoFrameDelay(b: Uint8Array, offset: number, length: number): number | null {
  const end = Math.min(b.length, offset + length);
  const text = new TextDecoder("latin1").decode(b.subarray(offset, end));
  let x = text.indexOf("Xing");
  if (x === -1) x = text.indexOf("Info");
  if (x === -1) return null;
  const at = offset + x;
  const flags = ((b[at + 4]! << 24) | (b[at + 5]! << 16) | (b[at + 6]! << 8) | b[at + 7]!) >>> 0;
  const size = 8 + (flags & 1 ? 4 : 0) + (flags & 2 ? 4 : 0) + (flags & 4 ? 100 : 0) + (flags & 8 ? 4 : 0);
  const ext = at + size; // LAME extension: 9-byte encoder string, ..., delay/padding at +21
  if (ext + 24 > end) return DECODER_DELAY;
  const encoderDelay = (b[ext + 21]! << 4) | (b[ext + 22]! >> 4);
  return encoderDelay + DECODER_DELAY;
}

export function parseMp3(bytes: Uint8Array): Mp3Info {
  let i = id3v2Size(bytes);
  const frames: Mp3Frame[] = [];
  let sampleRate = 0;
  let samplesPerFrame = 0;
  let first = true;
  let startDelaySamples = 0;
  while (i < bytes.length) {
    const h = parseHeader(bytes, i);
    if (!h) {
      if (frames.length === 0 && first) {
        i++; // resync before the first frame (garbage after the ID3 tag)
        continue;
      }
      break; // end of audio (e.g. ID3v1 "TAG" trailer)
    }
    if (first) {
      first = false;
      sampleRate = h.sampleRate;
      samplesPerFrame = h.samplesPerFrame;
      const delay = infoFrameDelay(bytes, i, h.length);
      if (delay !== null) {
        startDelaySamples = delay;
        i += h.length;
        continue;
      }
    }
    if (i + h.length > bytes.length) break;
    frames.push({ offset: i, length: h.length, time: (frames.length * samplesPerFrame) / sampleRate });
    i += h.length;
  }
  if (!frames.length) throw new Error("No MPEG Layer III frames found");
  const frameDuration = samplesPerFrame / sampleRate;
  return { sampleRate, samplesPerFrame, frameDuration, frames, duration: frames.length * frameDuration, startDelaySamples };
}

export interface Mp3Cut {
  bytes: Uint8Array;
  /** Where the requested [start, end] range lies inside the new file, in seconds. */
  clip: [number, number];
}

/**
 * Cuts [start, end] (seconds in the original) plus `margin` seconds of padding on each side,
 * copying whole frames. Returns the new file and the clip position inside it, so a player can
 * play exactly the same span as before.
 */
export function cutMp3(info: Mp3Info, bytes: Uint8Array, start: number, end: number, margin = 0.5): Mp3Cut {
  const fd = info.frameDuration;
  const firstFrame = Math.max(0, Math.floor((start - margin) / fd));
  const lastFrame = Math.min(info.frames.length - 1, Math.ceil((end + margin) / fd));
  const from = info.frames[firstFrame]!;
  const to = info.frames[lastFrame]!;
  const out = bytes.slice(from.offset, to.offset + to.length);
  // Original timeline is gapless-trimmed by startDelaySamples; the cut is not.
  const shift = firstFrame * fd - info.startDelaySamples / info.sampleRate;
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return { bytes: out, clip: [round(start - shift), round(end - shift)] };
}
