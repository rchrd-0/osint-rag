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
import { useCallback, useMemo } from "react";
import { DocumentsTable } from "@/components/documents-table";
import { useInfiniteDocuments } from "@/hooks/query/useInfiniteDocuments";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const {
    data,
    error,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteDocuments();

  const documents = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const totalCount = data?.pages[0]?.totalCount;
  const loadedCount = documents.length;

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useIntersectionObserver({
    enabled: Boolean(hasNextPage) && !isLoading && !error,
    onIntersect: loadMore,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardAction>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <ArrowCounterClockwiseIcon className={cn(isFetching && "animate-spin")} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-right text-muted-foreground text-sm">
          {totalCount === undefined
            ? `${loadedCount} document${loadedCount === 1 ? "" : "s"}`
            : `Showing ${loadedCount} of ${totalCount} document${totalCount === 1 ? "" : "s"}`}
        </div>
        {isLoading ? (
          <DocumentsTableSkeleton />
        ) : error ? (
          <div className="border border-destructive/50 bg-destructive/5 p-4 text-destructive text-sm">
            Failed to load documents.
          </div>
        ) : (
          <>
            <DocumentsTable documents={documents} />
            <div ref={loadMoreRef} className="py-4">
              {isFetchingNextPage ? (
                <DocumentsTableSkeleton rows={2} />
              ) : hasNextPage ? (
                <p className="text-center text-muted-foreground text-xs">Scroll for more</p>
              ) : loadedCount > 0 ? (
                <p className="text-center text-muted-foreground text-xs">All documents loaded</p>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DocumentsTableSkeleton({ rows = 5 }: { rows?: number }) {
  const rowIds = useMemo(
    () => Array.from({ length: rows }, (_, index) => `row-${index + 1}`),
    [rows],
  );

  return (
    <div className="overflow-hidden">
      <div className="border-b px-4 py-3">
        <Skeleton className="h-4 w-full max-w-55" />
      </div>
      <div className="grid">
        {rowIds.map((rowId) => (
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
