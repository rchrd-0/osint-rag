import { Button } from "@osint-rag/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@osint-rag/ui/components/card";
import { Skeleton } from "@osint-rag/ui/components/skeleton";
import { cn } from "@osint-rag/ui/lib/utils";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocumentsTable } from "@/components/documents-table";
import { useGetAllDocuments } from "@/hooks/query/useGetAllDocuments";

const documentsTableSkeletonRows = ["row-1", "row-2", "row-3", "row-4", "row-5"] as const;

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { data: documents, error, isLoading, isFetching, refetch } = useGetAllDocuments();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        {/* <CardDescription className="flex items-center justify-between gap-4">
          Basic document inventory from the ingestion pipeline.
        </CardDescription> */}
        <CardAction>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <ArrowCounterClockwiseIcon className={cn(isFetching && "animate-spin")} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-right text-muted-foreground text-sm">
          {documents?.length ?? 0} document{documents?.length === 1 ? "" : "s"}
        </div>
        {isLoading ? (
          <DocumentsTableSkeleton />
        ) : error ? (
          <div className="border border-destructive/50 bg-destructive/5 p-4 text-destructive text-sm">
            Failed to load documents.
          </div>
        ) : (
          <DocumentsTable documents={documents ?? []} />
        )}
      </CardContent>
    </Card>
  );
}

function DocumentsTableSkeleton() {
  return (
    <div className="overflow-hidden">
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
