import { Activity, TrendingUp, X, UserRound, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import SpirometryChart from "./SpirometryChart";
import { Button } from "../ui/button";

export default function SpirometryDetailModal({
  open,
  onClose,
  patientId,
  patientInfo,
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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface rounded-t-card z-10">
          <h2 className="text-subheading font-bold text-fg flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            {patientInfo?.name || `Patient #${patientId}`} — Spirometry
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Patient Info Bar */}
          {patientInfo && (
            <div className="mb-6 p-4 bg-surface-raised rounded-card flex items-center gap-4 flex-wrap">
              <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-linear-to-br from-brand-500 to-brand-700 text-white font-semibold text-lg">
                {patientInfo.name?.[0] || "P"}
              </div>
              <div>
                <p className="font-semibold text-fg">{patientInfo.name}</p>
                <p className="text-caption text-fg-muted flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" />
                  Username: {patientInfo.userName || "N/A"}
                </p>
              </div>
              {patientInfo.email && (
                <Badge variant="outline">{patientInfo.email}</Badge>
              )}
              {patientInfo.dob && (
                <Badge variant="secondary">
                  <Calendar className="h-3 w-3 mr-1" />
                  DOB: {patientInfo.dob}
                </Badge>
              )}
              {patientInfo.gender && (
                <Badge variant="secondary">
                  Gender: {patientInfo.gender === "M" ? "Male" : "Female"}
                </Badge>
              )}
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-75 w-full rounded-card" />
              <Skeleton className="h-64 w-full rounded-card" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Trends Chart */}
              {chartData.length > 0 && (
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Lung Function Trends
                  </h3>
                  <div className="bg-surface-raised rounded-card p-4">
                    <SpirometryChart data={chartData} />
                  </div>
                </div>
              )}

              {/* Records Table */}
              <div>
                <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-3">
                  Spirometry Records ({data.length})
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
                          <TableHead>Type</TableHead>
                          <TableHead>Quality</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((s, i) => (
                          <TableRow key={s.id || i}>
                            <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                              {new Date(s.dbdate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="font-medium text-fg tabular-nums">
                              {s.fev1?.toFixed(2) || "—"}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {s.fvc?.toFixed(2) || "—"}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {s.pefr?.toFixed(0) || "—"}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {s.fef2575?.toFixed(2) || "—"}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {s.fev6?.toFixed(2) || "—"}
                            </TableCell>
                            <TableCell>
                              {s.fev1_perc ? (
                                <Badge
                                  variant={
                                    s.fev1_perc >= 80
                                      ? "success"
                                      : s.fev1_perc >= 60
                                        ? "warning"
                                        : "danger"
                                  }
                                >
                                  {s.fev1_perc.toFixed(0)}%
                                </Badge>
                              ) : (
                                <span className="text-fg-muted">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {s.is_post_bronchodilator ? (
                                <Badge variant="info">Post-BD</Badge>
                              ) : (
                                <Badge variant="secondary">Pre-BD</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-caption text-fg-muted">
                              {s.quality_message === 1
                                ? "Good"
                                : s.quality_message === 2
                                  ? "Acceptable"
                                  : s.quality_message === 3
                                    ? "Poor"
                                    : "—"}
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
                    <p className="text-caption text-fg-muted mt-1">
                      Try adjusting the date range or search for a different
                      patient
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
