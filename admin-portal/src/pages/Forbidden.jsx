import { ArrowLeft, ClipboardList, Home, ShieldOff, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const quickLinks = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/patients', label: 'My Patients', icon: Users },
  { to: '/prescriptions', label: 'Prescriptions', icon: ClipboardList },
];

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 text-center animate-fade-in">
      {/* Giant background numeral */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-8 select-none text-[12rem] font-black leading-none tracking-tighter text-warning/5 sm:text-[16rem]"
      >
        403
      </span>

      <div className="relative flex flex-col items-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning/10 ring-1 ring-warning/20 mb-6">
          <ShieldOff className="h-10 w-10 text-warning" />
        </div>

        {/* Badge */}
        <span className="text-caption font-bold text-warning bg-warning/10 px-3 py-1 rounded-full mb-4 tracking-wider">
          403 ERROR
        </span>

        {/* Title */}
        <h1 className="text-heading font-bold text-fg mb-2">Access Denied</h1>

        {/* Description */}
        <p className="text-body text-fg-muted mb-8 max-w-sm">
          You don't have permission to access this page. Contact your
          administrator if you believe this is a mistake.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
          <Button asChild>
            <Link to="/" className="gap-1.5 flex justify-center items-center">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Quick links */}
        <div className="mt-10 w-full max-w-xs border-t border-border pt-6">
          <p className="text-caption text-fg-muted mb-3">Or jump to</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg"
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
