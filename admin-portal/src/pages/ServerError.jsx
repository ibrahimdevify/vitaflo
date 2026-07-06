import {
  ArrowLeft,
  ClipboardList,
  Home,
  RefreshCw,
  ServerCrash,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const quickLinks = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/patients', label: 'My Patients', icon: Users },
  { to: '/prescriptions', label: 'Prescriptions', icon: ClipboardList },
];

export default function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center animate-fade-in">
      {/* Giant background numeral */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-8 select-none text-[12rem] font-black leading-none tracking-tighter text-danger/5 sm:text-[16rem]"
      >
        500
      </span>

      <div className="relative flex flex-col items-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 ring-1 ring-danger/20 mb-6">
          <ServerCrash className="h-10 w-10 text-danger" />
        </div>

        {/* Badge */}
        <span className="text-caption font-bold text-danger bg-danger/10 px-3 py-1 rounded-full mb-4 tracking-wider">
          500 ERROR
        </span>

        {/* Title */}
        <h1 className="text-heading font-bold text-fg mb-2">Server Error</h1>

        {/* Description */}
        <p className="text-body text-fg-muted mb-8 max-w-sm">
          Something went wrong on our end. Please try again in a few moments.
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
          <Button onClick={() => window.location.reload()} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
