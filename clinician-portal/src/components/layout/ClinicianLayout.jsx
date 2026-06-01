import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Activity, FileText, Bell, Stethoscope,
  LogOut, Menu, ChevronDown, UserRound, ClipboardList, TrendingUp
} from 'lucide-react';
import { Button } from '../../componen../../components/ui/button';
import { Avatar, AvatarFallback } from '../../componen../../components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../componen../../components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../../componen../../components/ui/sheet';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/patients', icon: Users, label: 'My Patients' },
  { path: '/spirometry', icon: Activity, label: 'Spirometry' },
  { path: '/prescriptions', icon: ClipboardList, label: 'Prescriptions' },
  { path: '/trends', icon: TrendingUp, label: 'Trends' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/profile', icon: UserRound, label: 'Profile' },
];

export default function ClinicianLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-green-900 text-white">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-green-700">
        <Stethoscope className="h-7 w-7 text-green-400" />
        <span className="text-lg font-bold">Clinician Portal</span>
      </div>
      <nav className="flex-1 space-y-1 p-3 overflow-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-800 hover:text-white'
              }`}
              onClick={() => setOpen(false)}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-green-700 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center gap-3 text-green-100 hover:text-white hover:bg-green-800">
              <Avatar className="h-8 w-8"><AvatarFallback className="bg-green-600 text-sm">{user?.f_name?.[0]}{user?.l_name?.[0]}</AvatarFallback></Avatar>
              <div className="flex-1 text-left"><p className="text-sm font-medium text-white">{user?.f_name} {user?.l_name}</p><p className="text-xs text-green-300">{user?.email}</p></div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleLogout} className="text-red-500"><LogOut className="h-4 w-4 mr-2" /> Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-green-50">
      <aside className="hidden lg:block w-64 flex-shrink-0"><SidebarContent /></aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden absolute top-3 left-3 z-50"><Menu className="h-5 w-5" /></Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-green-900"><SidebarContent /></SheetContent>
      </Sheet>
      <main className="flex-1 overflow-auto"><div className="p-6"><Outlet /></div></main>
    </div>
  );
}
