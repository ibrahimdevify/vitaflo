import { ChevronDown, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext';

export default function SidebarProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = `${user?.f_name?.[0] ?? ''}${user?.l_name?.[0] ?? ''}`;

  return (
    <div className="p-3 pt-1">
      <div className="mx-2 mb-2 h-px bg-white/5" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="group w-full flex items-center gap-3 px-3 py-2.5 text-brand-100 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer data-[state=open]:bg-white/5">
            <Avatar className="h-9 w-9 ring-2 ring-white/10">
              <AvatarFallback className="bg-linear-to-br from-brand-400 to-brand-600 text-sm font-semibold text-white">
                {initials || 'JD'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.f_name || 'John'} {user?.l_name || 'Doe'}
              </p>
              <p className="text-xs text-brand-400 truncate">
                {user?.email || 'example@gmail.com'}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-brand-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="center"
          sideOffset={10}
          className="w-64 p-1.5 bg-surface border border-border shadow-dropdown rounded-card"
        >
          <div className="flex items-center gap-3 px-2.5 py-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-linear-to-br from-brand-400 to-brand-600 text-sm font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-fg truncate">
                {user?.f_name} {user?.l_name}
              </p>
              <p className="text-xs text-fg-muted truncate">{user?.email}</p>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-border my-1" />

          <DropdownMenuItem
            onClick={() => navigate('/profile')}
            className="rounded-control cursor-pointer px-2.5 py-2 text-fg focus:bg-surface-raised"
          >
            <User className="h-4 w-4 mr-2.5 text-fg-muted" />
            <span className="text-sm font-medium">Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-danger focus:text-danger focus:bg-danger/10 rounded-control cursor-pointer px-2.5 py-2 mt-0.5"
          >
            <LogOut className="h-4 w-4 mr-2.5" />
            <span className="text-sm font-medium">Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
