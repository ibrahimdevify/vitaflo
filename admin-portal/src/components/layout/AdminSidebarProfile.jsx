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

export default function AdminSidebarProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-3 pt-1">
      <div className="mx-2 mb-2 h-px bg-white/5" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="w-full flex items-center gap-3 px-3 py-2.5 text-brand-100 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer data-[state=open]:bg-white/5 group">
            <Avatar className="h-9 w-9 ring-2 ring-white/10">
              <AvatarFallback className="bg-brand-600 text-sm font-medium text-white">
                {user?.f_name?.[0]}
                {user?.l_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.f_name} {user?.l_name}
              </p>
              <p className="text-xs text-brand-400 truncate">{user?.email}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-brand-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="center"
          sideOffset={10}
          className="w-64 p-2 bg-white dark:bg-gray-900 border-0 shadow-2xl shadow-black/20 dark:shadow-black/40 rounded-2xl ring-1 ring-black/5 dark:ring-white/10"
        >
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-brand-600 text-sm font-medium text-white">
                {user?.f_name?.[0]}
                {user?.l_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.f_name} {user?.l_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/*  Profile Link */}
          <DropdownMenuItem
            onClick={() => navigate('/profile')}
            className="rounded-lg cursor-pointer px-3 py-2.5 text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-800"
          >
            <User className="h-4 w-4 mr-2.5" />
            <span className="text-sm font-medium">Profile</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/40 rounded-lg cursor-pointer px-3 py-2.5 mt-0.5"
          >
            <LogOut className="h-4 w-4 mr-2.5" />
            <span className="text-sm font-medium">Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
