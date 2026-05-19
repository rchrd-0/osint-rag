import type { RagSource } from "@osint-rag/types";
import { cn } from "@osint-rag/ui/lib/utils";

type RagSourcesProps = {
  sources: RagSource[];
  retrievalMs?: number | null;
  className?: string;
};

const formatPublishedAt = (publishedAt: string | null) => {
  if (!publishedAt) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(publishedAt));
};

export function RagSources({ sources, retrievalMs, className }: RagSourcesProps) {
  if (!sources.length) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
        <span className="font-medium text-foreground">Sources</span>
        {retrievalMs != null ? <span>Retrieved in {retrievalMs}ms</span> : null}
      </div>
      <ol className="space-y-3">
        {sources.map((source) => {
          const publishedLabel = formatPublishedAt(source.publishedAt);

          return (
            <li key={source.documentId} className="border bg-muted/20 px-4 py-3 text-sm leading-relaxed">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-medium text-muted-foreground">[{source.citation}]</span>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {source.title}
                  </a>
                ) : (
                  <span className="font-medium">{source.title}</span>
                )}
                {publishedLabel ? (
                  <span className="text-muted-foreground text-xs">{publishedLabel}</span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
