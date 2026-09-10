import { Edit, Mail, MoreHorizontal, Phone, Trash2, UserPlus } from "lucide-react";
import EmptyState from "../shared/EmptyState";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import UsersTableSkeleton from "./UsersTableSkeleton";

// Keyed by the lowercased user_status.name returned from the API
// (user_status: { name }). Adjust keys if your dc_user_statuses table
// uses different wording than active/inactive/suspended/unverified.
const statusBadgeVariants = {
  active: "success",
  inactive: "danger",
  suspended: "warning",
  unverified: "secondary",
};

const avatarTones = ["brand", "info", "success", "warning", "danger"];
const toneGradients = {
  brand: "from-brand-500 to-brand-700",
  info: "from-info to-info/70",
  success: "from-success to-success/70",
  warning: "from-warning to-warning/70",
  danger: "from-danger to-danger/70",
};

export default function UsersTable({ users, loading, onEdit, onDelete }) {
  if (loading) return <UsersTableSkeleton />;

  if (!users?.length) {
    return (
      <EmptyState
        icon={UserPlus}
        title="No clinicians found"
        description="Try adjusting your search, or add a new clinician"
      />
    );
  }

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, i) => {
            const tone = avatarTones[i % avatarTones.length];
            const gradient = toneGradients[tone];

            // Status comes straight from the API's included relation
            // (select: { user_status: { select: { us_id, name } } }) —
            // no id-to-name lookup needed/available on the client.
            const statusLabel = user.user_status?.name || "Unknown";
            const statusKey = statusLabel.toLowerCase();

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
                    <div>
                      <p className="font-medium text-fg text-body">
                        {user.f_name} {user.l_name}
                      </p>
                      <p className="text-caption text-fg-muted truncate">
                        <span className="font-medium text-fg">
                          @{user.userName || "no-username"}
                        </span>
                      </p>
                    </div>
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
                    variant={statusBadgeVariants[statusKey] || "secondary"}
                    className="capitalize"
                  >
                    {statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                  {user.reg_date
                    ? new Date(user.reg_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
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