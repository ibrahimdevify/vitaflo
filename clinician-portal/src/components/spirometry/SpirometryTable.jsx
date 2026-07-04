import { Activity } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import EmptyState from '../shared/EmptyState';
import SpirometryTableSkeleton from './SpirometryTableSkeleton';

export default function SpirometryTable({ data, loading }) {
  if (loading) return <SpirometryTableSkeleton />;

  if (!data?.length) {
    return (
      <EmptyState
        icon={Activity}
        title="No spirometry data found"
        description="Try a different date range or patient"
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
            <TableHead>FEV1 (L)</TableHead>
            <TableHead>FVC (L)</TableHead>
            <TableHead>PEFR</TableHead>
            <TableHead>FEF25-75</TableHead>
            <TableHead>FEV6</TableHead>
            <TableHead>FEV1%</TableHead>
            <TableHead>Quality</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((s, i) => (
            <TableRow key={s.id || i}>
              <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                {new Date(s.dbdate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: '2-digit',
                })}
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
              <TableCell className="tabular-nums">
                {s.fef2575?.toFixed(2) || '—'}
              </TableCell>
              <TableCell className="tabular-nums">
                {s.fev6?.toFixed(2) || '—'}
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
                {s.quality_message || s.symptom || 'Good'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
