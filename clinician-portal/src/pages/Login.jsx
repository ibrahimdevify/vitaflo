import { zodResolver } from '@hookform/resolvers/zod';
import {
  Activity,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  username: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data) => {
    setError('');
    try {
      await login(data.username, data.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const loading = isSubmitting;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      {/* ——— Left: brand panel, hidden on small screens ——— */}
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-linear-to-br from-brand-900 via-brand-800 to-brand-950 p-12 text-white">
        <div className="flex items-center gap-2.5">
          <Stethoscope className="h-6 w-6 text-brand-300" />
          <span className="text-sm font-semibold tracking-wide text-brand-100">
            VitalFlow
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Every vital sign,
            <br />
            one clear line.
          </h1>
          <p className="max-w-sm text-brand-200 text-sm leading-relaxed">
            Spirometry trends, prescriptions, and patient notes — all synced in
            real time so nothing slips through on rounds.
          </p>

          {/* Signature element: a live ECG trace */}
          <div className="relative pt-4">
            <svg
              viewBox="0 0 320 60"
              className="w-full max-w-sm text-brand-400"
              fill="none"
            >
              <path
                d="M0 30 H100 L112 10 L124 50 L136 30 H180 L192 18 L200 42 L208 30 H320"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
            </svg>
            <span className="absolute right-0 top-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-300" />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-300">
          <ShieldCheck className="h-4 w-4" />
          Built for secure clinical data handling
        </div>
      </div>

      {/* ——— Right: form panel ——— */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Brand mark shown only when the left panel is hidden */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="rounded-full bg-brand-500/10 p-2">
              <Stethoscope className="h-5 w-5 text-brand-500" />
            </div>
            <span className="text-sm font-semibold text-fg">VitalFlow</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-fg">
            Clinician Portal
          </h2>
          <p className="mt-1.5 text-sm text-fg-muted">
            Sign in to manage your patients
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-xs font-medium text-fg-muted"
              >
                Email or phone
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
                <Input
                  id="username"
                  type="text"
                  placeholder="doctor@vitalflow.com"
                  {...register('username')}
                  className="h-11 pl-10"
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-danger">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-fg-muted"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  {...register('password')}
                  className="h-11 pl-10 pr-10"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-muted/90 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="h-11 w-full bg-brand-600 text-white hover:bg-brand-700"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-fg-muted lg:hidden">
            <Activity className="h-3.5 w-3.5" />
            Built for secure clinical data handling
          </p>
        </div>
      </div>
    </div>
  );
}
