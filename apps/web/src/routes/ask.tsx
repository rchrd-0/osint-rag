import { useChat } from "@ai-sdk/react";
import { env } from "@osint-rag/env/web";
import { Button } from "@osint-rag/ui/components/button";
import { Card, CardContent, CardFooter } from "@osint-rag/ui/components/card";
import { Input } from "@osint-rag/ui/components/input";
import { cn } from "@osint-rag/ui/lib/utils";
import { PaperPlaneRightIcon, StopIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { type SubmitEventHandler, useState } from "react";
import { RagChatMessages } from "@/components/rag-chat-messages";
import { type RagRetrievalStrategy, RagStrategySelector } from "@/components/rag-strategy-selector";
import { createRagChatTransport, type RagChatMessage } from "@/lib/rag-chat";

export const Route = createFileRoute("/ask")({
  component: RouteComponent,
});

const RETRIEVAL_LIMIT = 5;

function RouteComponent() {
  const [input, setInput] = useState("");
  const [strategy, setStrategy] = useState<RagRetrievalStrategy>("vector");

  const { sendMessage, messages, status, error, stop } = useChat<RagChatMessage>({
    transport: createRagChatTransport(`${env.VITE_SERVER_URL}/rag/stream`),
  });
  const isBusy = status === "streaming" || status === "submitted";

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const query = input.trim();
    if (!query || isBusy) {
      return;
    }

    sendMessage(
      { text: query },
      {
        body: {
          limit: RETRIEVAL_LIMIT,
          strategy,
        },
      },
    );
    setInput("");
  };

  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 py-0">
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden py-4 pr-1 pl-4">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]">
          {/* <div className="pr-2"> */}
          <RagChatMessages messages={messages} isStreaming={status === "streaming"} />
          {/* </div> */}
        </div>
      </CardContent>

      <CardFooter className="mt-auto shrink-0 flex-col items-stretch gap-4 bg-card">
        {error ? (
          <div className="border border-destructive/50 bg-destructive/5 p-4 text-destructive text-sm">
            {error.message || "Something went wrong while generating an answer."}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="What would you like to know?"
            disabled={isBusy}
            autoFocus
            className="min-w-0 flex-1"
          />
          {isBusy ? (
            <Button type="button" variant="outline" onClick={stop}>
              <StopIcon />
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <PaperPlaneRightIcon />
              Ask
            </Button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <RagStrategySelector value={strategy} onChange={setStrategy} disabled={isBusy} />
          <span className="text-muted-foreground text-xs">
            {strategy === "vector"
              ? "Matches meaning and paraphrases."
              : "Matches keywords in chunk text."}
          </span>
        </div>

        <p
          className={cn(
            "text-muted-foreground text-xs",
            status === "ready" && !messages.length && "sr-only",
          )}
        >
          {status === "submitted"
            ? "Retrieving sources..."
            : status === "streaming"
              ? "Generating answer..."
              : "Answers cite retrieved sources and stay within the provided context."}
        </p>
      </CardFooter>
    </Card>
  );
}
