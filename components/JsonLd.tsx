import { headers } from "next/headers";

/** Emits schema.org structured data. Carries the CSP nonce like every inline script. */
export async function JsonLd({ data }: { data: object }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  // JSON.stringify output cannot break out of the <script> element except via "<", which is escaped.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: json }} />;
}
