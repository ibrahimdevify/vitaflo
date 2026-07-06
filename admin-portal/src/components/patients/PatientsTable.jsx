import { Edit, Eye, MoreHorizontal, UserRound } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import PatientsTableSkeleton from './PatientsTableSkeleton';

const avatarTones = ['brand', 'info', 'success', 'warning', 'danger'];
const toneGradients = {
  brand: 'from-brand-500 to-brand-700',
  info: 'from-info to-info/70',
  success: 'from-success to-success/70',
  warning: 'from-warning to-warning/70',
  danger: 'from-danger to-danger/70',
};

export default function PatientsTable({ patients, loading, onView, onEdit }) {
  if (loading) return <PatientsTableSkeleton />;

  if (!patients?.length) {
    return (
      <EmptyState
        icon={UserRound}
        title="No patients found"
        description="Try adjusting your search or filters"
      />
    );
  }

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Chart No</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Clinician</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient, i) => {
            const tone = avatarTones[i % avatarTones.length];
            const gradient = toneGradients[tone];
            const status = patient.patient_details?.status;

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
                      status === 'active'
                        ? 'success'
                        : status === 'verified'
                          ? 'info'
                          : 'warning'
                    }
                    className="capitalize"
                  >
                    {status || 'unknown'}
                  </Badge>
                </TableCell>
                <TableCell className="text-fg-muted">
                  {patient.patient_details?.patient_group?.name || '—'}
                </TableCell>
                <TableCell className="text-fg-muted">
                  {patient.patient_details?.assigned_clinician?.f_name || '—'}
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
                      <div className="inline-flex items-center justify-center h-8 w-8 rounded-(--radius-control) cursor-pointer hover:bg-surface-raised transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-fit">
                      <DropdownMenuItem
                        onClick={() => onView(patient.user_id)}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(patient)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
