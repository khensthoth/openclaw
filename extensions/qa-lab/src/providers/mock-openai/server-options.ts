import type { MockOpenAiRequestSnapshot } from "./mock-openai-contracts.js";

export type QaMockOpenAiServerOptions = {
  host?: string;
  port?: number;
  finalOnlyMarkerPauseMs?: number;
  /** External-provider fixture gate, reached before any response bytes are emitted. */
  beforeResponse?: (request: MockOpenAiRequestSnapshot) => Promise<void>;
  telegramChannelStreamingPause?: () => Promise<void>;
  modelRefs?: readonly string[];
  repeatedRequestResponsePauseMs?: number;
  repeatedRequestStalledResponsePauseMs?: number;
};
