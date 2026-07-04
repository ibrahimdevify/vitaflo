import {
  ArrowLeft,
  ClipboardList,
  FileQuestion,
  Home,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const quickLinks = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/patients', label: 'My Patients', icon: Users },
  { to: '/prescriptions', label: 'Prescriptions', icon: ClipboardList },
];

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 text-center animate-fade-in">
      {/* Giant background numeral */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-8 select-none text-[12rem] font-black leading-none tracking-tighter text-danger/5 sm:text-[16rem]"
      >
        404
      </span>

      <div className="relative flex flex-col items-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 ring-1 ring-danger/20 mb-6">
          <FileQuestion className="h-10 w-10 text-danger" />
        </div>

        {/* Badge */}
        <span className="text-caption font-bold text-danger bg-danger/10 px-3 py-1 rounded-full mb-4 tracking-wider">
          404 ERROR
        </span>

        {/* Title */}
        <h1 className="text-heading font-bold text-fg mb-2">Page not found</h1>

        {/* Description */}
        <p className="text-body text-fg-muted mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved to another
          location.
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
