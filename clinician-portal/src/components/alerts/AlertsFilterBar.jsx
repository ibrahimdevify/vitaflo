import { Check, CheckCircle, ChevronDown, Filter, Search } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';

const filterOptions = {
  all: 'All alerts',
  unread: 'Unread only',
  read: 'Read only',
};

export default function AlertsFilterBar({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  filterRead,
  onFilterReadChange,
  loading,
  unreadCount,
  onSearch,
  onMarkAllAsRead,
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
              <Input
                placeholder="Search alerts by message or patient name..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(1)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => onSearch(1)} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-caption text-fg-muted font-medium">
              <Filter className="h-3.5 w-3.5" />
              Filters
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* 🔧 Div instead of Button — no nested <button> */}
                <div className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                  <Filter className="h-3.5 w-3.5" />
                  {filterOptions[filterRead]}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                {Object.entries(filterOptions).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => onFilterReadChange(key)}
                    className={cn(
                      'cursor-pointer',
                      filterRead === key && 'bg-surface-raised font-medium'
                    )}
                  >
                    {label}
                    {filterRead === key && (
                      <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearch(1)}
              className="text-brand-600 hover:text-brand-700"
            >
              Apply filters
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
                className="ml-auto border-border text-fg hover:bg-surface-raised"
              >
                <CheckCircle className="h-4 w-4 mr-1.5 text-success" />
                Mark all read
                <Badge variant="secondary" className="ml-1.5">
                  {unreadCount}
                </Badge>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
