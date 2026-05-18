import { Skeleton } from "@osint-rag/ui/components/skeleton";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useGetDocumentById } from "@/hooks/query/useGetDocumentById";

const documentDetailSkeletonLines = [
  { id: "line-1", className: "h-4 w-full" },
  { id: "line-2", className: "h-4 w-full" },
  { id: "line-3", className: "h-4 w-full" },
  { id: "line-4", className: "h-4 w-full" },
  { id: "line-5", className: "h-4 w-full" },
  { id: "line-6", className: "h-4 w-full" },
  { id: "line-7", className: "h-4 w-full" },
  { id: "line-8", className: "h-4 w-3/4" },
] as const;

export const Route = createFileRoute("/documents/$documentId")({
  component: DocumentRoute,
});

function DocumentRoute() {
  const { documentId } = Route.useParams();
  const { data: document, error, isLoading } = useGetDocumentById(documentId);

  if (isLoading) {
    return <DocumentDetailSkeleton />;
  }

  if (error || !document) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="grid gap-4">
          <Link to="/" className="text-primary text-sm underline-offset-4 hover:underline">
            Back to documents
          </Link>
          <div className="border border-destructive/50 bg-destructive/5 p-4 text-destructive text-sm">
            Failed to load document.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Link to="/" className="text-primary text-sm underline-offset-4 hover:underline">
            Back to documents
          </Link>
          <div className="border p-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <h1 className="font-semibold text-2xl">{document.title}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm">
                  <span>Source: {document.sourceName ?? document.sourceType}</span>
                  <span>Author: {document.author ?? "Unknown"}</span>
                  <span>
                    Published:{" "}
                    {document.publishedAt
                      ? new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(document.publishedAt))
                      : "Unknown"}
                  </span>
                </div>
              </div>

              {document.url ? (
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit text-primary text-sm underline-offset-4 hover:underline"
                >
                  Open original article
                </a>
              ) : null}

              <div className="border bg-muted/20 p-4">
                <p className="whitespace-pre-wrap text-sm leading-7">{document.rawText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-32" />
          <div className="border p-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Skeleton className="h-8 w-full max-w-135" />
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>

              <Skeleton className="h-4 w-40" />

              <div className="border bg-muted/20 p-4">
                <div className="grid gap-3">
                  {documentDetailSkeletonLines.map((line) => (
                    <Skeleton key={line.id} className={line.className} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
