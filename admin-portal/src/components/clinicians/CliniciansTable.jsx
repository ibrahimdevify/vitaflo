import {
  Building2,
  Edit,
  Eye,
  MoreHorizontal,
  Stethoscope,
} from 'lucide-react';
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
import CliniciansTableSkeleton from './CliniciansTableSkeleton';

const avatarTones = ['brand', 'info', 'success', 'warning', 'danger'];
const toneGradients = {
  brand: 'from-brand-500 to-brand-700',
  info: 'from-info to-info/70',
  success: 'from-success to-success/70',
  warning: 'from-warning to-warning/70',
  danger: 'from-danger to-danger/70',
};

export default function CliniciansTable({
  clinicians,
  loading,
  onView,
  onEdit,
}) {
  if (loading) return <CliniciansTableSkeleton />;

  if (!clinicians?.length) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="No clinicians found"
        description="Try adjusting your search or filters"
      />
    );
  }

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clinician</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Specialist</TableHead>
            <TableHead>Patients</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clinicians.map((c, i) => {
            const tone = avatarTones[i % avatarTones.length];
            const gradient = toneGradients[tone];

            return (
              <TableRow key={c.user_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-caption font-semibold text-white bg-linear-to-br ${gradient}`}
                    >
                      {c.f_name?.[0]}
                      {c.l_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-fg text-body truncate">
                        {c.f_name} {c.l_name}
                      </p>
                      <p className="text-caption text-fg-muted truncate">
                        {c.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-fg">
                  {c.doctor_details?.license_no || '—'}
                </TableCell>
                <TableCell className="text-fg-muted">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" />
                    {c.doctor_details?.hospital?.name || '—'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      c.doctor_details?.is_specialist ? 'brand' : 'secondary'
                    }
                    className="capitalize"
                  >
                    {c.doctor_details?.is_specialist ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {c._count?.assigned_patients || 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={c.is_availible ? 'success' : 'danger'}
                    className="capitalize"
                  >
                    {c.is_availible ? 'Available' : 'Offline'}
                  </Badge>
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
                        onClick={() => onView(c.user_id)}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(c)}
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
