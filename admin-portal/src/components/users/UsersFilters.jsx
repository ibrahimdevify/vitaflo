import { Check, ChevronDown, Filter, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';

export default function UsersFilters({
  search,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
  userTypes,
  userStatuses,
}) {
  const selectedType = userTypes.find((t) => t.ut_id === Number(filterType));
  const selectedStatus = userStatuses.find(
    (s) => s.us_id === Number(filterStatus)
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-48 sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
            <Filter className="h-3.5 w-3.5" />
            {filterType === 'all'
              ? 'All Types'
              : selectedType?.name || 'Unknown'}
            <ChevronDown className="h-3 w-3 ml-1" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem
            onClick={() => onFilterTypeChange('all')}
            className={cn(
              'cursor-pointer',
              filterType === 'all' && 'bg-surface-raised font-medium'
            )}
          >
            All Types
            {filterType === 'all' && (
              <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
            )}
          </DropdownMenuItem>
          {userTypes.map((t) => (
            <DropdownMenuItem
              key={t.ut_id}
              onClick={() => onFilterTypeChange(String(t.ut_id))}
              className={cn(
                'cursor-pointer',
                filterType === String(t.ut_id) &&
                  'bg-surface-raised font-medium'
              )}
            >
              {t.name}
              {filterType === String(t.ut_id) && (
                <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
            <Filter className="h-3.5 w-3.5" />
            {filterStatus === 'all'
              ? 'All Status'
              : selectedStatus?.name || 'Unknown'}
            <ChevronDown className="h-3 w-3 ml-1" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem
            onClick={() => onFilterStatusChange('all')}
            className={cn(
              'cursor-pointer',
              filterStatus === 'all' && 'bg-surface-raised font-medium'
            )}
          >
            All Status
            {filterStatus === 'all' && (
              <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
            )}
          </DropdownMenuItem>
          {userStatuses.map((s) => (
            <DropdownMenuItem
              key={s.us_id}
              onClick={() => onFilterStatusChange(String(s.us_id))}
              className={cn(
                'cursor-pointer',
                filterStatus === String(s.us_id) &&
                  'bg-surface-raised font-medium'
              )}
            >
              {s.name}
              {filterStatus === String(s.us_id) && (
                <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
