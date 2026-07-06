import { Clock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Unauthorized() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center animate-fade-in bg-surface">
      {/* Giant background numeral */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-8 select-none text-[12rem] font-black leading-none tracking-tighter text-warning/5 sm:text-[16rem]"
      >
        401
      </span>

      <div className="relative flex flex-col items-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning/10 ring-1 ring-warning/20 mb-6">
          <Clock className="h-10 w-10 text-warning" />
        </div>

        {/* Badge */}
        <span className="text-caption font-bold text-warning bg-warning/10 px-3 py-1 rounded-full mb-4 tracking-wider">
          SESSION EXPIRED
        </span>

        {/* Title */}
        <h1 className="text-heading font-bold text-fg mb-2">Session Expired</h1>

        {/* Description */}
        <p className="text-body text-fg-muted mb-8 max-w-sm">
          Your session has expired or you've been logged out. Please sign in
          again to continue.
        </p>

        {/* Actions */}
        <Button asChild size="lg" className="gap-2">
          <Link
            to="/login"
            className="flex justify-center items-center gap-1.5"
          >
            <LogIn className="h-4 w-4" />
            Sign In Again
          </Link>
        </Button>
      </div>
    </div>
  );
}
