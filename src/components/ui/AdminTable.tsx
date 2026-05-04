import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  primary?: boolean; // shown big on mobile cards
  hideOnMobile?: boolean;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function AdminTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  onRowClick,
  emptyMessage = "Nenhum item encontrado",
  className,
}: AdminTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={cn("p-8 text-center text-muted-foreground bg-card rounded-2xl border border-border/60", className)}>
        {emptyMessage}
      </div>
    );
  }

  const visibleMobile = columns.filter((c) => !c.hideOnMobile);

  return (
    <>
      {/* Mobile cards */}
      <div className={cn("md:hidden space-y-2.5", className)}>
        {data.map((item) => (
          <div
            key={String(item[keyField])}
            onClick={() => onRowClick?.(item)}
            className={cn(
              "bg-card border border-border/60 rounded-2xl p-4 shadow-sm transition-colors",
              onRowClick && "active:scale-[0.99] cursor-pointer hover:bg-muted/30"
            )}
          >
            <div className="space-y-1.5">
              {visibleMobile.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-xs font-medium text-muted-foreground shrink-0">{col.header || ""}</span>
                  <div className="text-right text-foreground min-w-0">
                    {col.render ? col.render(item) : item[col.key]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className={cn("hidden md:block overflow-x-auto", className)}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 text-left text-sm font-medium text-muted-foreground", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={String(item[keyField])}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-secondary/50 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 text-sm", col.className)}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <span className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
