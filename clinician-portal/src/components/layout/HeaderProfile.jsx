import { ChevronDown, LogOut, User } from 'lucide-react';
import { useState } from 'react';
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
import { Button } from '../ui/button';
import Modal from '../ui/Modal';

export default function HeaderProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = `${user?.f_name?.[0] ?? ''}${user?.l_name?.[0] ?? ''}`;

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group flex cursor-pointer items-center gap-2 rounded-full p-1 outline-none transition-colors duration-200 hover:bg-surface-1"
            style={{
              backgroundColor: open ? 'var(--surface-1)' : undefined,
            }}
          >
            <div
              className="h-9 w-9 rounded-full transition-transform duration-200"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="text-caption font-semibold text-white">
                {initials || 'JD'}
              </span>
            </div>

            <div className="text-left lg:block hidden">
              <p className="text-caption font-medium leading-tight text-fg">
                {user?.f_name} {user?.l_name}
              </p>

              <p className="text-[11px] leading-tight text-muted">Clinician</p>
            </div>

            <ChevronDown
              className={`h-3.5 w-3.5 text-muted transition-transform duration-300 ${
                open ? 'text-(--active-surface)' : ''
              }`}
              style={{
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="profile-dropdown w-64 rounded-card border border-border bg-surface p-1.5 shadow-dropdown"
        >
          {/* Profile Info */}
          <div className="flex items-center gap-3 px-2.5 py-3">
            <Avatar className="h-9 w-9 rounded-full">
              <AvatarFallback className="rounded-full bg-linear-to-br from-brand-400 to-brand-600 text-sm font-semibold text-white">
                {initials || 'JD'}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg">
                {user?.f_name || 'John'} {user?.l_name || 'Doe'}
              </p>

              <p className="truncate text-xs text-fg-muted">
                {user?.email || 'example@gmail.com'}
              </p>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1 bg-border" />

          {/* Profile */}
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false);
              navigate('/profile');
            }}
            className="cursor-pointer rounded-control px-2.5 py-2 text-fg focus:bg-surface-raised"
          >
            <User className="mr-2.5 h-4 w-4 text-fg-muted" />
            <span className="text-sm font-medium">Profile</span>
          </DropdownMenuItem>

          {/* Logout */}
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false);
              setShowLogoutDialog(true);
            }}
            className="mt-0.5 cursor-pointer rounded-control px-2.5 py-2 text-danger focus:bg-danger/10 focus:text-danger"
          >
            <LogOut className="mr-2.5 h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Logout Confirmation */}
      <Modal
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        title="Logout Confirmation"
        className="max-w-md"
        ariaLabel="Logout Confirmation"
      >
        <p className="text-sm text-fg-muted">
          Are you sure you want to log out of your account? You will need to
          sign in again to access your dashboard.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowLogoutDialog(false)}
          >
            Cancel
          </Button>

          <Button size="sm" variant="danger" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </Modal>
    </>
  );
}
