import { AlertTriangle, Bell, UserRound } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import AlertsTableSkeleton from './AlertsTableSkeleton';

const avatarTones = ['brand', 'info', 'success', 'warning', 'danger'];
const toneGradients = {
  brand: 'from-brand-500 to-brand-700',
  info: 'from-info to-info/70',
  success: 'from-success to-success/70',
  warning: 'from-warning to-warning/70',
  danger: 'from-danger to-danger/70',
};

export default function AlertsTable({ alerts, loading }) {
  if (loading) return <AlertsTableSkeleton />;

  if (!alerts?.length) {
    return (
      <EmptyState
        icon={Bell}
        title="No alerts found"
        description="Try adjusting your search or filters"
      />
    );
  }

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">Status</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert, i) => {
            const tone = avatarTones[i % avatarTones.length];
            const gradient = toneGradients[tone];

            return (
              <TableRow
                key={alert.id}
                className={!alert.is_read ? 'bg-danger/5' : ''}
              >
                <TableCell>
                  <AlertTriangle
                    className={`h-5 w-5 ${alert.is_read ? 'text-fg-muted' : 'text-danger'}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <p
                    className={
                      !alert.is_read ? 'font-semibold text-fg' : 'text-fg'
                    }
                  >
                    {alert.message}
                  </p>
                </TableCell>
                <TableCell>
                  {alert.user ? (
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption font-semibold text-white bg-linear-to-br ${gradient}`}
                      >
                        {alert.user.f_name?.[0]}
                        {alert.user.l_name?.[0]}
                      </div>
                      <span className="text-body text-fg">
                        {alert.user.f_name} {alert.user.l_name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-fg-muted" />
                      <span className="text-body text-fg-muted">
                        User #{alert.user_id}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                  {new Date(alert.created).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
