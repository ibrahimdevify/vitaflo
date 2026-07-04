import { AlertTriangle, Bell, Mail, User } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import EmptyState from '../shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import AlertsTableSkeleton from './AlertsTableSkeleton';

export default function AlertsTable({ alerts, loading, onMarkAsRead }) {
  if (loading) return <AlertsTableSkeleton />;

  if (!alerts?.length) {
    return (
      <Card>
        <CardContent className="pt-4">
          <EmptyState
            icon={Bell}
            title="No alerts found"
            description="Try adjusting your search or filters"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-danger to-danger/70">
            <Bell className="h-3.5 w-3.5 text-white" />
          </div>
          Alerts
          {alerts.length > 0 && <Badge variant="danger">{alerts.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  className={!alert.is_read ? 'bg-danger/5' : ''}
                >
                  <TableCell>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-pill ${
                        alert.is_read ? 'bg-surface-raised' : 'bg-danger/10'
                      }`}
                    >
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          alert.is_read ? 'text-fg-muted' : 'text-danger'
                        }`}
                      />
                    </span>
                  </TableCell>
                  <TableCell>
                    <p
                      className={`text-body ${
                        !alert.is_read
                          ? 'font-semibold text-fg'
                          : 'font-normal text-fg'
                      }`}
                    >
                      {alert.message}
                    </p>
                    {alert.type && (
                      <Badge variant="outline" className="mt-1.5">
                        {alert.type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {alert.user ? (
                      <div className="flex items-center gap-1.5 text-caption text-fg">
                        <User className="h-3.5 w-3.5 text-fg-muted" />
                        {alert.user.f_name} {alert.user.l_name}
                      </div>
                    ) : (
                      <span className="text-fg-muted">—</span>
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
                  <TableCell className="text-right">
                    {!alert.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(alert.id)}
                        className="text-info hover:text-info hover:bg-info/10"
                      >
                        <Mail className="h-4 w-4 mr-1.5" />
                        Mark read
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
