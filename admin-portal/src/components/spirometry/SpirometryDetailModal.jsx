import { Activity, TrendingUp, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import SpirometryChart from './SpirometryChart';

export default function SpirometryDetailModal({
  open,
  onClose,
  patientId,
  data,
  chartData,
  loading,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-(--z-modal) min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-card shadow-modal w-full max-w-4xl max-h-[85vh] overflow-auto m-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface rounded-t-card z-10">
          <h2 className="text-subheading font-bold text-fg flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            Patient #{patientId} — Spirometry
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-75 w-full rounded-card" />
              <Skeleton className="h-64 w-full rounded-card" />
            </div>
          ) : (
            <div className="space-y-6">
              {chartData.length > 0 && (
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Trends
                  </h3>
                  <SpirometryChart data={chartData} />
                </div>
              )}
              <div>
                <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-3">
                  Records ({data.length})
                </h3>
                {data.length > 0 ? (
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((s, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                              {new Date(s.dbdate).toLocaleDateString()}
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
                                <Badge
                                  variant={
                                    s.fev1_perc >= 80
                                      ? 'success'
                                      : s.fev1_perc >= 60
                                        ? 'warning'
                                        : 'danger'
                                  }
                                >
                                  {s.fev1_perc.toFixed(0)}%
                                </Badge>
                              ) : (
                                <span className="text-fg-muted">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="h-12 w-12 rounded-pill bg-surface-raised flex items-center justify-center mb-3">
                      <Activity className="h-5 w-5 text-fg-muted" />
                    </div>
                    <p className="text-body font-medium text-fg">
                      No records found for this patient
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
