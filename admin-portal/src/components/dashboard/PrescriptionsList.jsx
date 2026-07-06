import { ClipboardList, Pill } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function PrescriptionsList({ prescriptions }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
            <ClipboardList className="h-3.5 w-3.5 text-white" />
          </div>
          Recent Prescriptions
          <Badge variant="brand">{prescriptions?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {prescriptions?.length > 0 ? (
          <div className="space-y-2">
            {prescriptions.map((p, i) => (
              <div
                key={i}
                className="p-3 hover:bg-surface-raised rounded-card transition-colors border border-border"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-medium text-fg text-body">
                    {p.patient?.f_name} {p.patient?.l_name}
                  </p>
                  <span className="text-caption text-fg-muted">
                    {new Date(p.pr_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-body text-fg-muted">{p.diagnosis}</p>
                  {p.medicines?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.medicines.slice(0, 3).map((m, j) => (
                        <Badge key={j} variant="brand">
                          <Pill className="h-3 w-3 mr-1" />
                          {m.drug}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 rounded-pill bg-surface-raised flex items-center justify-center mb-3">
              <ClipboardList className="h-5 w-5 text-fg-muted" />
            </div>
            <p className="text-body font-medium text-fg">
              No prescriptions yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
