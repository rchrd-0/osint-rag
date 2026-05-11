import type { DocumentItem } from "@osint-rag/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@osint-rag/ui/components/table";
import { Link } from "@tanstack/react-router";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";

type DocumentsTableProps = {
  documents: DocumentItem[];
};

export function DocumentsTable({ documents }: DocumentsTableProps) {
  const columns = useMemo<ColumnDef<DocumentItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
          const document = row.original;

          return (
            <Link
              to="/documents/$documentId"
              params={{ documentId: document.id }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {document.title}
            </Link>
          );
        },
      },
      {
        accessorKey: "sourceName",
        header: "Source",
        cell: ({ row }) => row.original.sourceName ?? "Unknown",
      },
      {
        accessorKey: "publishedAt",
        header: "Published",
        cell: ({ row }) => {
          const publishedAt = row.original.publishedAt;
          if (!publishedAt) {
            return "-";
          }

          return new Intl.DateTimeFormat("en", {
            dateStyle: "medium",
          }).format(new Date(publishedAt));
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: documents,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
              No documents found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
