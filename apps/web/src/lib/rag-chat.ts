import type { QueryStrategy } from "@osint-rag/schemas";
import type { RagSource, RagStreamData } from "@osint-rag/types";
import { DefaultChatTransport, type UIMessage } from "ai";

export type RagChatMessage = UIMessage<never, RagStreamData>;

const DEFAULT_LIMIT = 5;
const DEFAULT_STRATEGY: QueryStrategy = "vector";

const isQueryStrategy = (value: unknown): value is QueryStrategy =>
  value === "naive" || value === "fts" || value === "vector";

const getLatestUserQuery = (messages: UIMessage[]): string => {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");

  if (!lastUserMessage) {
    return "";
  }

  return lastUserMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
};

export const createRagChatTransport = (api: string) =>
  new DefaultChatTransport<RagChatMessage>({
    api,
    prepareSendMessagesRequest: ({ messages, body }) => ({
      body: {
        query: getLatestUserQuery(messages),
        limit: typeof body?.limit === "number" ? body.limit : DEFAULT_LIMIT,
        strategy: isQueryStrategy(body?.strategy) ? body.strategy : DEFAULT_STRATEGY,
      },
    }),
  });

export const getMessageText = (message: RagChatMessage): string =>
  message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

export const getMessageSources = (message: RagChatMessage): RagSource[] => {
  const sourcesPart = message.parts.find((part) => part.type === "data-sources");

  if (!sourcesPart || sourcesPart.type !== "data-sources") {
    return [];
  }

  return sourcesPart.data.sources;
};

export const getMessageRetrievalMs = (message: RagChatMessage): number | null => {
  const sourcesPart = message.parts.find((part) => part.type === "data-sources");

  if (!sourcesPart || sourcesPart.type !== "data-sources") {
    return null;
  }

  return sourcesPart.data.retrievalMs;
};

export const getMessageGenerationMs = (message: RagChatMessage): number | null => {
  const metaPart = message.parts.find((part) => part.type === "data-meta");

  if (!metaPart || metaPart.type !== "data-meta") {
    return null;
  }

  return metaPart.data.latency.generationMs;
};
