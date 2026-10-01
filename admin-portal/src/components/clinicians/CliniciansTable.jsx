import {
  Building2,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  MoreHorizontal,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import EmptyState from "../shared/EmptyState";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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
import CliniciansTableSkeleton from "./CliniciansTableSkeleton";

const avatarTones = ["brand", "info", "success", "warning", "danger"];
const toneGradients = {
  brand: "from-brand-500 to-brand-700",
  info: "from-info to-info/70",
  success: "from-success to-success/70",
  warning: "from-warning to-warning/70",
  danger: "from-danger to-danger/70",
};

export default function CliniciansTable({
  clinicians,
  loading,
  onView,
  onEdit,
  onAssignAdmin,
}) {
  const [expandedRows, setExpandedRows] = useState({});

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

  const toggleRow = (clinicianId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [clinicianId]: !prev[clinicianId],
    }));
  };

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clinician</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Specialist</TableHead>
            <TableHead>Patients</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 pr-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clinicians.map((c, i) => {
            const tone = avatarTones[i % avatarTones.length];
            const gradient = toneGradients[tone];
            const isExpanded = expandedRows[c.user_id];
            const details = c.doctor_details || {};

            return (
              <>
                {/* Main Row */}
                <TableRow key={c.user_id}>
                  <TableCell className="pr-4">
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
                          <span className="font-medium text-fg">
                            @{c.userName || "no-username"}
                          </span>
                        </p>
                        <p className="text-caption text-fg-muted truncate">
                          {c.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-fg">
                    {details.license_no || "—"}
                  </TableCell>
                  <TableCell className="text-fg-muted">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" />
                      {details.hospital?.name || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.clinician_admin ? (
                      <Badge variant="success" className="whitespace-nowrap">
                        {c.clinician_admin.f_name} {c.clinician_admin.l_name}
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => onAssignAdmin(c)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Assign to Admin
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={details.is_specialist ? "brand" : "secondary"}
                      className="capitalize"
                    >
                      {details.is_specialist ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {c._count?.assigned_patients || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.is_availible ? "success" : "danger"}
                      className="capitalize"
                    >
                      {c.is_availible ? "Available" : "Offline"}
                    </Badge>
                  </TableCell>
                  {/* Chevron toggle */}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleRow(c.user_id)}
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
                  <TableRow key={`${c.user_id}-expanded`}>
                    <TableCell colSpan={8} className="bg-surface-raised p-0">
                      <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Email */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Email
                          </p>
                          <p className="text-caption text-fg">
                            {c.email || "—"}
                          </p>
                        </div>

                        {/* Phone */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Phone
                          </p>
                          <p className="text-caption text-fg">
                            {c.phone || "—"}
                          </p>
                        </div>

                        {/* Experience */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Experience
                          </p>
                          <p className="text-caption text-fg">
                            {details.experience || "—"}
                          </p>
                        </div>

                        {/* Education */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Education
                          </p>
                          <p className="text-caption text-fg">
                            {details.education || "—"}
                          </p>
                        </div>

                        {/* About */}
                        <div className="sm:col-span-2 lg:col-span-4">
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            About
                          </p>
                          <p className="text-caption text-fg">
                            {details.about_doctor || "No description"}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="sm:col-span-2 lg:col-span-4 flex gap-2 pt-2 border-t border-border mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(c.user_id)}
                            className="gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(c)}
                            className="gap-1.5"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          {!c.clinician_admin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAssignAdmin(c)}
                              className="gap-1.5"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              Assign Admin
                            </Button>
                          )}
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
