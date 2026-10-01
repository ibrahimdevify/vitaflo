import {
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import PatientsTableSkeleton from "./PatientsTableSkeleton";

const avatarTones = ["brand", "info", "success", "warning", "danger"];
const toneGradients = {
  brand: "from-brand-500 to-brand-700",
  info: "from-info to-info/70",
  success: "from-success to-success/70",
  warning: "from-warning to-warning/70",
  danger: "from-danger to-danger/70",
};

export default function PatientsTable({ patients, loading, onView, onEdit }) {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState({});

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

  const toggleRow = (patientId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [patientId]: !prev[patientId],
    }));
  };

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
            <TableHead>Patient</TableHead>
            <TableHead>Chart No</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Clinician</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient, i) => {
            const tone = avatarTones[i % avatarTones.length];
            const gradient = toneGradients[tone];
            const status = patient.patient_details?.status;
            const isExpanded = expandedRows[patient.user_id];
            const details = patient.patient_details || {};

            return (
              <>
                {/* Main Row */}
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
                          <span className="font-medium text-fg">
                            @{patient.userName || "no-username"}
                          </span>
                        </p>
                        <p className="text-caption text-fg-muted truncate">
                          {patient.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-fg tabular-nums">
                    {details.chart_no || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        status === "active"
                          ? "success"
                          : status === "verified"
                            ? "info"
                            : "warning"
                      }
                      className="capitalize"
                    >
                      {status || "unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-fg-muted">
                    {details.patient_group?.name || "—"}
                  </TableCell>
                  <TableCell className="text-fg-muted">
                    {details.assigned_clinician?.f_name || "—"}
                  </TableCell>
                  <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                    {formatDate(patient.reg_date)}
                  </TableCell>
                  {/* View Spirometry Button — Clinician jaisa */}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/spirometry?username=${patient.userName}`)
                      }
                      className="gap-1.5"
                    >
                      <Stethoscope className="h-3.5 w-3.5" />
                      View Spirometry
                    </Button>
                  </TableCell>
                  {/* Chevron toggle — Clinician jaisa */}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleRow(patient.user_id)}
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

                {/* Expanded Row — Clinician jaisa */}
                {isExpanded && (
                  <TableRow key={`${patient.user_id}-expanded`}>
                    <TableCell colSpan={8} className="bg-surface-raised p-0">
                      <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Email */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Email
                          </p>
                          <p className="text-caption text-fg">
                            {patient.email || "—"}
                          </p>
                        </div>

                        {/* Username */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Username
                          </p>
                          <p className="text-caption text-fg font-mono">
                            {patient.userName || "—"}
                          </p>
                        </div>

                        {/* Chart No */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Chart No
                          </p>
                          <span className="font-mono text-caption bg-surface px-2 py-0.5 rounded border border-border">
                            {details.chart_no || "—"}
                          </span>
                        </div>

                        {/* Blood Group */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Blood Group
                          </p>
                          <p className="text-caption text-fg">
                            {details.blood_group || "—"}
                          </p>
                        </div>

                        {/* Group */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Group
                          </p>
                          <p className="text-caption text-fg">
                            {details.patient_group?.name || "—"}
                          </p>
                        </div>

                        {/* Clinician */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Assigned Clinician
                          </p>
                          <p className="text-caption text-fg">
                            {details.assigned_clinician?.f_name
                              ? `${details.assigned_clinician.f_name} ${details.assigned_clinician.l_name || ""}`
                              : "—"}
                          </p>
                        </div>

                        {/* Joined */}
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                            Joined
                          </p>
                          <p className="text-caption text-fg">
                            {formatDate(patient.reg_date)}
                          </p>
                        </div>

                        {/* Actions — Clinician jaisa */}
                        <div className="sm:col-span-2 lg:col-span-4 flex gap-2 pt-2 border-t border-border mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(patient)}
                            className="gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(patient)}
                            className="gap-1.5"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
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
