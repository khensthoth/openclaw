# Talk consult prompt-cache proof — 23 October 2026

PR: https://github.com/openclaw/openclaw/pull/179237  
Submitted head: `bbb9caa27a628cbea73cdb1f3429d1fae91b9c1d`.

The source-built reproduction found an additional defect: a spoken message immediately before a consult was folded into its generated prompt for the first request but replayed separately on the next. The submitted repair keeps that speech distinct for tagged consults, including speech committed while write admission waits. Ordinary unanswered-message and restart recovery remain unchanged.

The PR integrates upstream `54dd1c6d` and declares the native version **2026.10.6**. No saved configuration or version metadata was edited to pass an upgrade guard. See [source-scope.json](source-scope.json) for exact proof commits and the equivalent test-only type correction.

## Verified proof

| Boundary | Result | Receipt |
| --- | --- | --- |
| Original retention regression on upstream `390d7993` | Both browser/native cases fail only at the intended retained-input assertions; strict expected-failure gate passes. | [base-producer-regression.json](base-producer-regression.json) |
| Original fixed-source producer integration | 134 tests passed at `4dddbb7d`, before the additional pre-consult repair. | [fixed-producer-tests.json](fixed-producer-tests.json) |
| Newly found preparation defect on prior source `5c86a193` | Three intended failures for native-recorder, prepared-message and browser provenance. Repaired source passed **47 tests across five files**, including late speech, ordinary recovery and mandatory tool-prefix stability. | [current-preparation-regression.json](current-preparation-regression.json) |
| Built Gateway with actual agent execution and synthetic HTTP provider | **Passed** at `8b6f6011`. Real consult calls, pending reconnect initialization, exact consult-containing prefix, retained generated input, and speech order. | [built-gateway-runtime.json](built-gateway-runtime.json) |
| Published latest-stable mixed-data upgrade | **Passed** from published 2026.10.6 through the native updater; active candidate build and all 18,522 file hashes verified. | [stable-2026.10.6-upgrade.json](stable-2026.10.6-upgrade.json) |
| Current PR head checks | **Passed** on `bbb9caa2`: CI, security-sensitive and dependency-review gates all successful. | [current-head-ci.json](current-head-ci.json) |

The current-source proof builds have identical product source and docs to the PR. The PR subsequently adds only two user-role guards in the new test to satisfy its message-union type check; non-user messages remain in place and fail strict equality. No product behavior changes in that correction.

## Built runtime: what was actually checked

[Run 39931480192](https://github.com/khensthoth/openclaw/actions/runs/39931480192) compiled the Gateway and required private QA entries with native build commands, then used the existing QA producer and real agent loop.

The first synthetic external HTTP request was held before any response bytes. While it waited, the test recorded a distinct spoken clarification and reopened the same logical voice session through the actual public handler. The real provider initialization received only:
- “Please check the note.”
- “Also tomorrow; the phrase is violet compass.”

Generated consult input was absent from pending voice background. After completing that consult, the next generated question omitted the clarification. The next actual model request retained the first generated prompt exactly once and included the clarification **after** the first answer.

The first **three contiguous actual Responses input items**, through the first generated consult, replayed exactly. The first/second requests contained four/seven input items; the answer appeared at index 3 and the clarification at index 4.

This is deliberately a **consult-containing conversation-prefix** claim. The provider rebuilds a trailing temporary per-turn runtime-context item. This report does not claim equality of the entire first request, system instructions, tool definitions or headers. No live provider, paid inference or microphone/audio behavior was tested by this synthetic source-build lane.

## Stable data survival

[Run 39930703485](https://github.com/khensthoth/openclaw/actions/runs/39930703485) **passed** from published `openclaw@2026.10.6` to source candidate `98239851`, using the native updater. The published baseline created the synthetic conversation before updating.

The active Gateway returned the typed question, assistant answer and genuine spoken “silver mango” clarification in order. Legacy generated input stayed hidden, and no model was called by the history probe. Raw stored-message survival assertions also passed.

Candidate and installed build identities match exactly. All **18,522 application files** have identical hashes. Inventory digest: `5c850e1f2739482701d16cc87cf620aa2b1dc7fe083a92f0286344acc889f2c8`; candidate tarball SHA-256: `69894451319763b4723ff8e0cab139e33f30698c0fdb9907de5eeacc1a0789b6`.

Both manifests declare 2026.10.6, so build identity plus the complete file inventory—not the version string—establish candidate activation. The two current-source upgrade fixture files also passed all **93 tests**. Latest stable was rechecked against the official release metadata at 2026-10-23T09:59:51Z and remains `v2026.10.6`.

The earlier **2026.10.5** synthetic mixed-data upgrade also passed with exact candidate build identity and identical 18,119-file application inventories. That remains historical proof in [stable-2026.10.5-upgrade.json](stable-2026.10.5-upgrade.json); it is not presented as the final head's latest-stable run.

## Failures retained and explained

Earlier setup/fixture failures are not counted as behavioral regression evidence. The initial producer callback lacked its runtime config; the native reconnect fixture incorrectly expected a revoked requester-final binding to transfer. Those fixtures were repaired before the strict upstream-base and 134-test run passed.

The first full runtime attempt omitted private QA build entries and timed out rebuilding during startup. The corrected runtime then exposed the real pre-consult folding defect described above. One copied workflow selected Node 24.21.0 after integrating source requiring 24.22.1; its corrected run is the passing runtime proof linked here.

An earlier latest-stable attempt had an unsupported Node 24.22.0 runner. After qualifying the runtime, it installed stable 2026.10.6 but attempted candidate 2026.10.5, triggering future-config protection. That was a downgrade attempt, not data-compatibility proof. The final candidate uses upstream's native 2026.10.6 identity; no downgrade/config safeguard was disabled.

## Earlier live observations and remaining decision

The [22 October redacted live report](https://github.com/khensthoth/openclaw/blob/499bfbe1547071b8a8dc67dbbb416484f72e34ce/evidence/talk-consult-prompt-cache/2026-10-22/README.md) covers actual OpenAI/GPT and Google/Gemini Talk routes with Anthropic Claude. Individual follow-up first requests showed 96.3%, 97.5% and 97.8% cached input, plus genuine clarification and mixed-chat recall. These observations came from a compiled-JavaScript port on an existing patched beta image, not a complete source build or a guaranteed before/after saving. The manual reconnect attempt was inconclusive; the source-built pending test above supplies deterministic coverage.

Fresh independent reviews found no P0–P2 findings in the scoped repair and proof. The shared autoreview CLI is unavailable on the server; no helper-isolated autoreview run is claimed.

**Maintainer approval of scoped generated-consult retention remains open**, because it changes the earlier decision in #135423. The [owner decision request](https://github.com/openclaw/openclaw/pull/179237#issuecomment-6354621771) remains separate from technical proof.

Chief and its live configuration, data, volumes, environment and image were untouched during this work. All new receipts use synthetic state; private conversations, keys, tokens, private endpoints and actual model identifiers are omitted.
