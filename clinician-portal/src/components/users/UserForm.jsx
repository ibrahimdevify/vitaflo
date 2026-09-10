import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Field from '../shared/Field';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

// ut_id_fk / us_id_fk dropdowns removed: createClinicianUser hardcodes
// ut_id_fk: 3 server-side (ignores anything sent from the client), and
// there's no status-list endpoint to populate a status dropdown from.
// us_id_fk defaults to 1 (active) server-side on create.
const getUserSchema = (isEditing) =>
  z.object({
    f_name: z.string().min(1, 'First name is required'),
    l_name: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    phone: z.string().min(1, 'Phone is required'),
    password: isEditing
      ? z.string().optional()
      : z.string().min(6, 'Password must be at least 6 characters'),
    is_guardian: z.boolean().optional(),
    is_rpm_allow: z.boolean().optional(),
    is_availible: z.boolean().optional(),
    is_profile_completed: z.boolean().optional(),
  });

export default function UserForm({ onSubmit, onCancel, initialData }) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(getUserSchema(isEditing)),
    defaultValues: {
      f_name: '',
      l_name: '',
      email: '',
      phone: '',
      password: '',
      is_guardian: false,
      is_rpm_allow: false,
      is_availible: true,
      is_profile_completed: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        f_name: initialData.f_name || '',
        l_name: initialData.l_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: '',
        is_guardian: !!initialData.is_guardian,
        is_rpm_allow: !!initialData.is_rpm_allow,
        is_availible: initialData.is_availible ?? true,
        is_profile_completed: !!initialData.is_profile_completed,
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data) => {
    // Drop empty password on edit so it doesn't overwrite the existing one
    // (updateClinicianUser only hashes/sets it when the field is truthy).
    const payload = { ...data };
    if (isEditing && !payload.password) delete payload.password;
    onSubmit(payload);
  };

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
            <UserRound className="h-3.5 w-3.5 text-white" />
          </div>
          {isEditing ? 'Edit Clinician' : 'Add New Clinician'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name *" error={errors.f_name?.message}>
              <Input {...register('f_name')} placeholder="John" />
            </Field>
            <Field label="Last Name *" error={errors.l_name?.message}>
              <Input {...register('l_name')} placeholder="Doe" />
            </Field>
            <Field label="Email *" error={errors.email?.message}>
              <Input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
              />
            </Field>
            <Field label="Phone *" error={errors.phone?.message}>
              <Input {...register('phone')} placeholder="1234567890" />
            </Field>
            <Field
              label={`Password ${!isEditing ? '*' : ''}`}
              error={errors.password?.message}
            >
              <Input
                {...register('password')}
                type="password"
                placeholder={
                  isEditing ? 'Leave blank to keep current' : 'Enter password'
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 text-body text-fg cursor-pointer">
              <input type="checkbox" {...register('is_guardian')} />
              Guardian account
            </label>
            <label className="flex items-center gap-2 text-body text-fg cursor-pointer">
              <input type="checkbox" {...register('is_rpm_allow')} />
              RPM allowed
            </label>
            {isEditing && (
              <>
                <label className="flex items-center gap-2 text-body text-fg cursor-pointer">
                  <input type="checkbox" {...register('is_availible')} />
                  Available
                </label>
                <label className="flex items-center gap-2 text-body text-fg cursor-pointer">
                  <input type="checkbox" {...register('is_profile_completed')} />
                  Profile completed
                </label>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-border mt-6">
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              {isEditing ? 'Update Clinician' : 'Create Clinician'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-border"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}