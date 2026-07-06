import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Save, Shield } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

const passwordSchema = z
  .object({
    current: z.string().min(1, 'Current password is required'),
    new: z
      .string()
      .min(6, 'At least 6 characters')
      .regex(/^\S+$/, 'Password cannot contain spaces'),
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

function PasswordField({ label, placeholder, registration, error }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-caption font-medium text-fg-muted">{label}</label>
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          {...registration}
          placeholder={placeholder}
          className="pr-9"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error.message}</p>}
    </div>
  );
}

export default function ProfileSecurity({
  changing,
  onStartChange,
  onCancel,
  submitting,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: '', new: '', confirm: '' },
  });

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Card className="shadow-none border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-body font-semibold text-fg">
              Password & Security
            </h3>
            <p className="text-caption text-fg-muted">
              Manage your account security
            </p>
          </div>
          {!changing && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStartChange}
              className="gap-1.5"
            >
              <Shield className="h-3.5 w-3.5" /> Change
            </Button>
          )}
        </div>

        {changing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PasswordField
                label="Current password"
                placeholder="••••••••"
                registration={register('current')}
                error={errors.current}
              />
              <PasswordField
                label="New password"
                placeholder="••••••••"
                registration={register('new')}
                error={errors.new}
              />
              <PasswordField
                label="Confirm password"
                placeholder="••••••••"
                registration={register('confirm')}
                error={errors.confirm}
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" disabled={submitting} size="sm">
                {submitting && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                )}
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Update
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-card bg-surface-raised">
            <div className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 text-success" />
            </div>
            <p className="text-caption text-fg-muted">
              Use a strong, unique password and avoid reusing it across other
              accounts.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
