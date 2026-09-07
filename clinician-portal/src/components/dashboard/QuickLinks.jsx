import { Bell, FileText, StickyNote, UserPlus, Users, Wind } from 'lucide-react';
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
          <Link key={to} to={to} className="block">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-2 p-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-(--radius-control) bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-caption font-semibold text-fg">{label}</p>
                  <p className="text-caption text-fg-muted">{description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}