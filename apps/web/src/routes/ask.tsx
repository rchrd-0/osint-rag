import { useChat } from "@ai-sdk/react";
import { env } from "@osint-rag/env/web";
import { Button } from "@osint-rag/ui/components/button";
import { Card, CardContent } from "@osint-rag/ui/components/card";
import { Input } from "@osint-rag/ui/components/input";
import { cn } from "@osint-rag/ui/lib/utils";
import { PaperPlaneRightIcon, StopIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { type SubmitEventHandler, useState } from "react";
import { RagChatMessages } from "@/components/rag-chat-messages";
import { createRagChatTransport, type RagChatMessage } from "@/lib/rag-chat";

export const Route = createFileRoute("/ask")({
  component: RouteComponent,
});

const RETRIEVAL_LIMIT = 5;

function RouteComponent() {
  const [input, setInput] = useState("");

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
        },
      },
    );
    setInput("");
  };

  return (
    <Card className="flex min-h-[70vh] flex-col">
      {/* <CardHeader>
        <CardTitle>Ask</CardTitle>
        <CardDescription>
          Ask a question grounded in the ingested document collection
        </CardDescription>
      </CardHeader> */}
      <CardContent className="flex min-h-0 flex-1 flex-col gap-6">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <RagChatMessages messages={messages} isStreaming={status === "streaming"} />
        </div>

        {error ? (
          <div className="border border-destructive/50 bg-destructive/5 p-4 text-destructive text-sm">
            {error.message || "Something went wrong while generating an answer."}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
      </CardContent>
    </Card>
  );
}
