// Preload for the #181086 proof. Wraps globalThis.fetch and records every Gemini
// generateContent request the CLI sends: the JSON body with the audio bytes
// replaced by their length, and no headers (so no API key is written).
// PROOF_MODE=live forwards the request to Gemini and records status, latency,
// usageMetadata and the transcript; otherwise it answers with a fixed reply.
import { appendFileSync } from "node:fs";
import { createRequire } from "node:module";

// OpenClaw's guarded fetch bypasses the ambient global fetch and calls undici
// directly unless the fetch it sees is a test mock. Marking the wrapper as a mock
// keeps it in the path; live requests are then forwarded through the repo's own
// undici fetch with OpenClaw's dispatcher, the same transport as without the wrapper.
// Run from the OpenClaw checkout root so undici resolves from its node_modules.
const { fetch: undiciFetch } = createRequire(`${process.cwd()}/package.json`)("undici");

const out = process.env.PROOF_OUT;
const live = process.env.PROOF_MODE === "live";
const realFetch = globalThis.fetch;

const wrapper = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (!/generativelanguage\.googleapis\.com\/.*:generateContent/u.test(url)) {
    return realFetch(input, init);
  }
  const body = JSON.parse(typeof init?.body === "string" ? init.body : "{}");
  for (const part of body.contents?.[0]?.parts ?? []) {
    if (part.inline_data?.data) {
      part.inline_data.data = `<${Buffer.from(part.inline_data.data, "base64").length} audio bytes>`;
    }
  }
  const record = { url: url.replace(/key=[^&]+/u, "key=REDACTED"), requestBody: body };
  const started = Date.now();
  let response;
  if (live) {
    response = await undiciFetch(input, init);
    const payload = await response
      .clone()
      .json()
      .catch(() => null);
    Object.assign(record, {
      status: response.status,
      latencyMs: Date.now() - started,
      modelVersion: payload?.modelVersion,
      usageMetadata: payload?.usageMetadata,
      text: payload?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n"),
      error: payload?.error?.message,
    });
  } else {
    response = Response.json({
      candidates: [{ content: { parts: [{ text: "stub transcript" }] } }],
    });
    record.status = "stubbed (no network call)";
  }
  if (out) appendFileSync(out, `${JSON.stringify(record)}\n`);
  return response;
};
wrapper.mock = {};
globalThis.fetch = wrapper;
