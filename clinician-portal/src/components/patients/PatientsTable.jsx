//
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import EmptyState from '../shared/EmptyState';
import { Button } from '../ui/button';
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
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState({});

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
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getLungFunctionSummary = (patient) => {
    const spiro = patient.last_spirometry;
    if (!spiro) return '—';

    const values = [];
    if (spiro.fev1) values.push(`FEV1: ${spiro.fev1}`);
    if (spiro.fvc) values.push(`FVC: ${spiro.fvc}`);
    if (spiro.pefr) values.push(`PEFR: ${spiro.pefr}`);

    return values.length > 0 ? values.join(', ') : '—';
  };

  const toggleRow = (patientId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [patientId]: !prev[patientId],
    }));
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Assigned Clinician</TableHead>
          <TableHead>Last Spirometry</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>

      <TableBody>
        {patients.map((patient, i) => {
          const tone = avatarTones[i % avatarTones.length];
          const gradient = toneGradients[tone];
          const isExpanded = expandedRows[patient.user_id];

          return (
            <>
              {/* Main Row */}
              <TableRow key={patient.user_id}>
                <TableCell>
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/patients-details', {
                        state: { patientId: patient.user_id },
                      })
                    }
                    className="flex items-center gap-3 text-left cursor-pointer"
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
                        {patient.userName}
                      </p>
                    </div>
                  </button>
                </TableCell>

                <TableCell
                  onClick={() => toggleRow(patient.user_id)}
                  aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                  className="text-fg-muted"
                >
                  {patient.patient_details?.assigned_clinician ? (
                    <p className="text-body">
                      {patient.patient_details.assigned_clinician.f_name}{' '}
                      {patient.patient_details.assigned_clinician.l_name}
                    </p>
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell
                  onClick={() => toggleRow(patient.user_id)}
                  aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                  className="text-fg-muted whitespace-nowrap"
                >
                  {patient.last_spirometry ? (
                    <div>
                      <p className="text-body">
                        {formatDate(patient.last_spirometry.date)}
                      </p>

                      {patient.last_spirometry.quality_message && (
                        <p className="text-caption text-fg-muted">
                          Quality: {patient.last_spirometry.quality_message}
                        </p>
                      )}
                    </div>
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell
                  onClick={() => toggleRow(patient.user_id)}
                  aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                >
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

                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/spirometry?username=${patient.userName}`)
                    }
                    className="h-8 gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    View Spirometry
                  </Button>
                </TableCell>

                {/* Expand */}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleRow(patient.user_id)}
                    aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
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
                <TableRow key={`${patient.user_id}-expanded`}>
                  <TableCell colSpan={8} className="bg-surface-raised p-0">
                    <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Last Alert */}
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                          Last Alert
                        </p>

                        {patient.last_alert ? (
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />

                            <div className="min-w-0">
                              <p className="text-caption text-fg">
                                {patient.last_alert.message}
                              </p>

                              <p className="mt-0.5 text-caption text-fg-muted">
                                {formatDate(patient.last_alert.date)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-caption text-fg-muted">—</span>
                        )}
                      </div>

                      {/* Spirometry Days */}
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                          Spirometry
                        </p>

                        <Badge variant="info">
                          {patient.total_observations || 0} days
                        </Badge>
                      </div>

                      {/* Patient Group */}
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                          Group
                        </p>

                        <p className="text-caption text-fg">
                          {patient.patient_details?.patient_group?.name || '—'}
                        </p>
                      </div>

                      {/* DOB */}
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                          Date of Birth
                        </p>

                        <p className="text-caption text-fg">
                          {patient.attributes?.dob
                            ? formatDate(patient.attributes.dob)
                            : '—'}
                        </p>
                      </div>

                      {/* Username */}
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted uppercase">
                          chart no
                        </p>

                        <span className="font-mono text-caption bg-surface px-2 py-0.5 rounded border border-border">
                          {patient.patient_details?.chart_no || '—'}
                        </span>
                      </div>

                      {/* Quality */}
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                          Spirometry Quality
                        </p>

                        <p className="text-caption text-fg">
                          {patient.last_spirometry?.quality_message || '—'}
                        </p>
                      </div>

                      {/* Lung Function */}
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
                          Lung Function
                        </p>

                        <p className="text-caption text-fg ">
                          {getLungFunctionSummary(patient)}
                        </p>
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
  );
}
