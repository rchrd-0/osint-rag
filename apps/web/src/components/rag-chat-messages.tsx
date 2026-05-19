import { Skeleton } from "@osint-rag/ui/components/skeleton";
import { RagSources } from "@/components/rag-sources";
import type { RagChatMessage } from "@/lib/rag-chat";
import {
  getMessageGenerationMs,
  getMessageRetrievalMs,
  getMessageSources,
  getMessageText,
} from "@/lib/rag-chat";

type RagChatMessagesProps = {
  messages: RagChatMessage[];
  isStreaming: boolean;
};

export function RagChatMessages({ messages, isStreaming }: RagChatMessagesProps) {
  if (!messages.length) {
    return (
      <p className="text-muted-foreground text-sm">
        Ask a question to search the ingested document collection and generate a grounded answer.
      </p>
    );
  }

  return (
    <div className="space-y-8 pr-4">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
        const showAssistantPending =
          message.role === "assistant" && isLastMessage && isStreaming && !getMessageText(message);

        if (message.role === "user") {
          return (
            <article key={message.id} className="flex justify-end">
              <div className="max-w-[85%] border bg-primary/10 px-4 py-3 text-sm">
                {getMessageText(message)}
              </div>
            </article>
          );
        }

        const sources = getMessageSources(message);
        const answer = getMessageText(message);
        const generationMs = getMessageGenerationMs(message);

        return (
          <article key={message.id} className="space-y-5">
            <RagSources sources={sources} retrievalMs={getMessageRetrievalMs(message)} />
            {answer ? (
              <div className="space-y-2">
                {generationMs != null && generationMs > 0 ? (
                  <div className="flex justify-end text-muted-foreground text-xs">
                    <span>Generated in {generationMs}ms</span>
                  </div>
                ) : null}
                <div className="whitespace-pre-wrap border bg-background px-4 py-3 text-sm">
                  {answer}
                </div>
              </div>
            ) : showAssistantPending ? (
              <AssistantAnswerSkeleton />
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function AssistantAnswerSkeleton() {
  return (
    <div className="space-y-2 border px-4 py-4">
      <Skeleton className="h-4 w-full max-w-[520px]" />
      <Skeleton className="h-4 w-full max-w-[460px]" />
      <Skeleton className="h-4 w-full max-w-[380px]" />
    </div>
  );
}
