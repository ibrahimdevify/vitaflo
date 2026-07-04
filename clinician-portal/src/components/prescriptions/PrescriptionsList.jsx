import { ChevronDown, ChevronUp, ClipboardList, Pill } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import EmptyState from '../shared/EmptyState';
import Pagination from '../ui/pagination';
import PrescriptionsListSkeleton from './PrescriptionsListSkeleton';

export default function PrescriptionsList({
  prescriptions,
  loading,
  patientId,
  page,
  totalPages,
  totalRecords,
  expanded,
  onToggleExpand,
  onPageChange,
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
            <ClipboardList className="h-3.5 w-3.5 text-white" />
          </div>
          Prescriptions
          {totalRecords > 0 && <Badge variant="info">{totalRecords}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <PrescriptionsListSkeleton />
        ) : prescriptions.length > 0 ? (
          <div className="space-y-3">
            {prescriptions.map((p, i) => {
              const isExpanded = expanded[i];
              return (
                <div
                  key={p.pr_id || i}
                  className="rounded-card border border-border bg-surface transition-shadow hover:shadow-card-hover"
                >
                  <div
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() => onToggleExpand(i)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-body font-semibold text-fg">
                          {p.diagnosis}
                        </span>
                        <Badge variant="secondary" className="text-caption">
                          {new Date(p.pr_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: '2-digit',
                          })}
                        </Badge>
                      </div>
                      {p.pharmacy_instruction && (
                        <p className="text-caption text-fg-muted mb-2">
                          {p.pharmacy_instruction}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {p.medicines?.map((m, j) => (
                          <Badge
                            key={j}
                            variant="brand"
                            className="text-caption"
                          >
                            <Pill className="h-3 w-3 mr-1" />
                            {m.drug} {m.dosage}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      {p.doctor && (
                        <span className="text-caption text-fg-muted hidden sm:block">
                          Dr. {p.doctor.f_name} {p.doctor.l_name}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-fg-muted" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-fg-muted" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border pt-3">
                      <h4 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-3">
                        Medicine Details
                      </h4>
                      <div className="table-container">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Drug</TableHead>
                              <TableHead>Dosage</TableHead>
                              <TableHead>Frequency</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Days</TableHead>
                              <TableHead>Direction</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {p.medicines?.map((m, j) => (
                              <TableRow key={j}>
                                <TableCell className="font-medium text-fg">
                                  {m.drug}
                                </TableCell>
                                <TableCell>{m.dosage}</TableCell>
                                <TableCell>{m.frequency}</TableCell>
                                <TableCell className="tabular-nums">
                                  {m.quantity || '1'}
                                </TableCell>
                                <TableCell className="tabular-nums">
                                  {m.days || '1'}
                                </TableCell>
                                <TableCell>{m.direction}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex justify-between mt-3 text-caption text-fg-muted">
                        <span>
                          Dr. {p.doctor?.f_name} {p.doctor?.l_name}
                        </span>
                        <span>{new Date(p.pr_date).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Pagination
              page={page}
              totalPages={totalPages}
              total={totalRecords}
              label="records"
              loading={loading}
              onPageChange={onPageChange}
            />
          </div>
        ) : patientId ? (
          <EmptyState
            icon={ClipboardList}
            title="No prescriptions found"
            description="Try a different date range or create a new one"
          />
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="Enter a Patient ID to view prescriptions"
            description="Supports: Patient ID, Username, or Email"
          />
        )}
      </CardContent>
    </Card>
  );
}
