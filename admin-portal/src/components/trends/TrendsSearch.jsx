import { Filter, Loader2, Search, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';

const presets = [
  {
    label: '1M',
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  },
  {
    label: '3M',
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  },
  {
    label: '6M',
    start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  },
  {
    label: '1Y',
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  },
  { label: 'All', start: '2020-01-01' },
];

export default function TrendsSearch({
  userId,
  onUserIdChange,
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
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
              <Input
                placeholder="Patient ID, Username, or Email..."
                value={userId}
                onChange={(e) => onUserIdChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Button onClick={onSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Loading...' : 'Load Trends'}
            </Button>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-caption text-fg-muted font-medium">
              <Filter className="h-3.5 w-3.5" /> Date Range:
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
            <div className="flex gap-1 ml-2">
              {presets.map((p) => (
                <Button
                  key={p.label}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-caption border-border"
                  onClick={() =>
                    onDateRangeChange((prev) => ({ ...prev, start: p.start }))
                  }
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-caption text-fg-muted mt-2">
          Supports: Patient ID, Username, or Email
        </p>
      </CardContent>
    </Card>
  );
}
