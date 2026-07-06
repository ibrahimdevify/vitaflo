import { Check, ChevronDown, Filter, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';

const filterOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'true', label: 'Specialist' },
  { value: 'false', label: 'Non-Specialist' },
];

export default function CliniciansFilters({
  search,
  onSearchChange,
  filterSpecialist,
  onFilterSpecialistChange,
}) {
  const selected = filterOptions.find((o) => o.value === filterSpecialist);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-48 sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
        <Input
          placeholder="Search clinicians..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
            <Filter className="h-3.5 w-3.5" />
            {selected?.label || 'All Types'}
            <ChevronDown className="h-3 w-3 ml-1" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          {filterOptions.map((o) => (
            <DropdownMenuItem
              key={o.value}
              onClick={() => onFilterSpecialistChange(o.value)}
              className={cn(
                'cursor-pointer',
                filterSpecialist === o.value && 'bg-surface-raised font-medium'
              )}
            >
              {o.label}
              {filterSpecialist === o.value && (
                <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
