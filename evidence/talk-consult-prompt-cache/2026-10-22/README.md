# Talk consult cache: redacted runtime evidence

Collected 22 October 2026 for [OpenClaw PR #179237](https://github.com/openclaw/openclaw/pull/179237), following the [ClawSweeper review](https://github.com/openclaw/openclaw/pull/179237#issuecomment-6311817975).

**Partial proof, with remaining gaps below.** This archive lives on a separate fork-only evidence branch; it does not change the PR code branch.

## What was actually deployed

Fix logic from source commit `152671f3987b607026d7a3123a7737e2439c6942` was ported into three compiled JavaScript files in an existing locally patched **OpenClaw 2026.10.10-beta.2** Docker image. The resulting tag was `openclaw-local:2026.10.10-beta.2-talkcache-gemini-v2`.

This was **not** a full source build of that PR revision, a latest-stable upgrade, or a live old-versus-new A/B comparison. The old image was retained. The backing agent used **Anthropic Claude**; voice providers were OpenAI/GPT and Google/Gemini. Exact model names and runtime identities are withheld.

The evidence was derived from persisted transcript rows, voice-session lifecycle records, per-response numeric usage and runtime completion observations through read-only queries. These files are **redacted structured extracts**, not raw provider-wire logs. Original event sequence numbers and stored UTC timestamps are retained. Consistent aliases connect records across files.

## Live behavior and cache results

| Route / check | Observed result | Artifact |
|---|---|---|
| OpenAI/GPT native consult | Two actual backing-agent consults. The mid-consult phrase “blue umbrella” / “tomorrow” appears in Claude's answer. The clarification also reached the active consult as steering, so this case does not isolate deferred speech. The recall question was handled by the voice assistant without another consult. | [GPT evidence](gpt-claude-evidence.json) |
| Google/Gemini client-tool-call consult | Three actual consults. Distinct “red kite” / “next Tuesday” speech landed during consult 2 (row 40), without a subsequent hidden steering message in that run. The next generated consult prompt (row 69) omits those markers; the backing answer (row 88) and spoken reply (row 90) contain both. | [Gemini evidence](gemini-claude-evidence.json) |
| Ordinary text-chat run with concurrent Gemini speech | External-user typed question (row 113); “silver mango” speech (row 115) during that ordinary run; typed recall question without the phrase (row 128); Claude answer containing it (row 130). Typed inputs were not marked as Talk consults. | [Mixed chat evidence](mixed-chat-evidence.json) |

Follow-up consult **first-request** token usage:

| Request | Cache read | Cache write | Other input | Cached input |
|---|---:|---:|---:|---:|
| GPT consult 2 | 40,274 | 1,550 | 4 | 96.3% |
| Gemini consult 2 | 32,758 | 836 | 4 | 97.5% |
| Gemini consult 3 | 41,906 | 943 | 4 | 97.8% |

Cached input is `cacheRead / (cacheRead + cacheWrite + input)`. These are individual observed requests, not averages, guaranteed savings, or proof that the entire request prefix was byte-identical. Warm-up calls and all intermediate model calls are retained in the JSON files.

Completed-consult runtime summaries recorded `broke=false`. Those final-call observations do not independently verify every first request across consult boundaries. No full provider-wire byte-prefix comparison is claimed.

## Reconnect attempt: inconclusive

The operator disconnected before hearing an answer. However, the first Claude tool-use response had already been stored at **12:29:10.026Z**. The voice connection closed at **12:29:12.637Z**, cancelling that consult; a replacement connection opened at **12:29:14.155Z** and dispatched another consult.

This does **not** exercise reconnect before the backing agent's first response. Voice-session records did not retain the actual initialization/background payload, so absence of generated-prompt leakage is **not proven** by this attempt. See [reconnect evidence](gemini-reconnect-evidence.json). Cancellation here is recorded, not classified as a new regression.

## Deterministic helper comparison

In-memory comparison used helper text from the original local image-build recipe and the actual installed v2 compiled helper:
- With a pending consult input and no assistant response, the original helper retains the generated input in voice background; v2 omits it.
- For distinct speech inside a consult, the original helper drops it; v2 keeps it after the consult.
- For speech overlapping ordinary chat, the original helper drops it; v2 preserves storage order.

All six old/new outcome assertions passed. See [filter comparison](filter-comparison-evidence.json). This supports the implementation but is not a full producer integration test, exact upstream-base failing run, or captured reconnect request.

## Reproduction used for the human tests

Use one conversation per voice route and keep the backing agent on Claude:
1. Ask Chief to check today's calendar, read-only.
2. While it is working, speak a distinct clarification and synthetic phrase.
3. After the answer, request another calendar lookup and recall of the added day/phrase.
4. Correlate genuine voice rows, generated consult inputs, backing-agent answers and usage records.

For mixed chat: keep Talk connected, type a read-only calendar request, say a different synthetic phrase while Chief works, then type a recall question without repeating that phrase.

Calendar data and unrelated outputs are not included in this public archive. Both test conversations were newly created after deployment.

## Current source/CI versus prior claims

The bot review evaluated `8eb64eae`, before source fix `152671f3`. Current source uses consult provenance, defers genuine speech, and updates the replay documentation.

For `152671f3`, GitHub reports the [CI gate, security-sensitive review and dependency review](https://github.com/openclaw/openclaw/actions/runs/39727199659) successful. This submission did not rerun the upstream source suite or independently revalidate older author-reported test counts. The repository autoreview entrypoint exists, but its canonical shared implementation is not installed on the test server; no completed autoreview run is claimed.

## Requirements not cleared by this submission

- An actual pending-before-first-response reconnect/background capture or accepted equivalent end-to-end producer proof.
- Exact upstream-base failing and fixed-source passing integration reproduction. The local helper comparison is narrower.
- Latest-stable upgrade/data-model compatibility using an existing pre-upgrade mixed Talk/chat transcript.
- Independent verification of the full source producer regression coverage.
- A maintainer decision approving scoped retention of generated consult prompts.

The latest source documentation has been checked for the new replay description; that is not maintainer approval. These gaps should remain visible during re-review.

## Redaction and chronology

Public copies replace runtime IDs with consistent aliases, omit exact model identifiers, replace the private helper path with a relative label, and retain only test-marker presence, provenance, timing and numeric usage. Some phase files list checks as unverified that were performed later; the consolidated status above is authoritative. No credentials, IP addresses, account identities, phone numbers, private endpoints, calendar details, raw prompts, raw tool arguments or results are included.
