import {
  Activity,
  ArrowDown,
  ArrowUp,
  Calendar,
  FileText,
  Loader2,
  TrendingUp,
  UserRound,
} from 'lucide-react';

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
  onViewReport,
  reportLoadingId,
  order = 'desc',
  onToggleOrder,
  showPatientColumn = true,
}) {
  // Loading state
  if (loading) {
    return <SpirometryTableSkeleton />;
  }

  // Empty state
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No spirometry data found"
        description="Try adjusting your search"
      />
    );
  }

  const getFEV1BadgeVariant = (value) => {
    const fev1Percent = Number(value);

    if (!Number.isFinite(fev1Percent)) {
      return null;
    }

    if (fev1Percent >= 80) return 'success';
    if (fev1Percent >= 60) return 'warning';

    return 'danger';
  };

  const formatDate = (date) => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    });
  };

  const formatNumber = (value, decimals = 2) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return '—';
    }

    return number.toFixed(decimals);
  };

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Date header — clickable to toggle sort order */}
            <TableHead>
              {typeof onToggleOrder === 'function' ? (
                <button
                  type="button"
                  onClick={onToggleOrder}
                  className="inline-flex items-center gap-1 cursor-pointer hover:text-fg transition-colors"
                  title={`Sorted ${order === 'desc' ? 'newest first' : 'oldest first'} — click to reverse`}
                >
                  Date
                  {order === 'desc' ? (
                    <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUp className="h-3 w-3" />
                  )}
                </button>
              ) : (
                'Date'
              )}
            </TableHead>

            {showPatientColumn ? (
              <TableHead>Patient</TableHead>
            ) : (
              <TableHead>Patient ID</TableHead>
            )}

            <TableHead>FEV1 (L)</TableHead>
            <TableHead>FVC (L)</TableHead>
            <TableHead>PEFR</TableHead>
            <TableHead>FEV1%</TableHead>
            <TableHead>Last Blow</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((s, i) => {
            // Safely get observation
            const observation = s?.observation || {};

            // Support both possible API structures
            const userId =
              observation?.user_id ??
              s?.user_id ??
              s?.userId ??
              s?.patient_id ??
              null;

            // Support observation_id from different possible structures
            const observationId =
              s?.observation_id ??
              observation?.id ??
              s?.observationId ??
              null;

            const isReportLoading =
              Boolean(onViewReport) &&
              reportLoadingId != null &&
              String(reportLoadingId) === String(observationId);

            const canViewPatient =
              Boolean(onViewPatient) && userId != null;

            const canViewReport =
              Boolean(onViewReport) && observationId != null;

            return (
              <TableRow key={s?.id ?? observationId ?? i}>
                {/* Date */}
                <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                  <Calendar className="h-3 w-3 inline mr-1.5" />
                  {formatDate(s?.dbdate ?? s?.date ?? s?.created_at)}
                </TableCell>

                {/* Patient — name (clinic-wide list) or plain ID (single-patient view) */}
                {showPatientColumn ? (
                  <TableCell>
                    <button
                      type="button"
                      disabled={!canViewPatient}
                      onClick={() =>
                        canViewPatient &&
                        onViewPatient(
                          userId,
                          s?.patient_name ?? s?.patient_username,
                        )
                      }
                      className={`flex items-center gap-1.5 text-left ${
                        canViewPatient
                          ? 'cursor-pointer hover:text-brand-600'
                          : ''
                      }`}
                      title={canViewPatient ? 'View this patient\u2019s trends' : undefined}
                    >
                      <UserRound className="h-3 w-3 text-fg-muted shrink-0" />
                      <span className="text-body text-fg">
                        {s?.patient_name ||
                          s?.patient_username ||
                          userId ||
                          'N/A'}
                      </span>
                    </button>
                  </TableCell>
                ) : (
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <UserRound className="h-3 w-3 text-fg-muted" />
                      <span className="text-body font-mono text-fg">
                        {userId ?? 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                )}

                {/* FEV1 */}
                <TableCell className="font-medium text-fg tabular-nums">
                  {formatNumber(s?.fev1, 2)}
                </TableCell>

                {/* FVC */}
                <TableCell className="tabular-nums">
                  {formatNumber(s?.fvc, 2)}
                </TableCell>

                {/* PEFR */}
                <TableCell className="tabular-nums">
                  {formatNumber(s?.pefr, 0)}
                </TableCell>

                {/* FEV1 % */}
                <TableCell>
                  {s?.fev1_perc != null &&
                  Number.isFinite(Number(s.fev1_perc)) ? (
                    <Badge variant={getFEV1BadgeVariant(s.fev1_perc)}>
                      {Number(s.fev1_perc).toFixed(0)}%
                    </Badge>
                  ) : (
                    <span className="text-fg-muted">—</span>
                  )}
                </TableCell>

                {/* Last Blow */}
                <TableCell className="text-caption text-fg-muted">
                  {userId != null && typeof getLatestBlow === 'function'
                    ? getLatestBlow(userId)
                    : '—'}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    {/* View Trends */}
                    {canViewPatient && (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-(--radius-control) cursor-pointer hover:bg-surface-raised transition-colors"
                        onClick={() =>
                          onViewPatient(
                            userId,
                            s?.patient_name ?? s?.patient_username,
                          )
                        }
                        title="View trends"
                      >
                        <TrendingUp className="h-4 w-4 text-brand-600" />
                      </button>
                    )}

                    {/* View Bronchodilator Report */}
                    {canViewReport && (
                      <button
                        type="button"
                        disabled={isReportLoading}
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-(--radius-control) transition-colors ${
                          isReportLoading
                            ? 'cursor-wait opacity-60'
                            : 'cursor-pointer hover:bg-surface-raised'
                        }`}
                        onClick={() => {
                          if (!isReportLoading && observationId != null) {
                            onViewReport(observationId);
                          }
                        }}
                        title="View bronchodilator report"
                      >
                        {isReportLoading ? (
                          <Loader2 className="h-4 w-4 text-fg-muted animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4 text-brand-600" />
                        )}
                      </button>
                    )}
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