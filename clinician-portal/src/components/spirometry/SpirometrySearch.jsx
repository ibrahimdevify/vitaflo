import { Activity, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export default function SpirometrySearch({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  loading,
  onSearch,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <Card>
      <CardContent className="p-5">
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
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                onDateRangeChange((prev) => ({
                  ...prev,
                  start: e.target.value,
                }))
              }
              className="w-36 h-9 text-caption"
            />
            <span className="text-caption text-fg-muted">to</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                onDateRangeChange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-36 h-9 text-caption"
            />
          </div>
          <Button onClick={onSearch} disabled={loading}>
            <Activity className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'View Spirometry'}
          </Button>
        </div>
        <p className="text-caption text-fg-muted mt-2">
          Supports: Patient ID, Username, or Email address
        </p>
      </CardContent>
    </Card>
  );
}
