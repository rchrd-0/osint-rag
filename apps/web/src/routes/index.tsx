import { Skeleton } from "@osint-rag/ui/components/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { DocumentsTable } from "@/components/documents-table";
import { useGetAllDocuments } from "@/hooks/query/useGetAllDocuments";

const documentsTableSkeletonRows = ["row-1", "row-2", "row-3", "row-4", "row-5"] as const;

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { data: documents, error, isLoading } = useGetAllDocuments();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-medium text-lg">Documents</h2>
              <p className="text-muted-foreground text-sm">
                Basic document inventory from the ingestion pipeline.
              </p>
            </div>
            <div className="text-muted-foreground text-sm">
              {documents?.length ?? 0} document{documents?.length === 1 ? "" : "s"}
            </div>
          </div>

          {isLoading ? (
            <DocumentsTableSkeleton />
          ) : error ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-destructive text-sm">
              Failed to load documents.
            </div>
          ) : (
            <DocumentsTable documents={documents ?? []} />
          )}
        </section>
      </div>
    </div>
  );
}

function DocumentsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="border-b px-4 py-3">
        <Skeleton className="h-4 w-full max-w-55" />
      </div>
      <div className="grid">
        {documentsTableSkeletonRows.map((rowId) => (
          <div
            key={rowId}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_140px] gap-4 border-b px-4 py-4 last:border-b-0"
          >
            <Skeleton className="h-4 w-full max-w-[320px]" />
            <Skeleton className="h-4 w-full max-w-30" />
            <Skeleton className="h-4 w-full max-w-25" />
          </div>
        ))}
      </div>
    </div>
  );
}
