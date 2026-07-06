import {
  Edit,
  Mail,
  MoreHorizontal,
  Phone,
  Trash2,
  UserPlus,
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
import UsersTableSkeleton from './UsersTableSkeleton';

const typeBadgeVariants = {
  admin: 'danger',
  clinician: 'brand',
  patient: 'info',
  technician: 'warning',
  account_admin: 'success',
};

const statusBadgeVariants = {
  active: 'success',
  inactive: 'danger',
  suspended: 'warning',
  unverified: 'secondary',
};

const avatarTones = ['brand', 'info', 'success', 'warning', 'danger'];
const toneGradients = {
  brand: 'from-brand-500 to-brand-700',
  info: 'from-info to-info/70',
  success: 'from-success to-success/70',
  warning: 'from-warning to-warning/70',
  danger: 'from-danger to-danger/70',
};

export default function UsersTable({
  users,
  loading,
  userTypes,
  userStatuses,
  onEdit,
  onDelete,
}) {
  if (loading) return <UsersTableSkeleton />;

  if (!users?.length) {
    return (
      <EmptyState
        icon={UserPlus}
        title="No users found"
        description="Try adjusting your search or filters"
      />
    );
  }

  const getTypeName = (id) =>
    userTypes.find((t) => t.ut_id === id)?.name || 'Unknown';
  const getStatusName = (id) =>
    userStatuses.find((s) => s.us_id === id)?.name || 'Unknown';

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, i) => {
            const tone = avatarTones[i % avatarTones.length];
            const gradient = toneGradients[tone];
            const typeName = getTypeName(user.ut_id_fk);
            const statusName = getStatusName(user.us_id_fk);

            return (
              <TableRow key={user.user_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-caption font-semibold text-white bg-linear-to-br ${gradient}`}
                    >
                      {user.f_name?.[0]}
                      {user.l_name?.[0]}
                    </div>
                    <p className="font-medium text-fg text-body">
                      {user.f_name} {user.l_name}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-fg-muted">
                  <Mail className="h-3 w-3 inline mr-1.5" />
                  {user.email}
                </TableCell>
                <TableCell className="text-fg-muted">
                  <Phone className="h-3 w-3 inline mr-1.5" />
                  {user.phone}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={typeBadgeVariants[typeName] || 'secondary'}
                    className="capitalize"
                  >
                    {typeName}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusBadgeVariants[statusName] || 'secondary'}
                    className="capitalize"
                  >
                    {statusName}
                  </Badge>
                </TableCell>
                <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                  {new Date(user.reg_date).toLocaleDateString('en-US', {
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit(user)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(user.user_id)}
                        className="text-danger cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Deactivate
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
