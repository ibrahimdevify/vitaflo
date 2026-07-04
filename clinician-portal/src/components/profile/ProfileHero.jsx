import { Calendar } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export default function ProfileHero({ profileData, initials }) {
  const joinedDate = profileData.reg_date
    ? new Date(profileData.reg_date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const role = profileData.user_type?.name || profileData.user_type;

  return (
    <div className="flex items-center gap-5 border-b border-border pb-8">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white shadow-sm ring-4 ring-brand-500/10">
          {initials}
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-heading font-bold leading-tight tracking-tight text-fg">
          {profileData.f_name} {profileData.l_name}
        </h1>

        <div className="mt-2 flex items-center gap-3 flex-wrap">
          {role && (
            <Badge variant="brand" className="capitalize">
              {role}
            </Badge>
          )}

          {joinedDate && (
            <span className="flex items-center gap-1.5 text-caption text-fg-muted">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              Joined {joinedDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
