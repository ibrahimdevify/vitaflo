import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Loader2, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import ReadOnly from '../shared/ReadOnly';

const profileSchema = z.object({
  f_name: z.string().min(1, 'First name is required').max(50),
  l_name: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
});

export default function ProfileEditForm({
  editing,
  onStartEdit,
  onCancel,
  profileData,
  submitting,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      f_name: profileData?.f_name || '',
      l_name: profileData?.l_name || '',
      phone: profileData?.phone || '',
    },
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
              Personal Information
            </h3>
            <p className="text-caption text-fg-muted">
              Update your name and contact details
            </p>
          </div>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStartEdit}
              className="gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-caption font-medium text-fg-muted">
                  First name
                </label>
                <Input {...register('f_name')} placeholder="John" />
                {errors.f_name && (
                  <p className="text-xs text-danger">{errors.f_name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-caption font-medium text-fg-muted">
                  Last name
                </label>
                <Input {...register('l_name')} placeholder="Doe" />
                {errors.l_name && (
                  <p className="text-xs text-danger">{errors.l_name.message}</p>
                )}
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-caption font-medium text-fg-muted">
                  Phone number
                </label>
                <Input {...register('phone')} placeholder="+1 (555) 000-0000" />
                {errors.phone && (
                  <p className="text-xs text-danger">{errors.phone.message}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" disabled={submitting} size="sm">
                {submitting && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                )}
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <ReadOnly label="First Name" value={profileData.f_name} />
            <ReadOnly label="Last Name" value={profileData.l_name} />
            <ReadOnly label="Phone" value={profileData.phone} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
