/**
 * Text moderation (brief §9). Rule-based first pass behind an interface so an AI
 * classifier can replace or complement it later without touching callers.
 * Every decision is returned with reasons so it can be logged and reviewed by a person.
 */
export type ModerationVerdict = "allow" | "reject" | "flag_crisis";

export interface ModerationResult {
  verdict: ModerationVerdict;
  reasons: string[];
}

export interface Moderator {
  check(text: string, field: "name" | "free_text"): ModerationResult;
}

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|info|top|click)\b)/i;
const MARKUP = /[<>{}]/;

// Crisis language must NEVER block the person: it triggers a warm message with help resources
// and a priority flag for Hellen. List is intentionally conservative; reviewed by a person.
const CRISIS = [
  /\bsuicid/i,
  /\bquitarme la vida\b/i,
  /\bno quiero (seguir )?vivir\b/i,
  /\bhacerme daño\b/i,
  /\bautolesi/i,
  /\bmatarme\b/i,
];

export const ruleModerator: Moderator = {
  check(text, field) {
    const reasons: string[] = [];
    if (field === "free_text" && CRISIS.some((r) => r.test(text))) {
      return { verdict: "flag_crisis", reasons: ["crisis_language"] };
    }
    if (LINK.test(text)) reasons.push("contains_link");
    if (MARKUP.test(text)) reasons.push("contains_markup");
    return { verdict: reasons.length ? "reject" : "allow", reasons };
  },
};
