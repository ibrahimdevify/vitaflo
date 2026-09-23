import { FileText, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export default function NotesSearch({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  loading,
  onSearch,
  canCreate = false,
  onToggleForm,
  showForm,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative min-w-0 flex-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />

                <Input
                  placeholder="Filter by Patient Username (optional)..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10"
                />
              </div>

              {/* Filter */}
              <Button
                size="default"
                onClick={onSearch}
                disabled={loading}
                className="shrink-0 flex-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                {loading ? 'Loading...' : 'Filter'}
              </Button>

              {/* Add Note */}
              {canCreate && (
                <Button
                  variant="outline"
                  onClick={onToggleForm}
                  className="shrink-0 gap-2 border-border flex-1"
                >
                  <FileText className="h-4 w-4" />
                  {showForm ? 'Cancel' : 'Add Note'}
                </Button>
              )}
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-caption text-fg-muted font-medium">
              Date Range:
            </span>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                onDateRangeChange((prev) => ({
                  ...prev,
                  start: e.target.value,
                }))
              }
              className="w-40 h-9 text-caption flex-1"
            />
            <span className="text-caption text-fg-muted">to</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                onDateRangeChange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-40 h-9 text-caption flex-1"
            />
            <Button variant="default" size="default" onClick={onSearch}>
              Apply Filter
            </Button>
          </div>
        </div>
        <p className="text-caption text-fg-muted mt-2">
          Showing all clinic patients — filter by username to narrow down
        </p>
      </CardContent>
    </Card>
  );
}
