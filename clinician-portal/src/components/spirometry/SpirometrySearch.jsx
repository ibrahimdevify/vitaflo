import { Activity, ArrowDownAZ, ArrowUpAZ, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export default function SpirometrySearch({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  loading,
  onSearch,
  order = "desc",
  onOrderChange,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
           <Input
  placeholder="Filter by Patient Username, email or phone (optional)..."
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

          {/* ✅ Sort order control — plain native <select>, styled to match Input */}
          {typeof onOrderChange === "function" && (
            <div className="relative w-40">
              {order === "asc" ? (
                <ArrowUpAZ className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-muted pointer-events-none" />
              ) : (
                <ArrowDownAZ className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-muted pointer-events-none" />
              )}
              <select
                value={order}
                onChange={(e) => onOrderChange(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-(--radius-control) border border-border bg-surface text-caption text-fg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
          )}

         <Button onClick={onSearch} disabled={loading}>
  <Activity className="h-4 w-4 mr-2" />
  {loading ? "Loading..." : "Filter"}
</Button>
        </div>
        <p className="text-caption text-fg-muted mt-2">
          Supports: Patient Username, email or phone
        </p>
      </CardContent>
    </Card>
  );
}