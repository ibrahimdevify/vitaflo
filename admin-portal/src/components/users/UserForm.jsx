import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronDown, Loader2, Save, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import Field from '../shared/Field';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';

const userSchema = z.object({
  f_name: z.string().min(1, 'First name is required'),
  l_name: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().optional(),
  ut_id_fk: z.number(),
  us_id_fk: z.number(),
});

export default function UserForm({
  userTypes,
  userStatuses,
  onSubmit,
  onCancel,
  initialData,
}) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      f_name: '',
      l_name: '',
      email: '',
      phone: '',
      password: '',
      ut_id_fk: 4,
      us_id_fk: 1,
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
        ut_id_fk: initialData.ut_id_fk || 4,
        us_id_fk: initialData.us_id_fk || 1,
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data) => {
    onSubmit({
      ...data,
      ut_id_fk: Number(data.ut_id_fk),
      us_id_fk: Number(data.us_id_fk),
    });
  };

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
            <UserRound className="h-3.5 w-3.5 text-white" />
          </div>
          {isEditing ? 'Edit User' : 'Add New User'}
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
                  isEditing ? 'Leave blank to keep' : 'Enter password'
                }
              />
            </Field>

            {/* User Type — DropdownMenu */}
            <Field label="User Type *">
              <Controller
                name="ut_id_fk"
                control={control}
                render={({ field }) => {
                  const selected = userTypes.find(
                    (t) => t.ut_id === field.value
                  );
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="w-full!">
                        <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                          <span
                            className={!selected ? 'text-fg-muted' : 'text-fg'}
                          >
                            {selected?.name || 'Select type'}
                          </span>
                          <ChevronDown className="h-4 w-4 text-fg-muted" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-(--anchor-width)"
                      >
                        {userTypes.map((t) => (
                          <DropdownMenuItem
                            key={t.ut_id}
                            onClick={() => field.onChange(t.ut_id)}
                            className={cn(
                              'cursor-pointer',
                              field.value === t.ut_id &&
                                'bg-surface-raised font-medium'
                            )}
                          >
                            {t.name}
                            {field.value === t.ut_id && (
                              <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }}
              />
            </Field>

            {/* Status — DropdownMenu */}
            <Field label="Status">
              <Controller
                name="us_id_fk"
                control={control}
                render={({ field }) => {
                  const selected = userStatuses.find(
                    (s) => s.us_id === field.value
                  );
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="w-full!">
                        <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                          <span
                            className={!selected ? 'text-fg-muted' : 'text-fg'}
                          >
                            {selected?.name || 'Select status'}
                          </span>
                          <ChevronDown className="h-4 w-4 text-fg-muted" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-(--anchor-width)"
                      >
                        {userStatuses.map((s) => (
                          <DropdownMenuItem
                            key={s.us_id}
                            onClick={() => field.onChange(s.us_id)}
                            className={cn(
                              'cursor-pointer',
                              field.value === s.us_id &&
                                'bg-surface-raised font-medium'
                            )}
                          >
                            {s.name}
                            {field.value === s.us_id && (
                              <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }}
              />
            </Field>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border mt-6">
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              {isEditing ? 'Update User' : 'Create User'}
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
