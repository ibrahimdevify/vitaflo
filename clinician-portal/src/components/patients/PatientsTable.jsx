import { Eye, MoreHorizontal, UserRound } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import EmptyState from '../shared/EmptyState';
import PatientsTableSkeleton from './PatientsTableSkeleton';

const avatarTones = ['brand', 'info', 'success', 'warning', 'danger'];

const toneGradients = {
  brand: 'from-brand-500 to-brand-700',
  info: 'from-info to-info/70',
  success: 'from-success to-success/70',
  warning: 'from-warning to-warning/70',
  danger: 'from-danger to-danger/70',
};

export default function PatientsTable({ patients, loading, onViewPatient }) {
  if (loading) return <PatientsTableSkeleton />;

  if (!patients?.length) {
    return (
      <EmptyState
        icon={UserRound}
        title="No patients found"
        description="Try adjusting your search filters"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Chart No</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-16"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient, i) => {
          const tone = avatarTones[i % avatarTones.length];
          const gradient = toneGradients[tone];

          return (
            <TableRow key={patient.user_id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-caption font-semibold text-white bg-linear-to-br ${gradient}`}
                  >
                    {patient.f_name?.[0]}
                    {patient.l_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-fg text-body truncate">
                      {patient.f_name} {patient.l_name}
                    </p>
                    <p className="text-caption text-fg-muted truncate">
                      {patient.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-fg tabular-nums">
                {patient.patient_details?.chart_no || '—'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    patient.patient_details?.status === 'active'
                      ? 'success'
                      : 'warning'
                  }
                  className="capitalize"
                >
                  {patient.patient_details?.status || 'unknown'}
                </Badge>
              </TableCell>
              <TableCell className="text-fg-muted">
                {patient.patient_details?.patient_group?.name || '—'}
              </TableCell>
              <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                {new Date(patient.reg_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="inline-flex items-center justify-center h-8 w-8 rounded-[var(--radius-control)] cursor-pointer hover:bg-surface-raised transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    side="top"
                    className="w-fit min-w-0"
                  >
                    <DropdownMenuItem
                      onClick={() => onViewPatient(patient.user_id)}
                      className="cursor-pointer w-auto"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
