import { UserRound } from 'lucide-react';

export default function ProfileEmpty() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in px-4">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-20 w-20 rounded-full bg-surface-raised flex items-center justify-center mb-6">
          <UserRound className="h-9 w-9 text-fg-muted" />
        </div>
        <p className="text-subheading font-semibold text-fg">
          Unable to load profile
        </p>
        <p className="text-caption text-fg-muted mt-1">
          Please try logging in again
        </p>
      </div>
    </div>
  );
}
