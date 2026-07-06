import { Activity, Calendar, TrendingUp, UserRound } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import SpirometryTableSkeleton from './SpirometryTableSkeleton';

export default function SpirometryTable({
  data,
  loading,
  onViewPatient,
  getLatestBlow,
}) {
  if (loading) return <SpirometryTableSkeleton />;

  if (!data?.length) {
    return (
      <EmptyState
        icon={Activity}
        title="No spirometry data found"
        description="Try adjusting your search"
      />
    );
  }

  const getFEV1BadgeVariant = (value) => {
    if (!value) return null;
    if (value >= 80) return 'success';
    if (value >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Patient ID</TableHead>
            <TableHead>FEV1 (L)</TableHead>
            <TableHead>FVC (L)</TableHead>
            <TableHead>PEFR</TableHead>
            <TableHead>FEV1%</TableHead>
            <TableHead>Last Blow</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((s, i) => {
            const userId = s.observation?.user_id;
            return (
              <TableRow key={s.id || i}>
                <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                  <Calendar className="h-3 w-3 inline mr-1.5" />
                  {new Date(s.dbdate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <UserRound className="h-3 w-3 text-fg-muted" />
                    <span className="text-body font-mono text-fg">
                      {userId || 'N/A'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-fg tabular-nums">
                  {s.fev1?.toFixed(2) || '—'}
                </TableCell>
                <TableCell className="tabular-nums">
                  {s.fvc?.toFixed(2) || '—'}
                </TableCell>
                <TableCell className="tabular-nums">
                  {s.pefr?.toFixed(0) || '—'}
                </TableCell>
                <TableCell>
                  {s.fev1_perc ? (
                    <Badge variant={getFEV1BadgeVariant(s.fev1_perc)}>
                      {s.fev1_perc.toFixed(0)}%
                    </Badge>
                  ) : (
                    <span className="text-fg-muted">—</span>
                  )}
                </TableCell>
                <TableCell className="text-caption text-fg-muted">
                  {getLatestBlow(userId)}
                </TableCell>
                <TableCell>
                  <div
                    className="inline-flex items-center justify-center h-8 w-8 rounded-(--radius-control) cursor-pointer hover:bg-surface-raised transition-colors"
                    onClick={() => onViewPatient(userId)}
                    title="View trends"
                  >
                    <TrendingUp className="h-4 w-4 text-brand-600" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
