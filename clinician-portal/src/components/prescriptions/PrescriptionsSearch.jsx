import { ClipboardList, Filter, Plus, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export default function PrescriptionsSearch({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  loading,
  patientId,
  onSearch,
  onToggleForm,
  showForm,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch(1);
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
              <Input
                placeholder="Search by Patient ID, Username, or Email..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Button onClick={() => onSearch(1)} disabled={loading}>
              <ClipboardList className="h-4 w-4 mr-2" />
              {loading ? 'Loading...' : 'Load'}
            </Button>
            {patientId && (
              <Button
                variant="outline"
                onClick={onToggleForm}
                className="border-border gap-2"
              >
                <Plus className="h-4 w-4" />
                {showForm ? 'Cancel' : 'New Prescription'}
              </Button>
            )}
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-caption text-fg-muted font-medium">
              <Filter className="h-3.5 w-3.5" />
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
              className="w-40 h-9 text-caption"
            />
            <span className="text-caption text-fg-muted">to</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                onDateRangeChange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-40 h-9 text-caption"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearch(1)}
              className="text-brand-600 hover:text-brand-700"
            >
              Apply Filter
            </Button>
          </div>
        </div>
        <p className="text-caption text-fg-muted mt-2">
          Supports: Patient ID, Username, or Email address
        </p>
      </CardContent>
    </Card>
  );
}
