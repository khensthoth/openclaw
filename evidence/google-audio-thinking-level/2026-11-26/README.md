# Runtime proof: Google audio transcription honours `providerOptions.google.thinkingLevel`

For openclaw/openclaw#205949 (issue #181086). PR head: `ffede383a` on base `a48488cc6`.

## What was run

The source-built CLI (`pnpm openclaw`, full `build-all` from this checkout, Windows 11, Node 24.22.3), with isolated config and state:

```sh
OPENCLAW_CONFIG_PATH=openclaw.json OPENCLAW_STATE_DIR=<empty dir> \
NODE_OPTIONS=--import=<this dir>/capture-gemini.mjs \
pnpm openclaw infer audio transcribe --file order-note.wav --json
```

- `openclaw.json` holds one `tools.media.models[]` entry: `provider: "google"`, `model: "gemini-4-neon"`, `providerOptions.google.thinkingLevel: "low"`. There is no `--model` flag, so the request goes through the normal configured-entry path (`resolveProviderQuery` → Google provider).
- `order-note.wav` is a synthetic 30 s English clip made with Windows text-to-speech. It is not customer audio.
- `capture-gemini.mjs` records each Gemini `generateContent` request body with the audio bytes replaced by their length and no headers, so the API key is not written. OpenClaw's guarded fetch only calls an injected fetch when it looks like a test mock, so the wrapper is marked as one and forwards live requests through the checkout's own undici `fetch` with OpenClaw's dispatcher. The request body and URL are OpenClaw's own.

## Results

| Run  | File            | Gemini                                  | What it shows                                                                                                                               |
| ---- | --------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Stub | `stub-run.json` | not called                              | The body OpenClaw builds contains `generationConfig.thinkingConfig.thinkingLevel: "low"`                                                    |
| Live | `live-run.json` | HTTP 200, `modelVersion: gemini-4-neon` | Gemini accepts that body for inline audio. Transcript is exact. `usageMetadata.thoughtsTokenCount: 175`, 33 output tokens, 340 audio tokens |

The live run made one call (latency 37.5 s, including the upload from this connection). It is a contract check, not a benchmark. The speed and cost comparison is in the PR description (77 real notes, run outside OpenClaw with the same request shape).

Not covered: a Gateway run with a channel attachment, video description (not wired; see the PR), and `thinkingBudget` against the live API (covered by unit tests only).
