/**
 * AWS Signature V4 query-string presigning for S3-compatible storage (Cloudflare R2).
 * Implemented with node:crypto to avoid an SDK dependency; verified against AWS's
 * published example in tests/unit/sigv4.test.ts.
 */
import { createHash, createHmac } from "node:crypto";

export interface PresignInput {
  method: "GET" | "PUT";
  host: string; // e.g. "<account>.r2.cloudflarestorage.com"
  path: string; // e.g. "/<bucket>/<key>" (unencoded)
  region: string; // "auto" for R2
  accessKeyId: string;
  secretAccessKey: string;
  expiresSeconds: number;
  date?: Date;
}

const encode = (s: string) =>
  encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

const hmac = (key: Buffer | string, data: string) => createHmac("sha256", key).update(data, "utf8").digest();
const sha256hex = (data: string) => createHash("sha256").update(data, "utf8").digest("hex");

export function presignUrl(input: PresignInput): string {
  const date = input.date ?? new Date();
  const amzDate = date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); // YYYYMMDDTHHMMSSZ
  const day = amzDate.slice(0, 8);
  const scope = `${day}/${input.region}/s3/aws4_request`;
  const canonicalPath = input.path.split("/").map(encode).join("/");

  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${input.accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(input.expiresSeconds),
    "X-Amz-SignedHeaders": "host",
  };
  const canonicalQuery = Object.keys(query)
    .sort()
    .map((k) => `${encode(k)}=${encode(query[k]!)}`)
    .join("&");

  const canonicalRequest = [input.method, canonicalPath, canonicalQuery, `host:${input.host}`, "", "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256hex(canonicalRequest)].join("\n");

  const kDate = hmac(`AWS4${input.secretAccessKey}`, day);
  const kRegion = hmac(kDate, input.region);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");

  return `https://${input.host}${canonicalPath}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
