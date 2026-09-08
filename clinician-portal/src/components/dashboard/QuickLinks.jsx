import {
  Bell,
  FileText,
  StickyNote,
  UserPlus,
  Users,
  Wind,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';

// Matches the routes defined in App.jsx exactly.
const QUICK_LINKS = [
  {
    label: 'View Patients',
    description: 'Browse and search all patients',
    icon: Users,
    to: '/patients',
  },
  {
    label: 'Add Patient',
    description: 'Register a new patient',
    icon: UserPlus,
    to: '/patients/add',
  },
  {
    label: 'Spirometry',
    description: 'Review spirometry sessions',
    icon: Wind,
    to: '/spirometry',
  },
  {
    label: 'Prescriptions',
    description: 'View and manage prescriptions',
    icon: FileText,
    to: '/prescriptions',
  },
  {
    label: 'Notes',
    description: 'Clinical notes',
    icon: StickyNote,
    to: '/notes',
  },
  {
    label: 'Alerts',
    description: 'Patient alert history',
    icon: Bell,
    to: '/alerts',
  },
];

export default function QuickLinks() {
  return (
    <div className="mb-8">
      <h2 className="text-body font-semibold text-fg mb-3">Quick Links</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_LINKS.map(({ label, description, icon: Icon, to }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-all duration-200 hover:border-brand-200 hover:shadow-sm">
              <CardContent className="relative flex items-center gap-3 p-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius-control) bg-surface-100 text-fg-muted transition-all duration-200 group-hover:bg-brand-50 group-hover:text-brand-600">
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-caption font-semibold text-fg">
                    {label}
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-fg-muted">
                    {description}
                  </p>
                </div>

                <span className="text-fg-muted opacity-0 -translate-x-1 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                  →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
