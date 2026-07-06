import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export default function Pagination({
  page,
  totalPages,
  total,
  label = 'items',
  loading = false,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border mt-4">
      <span className="text-caption text-fg-muted">
        Page {page} of {totalPages} · {total} {label}
      </span>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="border-border"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>

        {getPageNumbers().map((pageNum) => {
          const isCurrent = pageNum === page;
          return (
            <Button
              key={pageNum}
              variant={isCurrent ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              disabled={loading}
              className={
                isCurrent
                  ? 'bg-brand-600 hover:bg-brand-700 text-white border-brand-600'
                  : 'border-border'
              }
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="border-border"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
