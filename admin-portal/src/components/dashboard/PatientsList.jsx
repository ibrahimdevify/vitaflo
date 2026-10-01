import { ArrowUpRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const avatarTones = ["brand", "info", "success", "warning", "danger"];
const toneGradients = {
  brand: "from-brand-500 to-brand-700",
  info: "from-info to-info/70",
  success: "from-success to-success/70",
  warning: "from-warning to-warning/70",
  danger: "from-danger to-danger/70",
};

export default function PatientsList({ patients, isAdmin }) {
  const getInitials = (f, l) => `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase();

  // Admin ke liye "Recent Registrations", warna "My Patients"
  const title = isAdmin ? "Recent Registrations" : "My Patients";
  // Admin ke liye view-all link /users pe, clinician ke liye /patients pe
  const viewAllPath = isAdmin ? "/users" : "/patients";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
            <Users className="h-3.5 w-3.5 text-white" />
          </div>
          {title}
          <Badge variant="info">{patients?.length || 0}</Badge>
        </CardTitle>
        <Link
          to={viewAllPath}
          className="text-caption font-medium text-fg-muted hover:text-brand-600 flex items-center gap-0.5 transition-colors"
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="pt-3">
        {patients?.length > 0 ? (
          <div className="divide-y divide-border">
            {patients.slice(0, 5).map((p, i) => {
              const tone = avatarTones[i % avatarTones.length];
              const gradient = toneGradients[tone];

              // Status badge logic (same as before)
              const statusVariant = p.patient_details
                ? p.patient_details?.status === "active"
                  ? "success"
                  : p.patient_details?.status === "unverified"
                    ? "warning"
                    : "secondary"
                : "secondary";

              const statusLabel = p.patient_details
                ? p.patient_details.status
                : p.ut_id_fk === 3
                  ? "Clinician"
                  : p.ut_id_fk === 4
                    ? "Patient"
                    : "User";

              // Admin ke liye email dikhao, clinician ke liye chart_no
              const subtitle = isAdmin
                ? p.email
                : `Chart #${p.patient_details?.chart_no ?? "—"}`;

              return (
                <Link
                  key={p.user_id ?? i}
                  to={viewAllPath}
                  className="flex items-center gap-3 px-1 py-3 hover:bg-surface-raised transition-colors -mx-1"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-caption font-semibold text-white bg-linear-to-br ${gradient}`}
                  >
                    {getInitials(p.f_name, p.l_name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-fg text-body truncate">
                      {p.f_name} {p.l_name}
                    </p>
                    <p className="text-caption text-fg-muted truncate">
                      {subtitle}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={statusVariant} className="capitalize">
                      {statusLabel}
                    </Badge>
                    {p.reg_date && (
                      <p className="text-caption text-fg-muted">
                        {new Date(p.reg_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 rounded-pill bg-surface-raised flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-fg-muted" />
            </div>
            <p className="text-body font-medium text-fg">No patients yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
