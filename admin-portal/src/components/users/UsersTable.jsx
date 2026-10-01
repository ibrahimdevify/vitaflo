import {
  Edit,
  Mail,
  Phone,
  Trash2,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import EmptyState from "../shared/EmptyState";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import UsersTableSkeleton from "./UsersTableSkeleton";

const typeBadgeVariants = {
  admin: "danger",
  clinician: "brand",
  patient: "info",
  technician: "warning",
  account_admin: "success",
};

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

export default function UsersTable({
  users,
  loading,
  userTypes,
  userStatuses,
  onEdit,
  onDelete,
}) {
  const [expandedRows, setExpandedRows] = useState({});

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

  const toggleRow = (userId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const getTypeName = (id) =>
    userTypes.find((t) => t.ut_id === id)?.name || "Unknown";
  const getStatusName = (id) =>
    userStatuses.find((s) => s.us_id === id)?.name || "Unknown";

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, i) => {
            const tone = avatarTones[i % avatarTones.length];
            const gradient = toneGradients[tone];
            const typeName = getTypeName(user.ut_id_fk);
            const statusName = getStatusName(user.us_id_fk);
            const isExpanded = expandedRows[user.user_id];

            return (
              <>
                {/* Main Row */}
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-caption font-semibold text-white bg-linear-to-br ${gradient}`}
                      >
                        {user.f_name?.[0]}
                        {user.l_name?.[0]}
                      </div>
                      <div className="min-w-0">
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
                      variant={typeBadgeVariants[typeName] || "secondary"}
                      className="capitalize"
                    >
                      {typeName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusBadgeVariants[statusName] || "secondary"}
                      className="capitalize"
                    >
                      {statusName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                    {formatDate(user.reg_date)}
                  </TableCell>
                  {/* Chevron toggle */}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleRow(user.user_id)}
                      aria-label={isExpanded ? "Collapse row" : "Expand row"}
                      className="rounded-lg"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Expanded Row */}
                {isExpanded && (
                  <TableRow key={`${user.user_id}-expanded`}>
                    <TableCell colSpan={7} className="bg-surface-raised p-0">
                      <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Email */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Email
                          </p>
                          <p className="text-caption text-fg">
                            {user.email || "—"}
                          </p>
                        </div>

                        {/* Phone */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Phone
                          </p>
                          <p className="text-caption text-fg">
                            {user.phone || "—"}
                          </p>
                        </div>

                        {/* Username */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Username
                          </p>
                          <p className="text-caption text-fg font-mono">
                            {user.userName || "—"}
                          </p>
                        </div>

                        {/* Joined */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Joined
                          </p>
                          <p className="text-caption text-fg">
                            {formatDate(user.reg_date)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="sm:col-span-2 lg:col-span-4 flex gap-2 pt-2 border-t border-border mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(user)}
                            className="gap-1.5"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(user.user_id)}
                            className="gap-1.5 text-danger hover:text-danger"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Deactivate
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
