import { Brain, Search } from 'lucide-react';
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
import PredictedTableSkeleton from './PredictedTableSkeleton';

export default function PredictedTable({ data, loading, hasSearched }) {
  if (loading) return <PredictedTableSkeleton />;

  if (!data?.length) {
    return hasSearched ? (
      <EmptyState
        icon={Brain}
        title="No predicted values found"
        description='Click "Add Prediction" to create one'
      />
    ) : (
      <EmptyState
        icon={Search}
        title="Enter a Patient ID to view predictions"
        description="Supports: Patient ID, Username, or Email"
      />
    );
  }

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Variable</TableHead>
            <TableHead>Predicted</TableHead>
            <TableHead>LLN</TableHead>
            <TableHead>ULN</TableHead>
            <TableHead>Z-Score</TableHead>
            <TableHead>% Predicted</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p, i) => (
            <TableRow key={p.id || i}>
              <TableCell>
                <Badge variant="outline" className="font-mono text-caption">
                  {p.variable}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-fg tabular-nums">
                {p.predicted?.toFixed(2) || '—'}
              </TableCell>
              <TableCell className="tabular-nums">
                {p.lln?.toFixed(2) || '—'}
              </TableCell>
              <TableCell className="tabular-nums">
                {p.uln?.toFixed(2) || '—'}
              </TableCell>
              <TableCell className="tabular-nums">
                {p.z_score?.toFixed(2) || '—'}
              </TableCell>
              <TableCell>
                {p.percent_predicted ? (
                  <Badge
                    variant={
                      p.percent_predicted >= 80
                        ? 'success'
                        : p.percent_predicted >= 60
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {p.percent_predicted}%
                  </Badge>
                ) : (
                  <span className="text-fg-muted">—</span>
                )}
              </TableCell>
              <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                {new Date(p.created).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: '2-digit',
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
