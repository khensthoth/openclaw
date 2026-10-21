import { asOptionalObjectRecord } from "@openclaw/normalization-core/record-coerce";
import { buildRunUserTurnIdempotencyKey } from "../../../sessions/user-turn-transcript.metadata.js";
import type { AgentMessage } from "../../runtime/index.js";

function readMessageRunId(message: AgentMessage): string | undefined {
  const runId = asOptionalObjectRecord(Reflect.get(message, "__openclaw"))?.runId;
  return typeof runId === "string" && runId ? runId : undefined;
}

function isTalkRealtimeVoiceMessage(message: AgentMessage): boolean {
  if (message.role !== "user" && message.role !== "assistant") {
    return false;
  }
  const provenance = asOptionalObjectRecord(Reflect.get(message, "provenance"));
  return provenance?.kind === "realtime_voice" && provenance.sourceChannel === "talk";
}

/** Hidden prompts a run generated for itself, such as Talk consult requests. */
export function omitHiddenGeneratedRunInputs(messages: AgentMessage[]): AgentMessage[] {
  const runUserKeys = new Set(
    messages.flatMap((message) => {
      const runId = readMessageRunId(message);
      return runId ? [buildRunUserTurnIdempotencyKey(runId)] : [];
    }),
  );
  return messages.filter((message) => {
    const key = message.role === "user" ? Reflect.get(message, "idempotencyKey") : undefined;
    return !(
      typeof key === "string" &&
      runUserKeys.has(key) &&
      Reflect.get(message, "display") === false
    );
  });
}

/**
 * Talk speech rows are appended while a run is open, so that run's requests never contained
 * them. Its keyed prompt and answer already carry the exchange; replaying rows recorded inside
 * the run would rewrite the provider prefix its requests cached.
 */
export function omitTalkVoiceMessagesInsideRuns(messages: AgentMessage[]): AgentMessage[] {
  if (!messages.some(isTalkRealtimeVoiceMessage)) {
    return messages;
  }
  const lastIndexByRun = new Map<string, number>();
  messages.forEach((message, index) => {
    const runId = readMessageRunId(message);
    if (runId) {
      lastIndexByRun.set(runId, index);
    }
  });
  const runByUserKey = new Map(
    [...lastIndexByRun.keys()].map((runId) => [buildRunUserTurnIdempotencyKey(runId), runId]),
  );
  let openUntil = -1;
  const kept = messages.filter((message, index) => {
    const userKey = message.role === "user" ? Reflect.get(message, "idempotencyKey") : undefined;
    const runId =
      readMessageRunId(message) ??
      (typeof userKey === "string" ? runByUserKey.get(userKey) : undefined);
    if (runId) {
      openUntil = Math.max(openUntil, lastIndexByRun.get(runId) ?? -1);
    }
    return !(index < openUntil && isTalkRealtimeVoiceMessage(message));
  });
  return kept.length === messages.length ? messages : kept;
}
