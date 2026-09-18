// 
import { AlertTriangle, Eye, MoreHorizontal, Stethoscope, UserRound, Activity } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import EmptyState from "../shared/EmptyState";
import PatientsTableSkeleton from "./PatientsTableSkeleton";
import { NavLink, useNavigate } from "react-router-dom";

const avatarTones = ["brand", "info", "success", "warning", "danger"];

const toneGradients = {
  brand: "from-brand-500 to-brand-700",
  info: "from-info to-info/70",
  success: "from-success to-success/70",
  warning: "from-warning to-warning/70",
  danger: "from-danger to-danger/70",
};

export default function PatientsTable({ patients, loading, onViewPatient }) {
  const navigate = useNavigate();
  
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

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getLungFunctionSummary = (patient) => {
    const spiro = patient.last_spirometry;
    if (!spiro) return "—";
    
    const values = [];
    if (spiro.fev1) values.push(`FEV1: ${spiro.fev1}`);
    if (spiro.fvc) values.push(`FVC: ${spiro.fvc}`);
    if (spiro.pefr) values.push(`PEFR: ${spiro.pefr}`);
    
    return values.length > 0 ? values.join(', ') : "—";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Chart No</TableHead>
          <TableHead>Assigned Clinician</TableHead>
          <TableHead>Last Alert</TableHead>
          <TableHead>Lung Function</TableHead>
          <TableHead>Last Spirometry</TableHead>
          <TableHead>Days of Spirometry</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Group</TableHead>
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
  <button
    type="button"
    onClick={() =>
      navigate('/patients-details', {
        state: { patientId: patient.user_id },
      })
    }
    className="flex items-center gap-3 text-left"
  >
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
      {patient.attributes?.dob && (
        <p className="text-caption text-fg-muted">
          DOB: {formatDate(patient.attributes.dob)}
        </p>
      )}
    </div>
  </button>
</TableCell>
              
              <TableCell className="text-fg tabular-nums">
                <span className="font-mono text-caption bg-surface px-2 py-0.5 rounded border border-border">
                  {patient.patient_details?.chart_no || "—"}
                </span>
              </TableCell>
              
              <TableCell className="text-fg-muted">
                {patient.patient_details?.assigned_clinician ? (
                  <div>
                    <p className="text-body">
                      {patient.patient_details.assigned_clinician.f_name}{" "}
                      {patient.patient_details.assigned_clinician.l_name}
                    </p>
                  </div>
                ) : "—"}
              </TableCell>
              
              <TableCell>
                {patient.last_alert ? (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <div>
                      <p className="text-caption text-fg truncate max-w-[150px]">
                        {patient.last_alert.message}
                      </p>
                      <p className="text-caption text-fg-muted">
                        {formatDate(patient.last_alert.date)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-fg-muted">—</span>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-info" />
                  <span className="text-caption text-fg">
                    {getLungFunctionSummary(patient)}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="text-fg-muted whitespace-nowrap">
                {patient.last_spirometry ? (
                  <div>
                    <p className="text-body">{formatDate(patient.last_spirometry.date)}</p>
                    {patient.last_spirometry.quality_message && (
                      <p className="text-caption text-fg-muted">
                        Quality: {patient.last_spirometry.quality_message}
                      </p>
                    )}
                  </div>
                ) : "—"}
              </TableCell>
              
              <TableCell className="text-fg-muted text-center">
                <Badge variant="info">
                  {patient.total_observations || 0} days
                </Badge>
              </TableCell>
              
              <TableCell>
                <Badge
                  variant={
                    patient.patient_details?.status === "active"
                      ? "success"
                      : "warning"
                  }
                  className="capitalize"
                >
                  {patient.patient_details?.status || "unknown"}
                </Badge>
              </TableCell>
              
              <TableCell className="text-fg-muted" >
                {patient.patient_details?.patient_group?.name || "—"}
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="inline-flex items-center justify-center h-8 w-8 rounded-(--radius-control) cursor-pointer hover:bg-surface-raised transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    side="top"
                    className="w-fit min-w-0"
                  >
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/spirometry?username=${patient.userName}`)
                      }
                      className="cursor-pointer"
                    >
                      <Stethoscope className="h-4 w-4 mr-2" /> View Spirometry
                    </DropdownMenuItem>
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