import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Loader2, Save, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { usersAPI } from '../../services/api';
import Field from '../shared/Field';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';

const step1Schema = z.object({
  f_name: z.string().min(1, 'First name is required'),
  l_name: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().optional(),
});

const step2Schema = z.object({
  license_no: z.string().min(1, 'License number is required'),
  experience: z.string().optional(),
  about_doctor: z.string().optional(),
  education: z.string().optional(),
  is_specialist: z.boolean().optional(),
});

const fullSchema = step1Schema.merge(step2Schema);

export default function ClinicianForm({ onCancel, onSuccess, initialData }) {
  const isEditing = !!initialData;
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(
      isEditing ? fullSchema : step === 1 ? step1Schema : step2Schema
    ),
    defaultValues: {
      f_name: '',
      l_name: '',
      email: '',
      phone: '',
      password: '',
      license_no: '',
      experience: '2 yrs',
      about_doctor: '',
      education: '',
      is_specialist: false,
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
        license_no: initialData.doctor_details?.license_no || '',
        experience: initialData.doctor_details?.experience || '2 yrs',
        about_doctor: initialData.doctor_details?.about_doctor || '',
        education: initialData.doctor_details?.education || '',
        is_specialist: initialData.doctor_details?.is_specialist || false,
      });
    }
  }, [initialData, reset]);

  const handleNext = () => setStep(2);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await usersAPI.update(initialData.user_id, {
          f_name: data.f_name,
          l_name: data.l_name,
          email: data.email,
          phone: data.phone,
          ...(data.password && { password: data.password }),
        });
        toast.success('Clinician updated!');
      } else {
        await usersAPI.create({
          ...data,
          ut_id_fk: 3,
          h_id_fk: 1,
        });
        toast.success('Clinician created!');
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save clinician');
    }
  };

  return (
    <Card>
      {/* Step Indicator */}
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-center gap-2">
          {[1, 2].map((s, idx, arr) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  s <= step
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-surface-raised text-fg-muted'
                }`}
              >
                {s <= step ? '✓' : s}
              </div>
              <span
                className={`text-sm font-medium ${
                  s <= step ? 'text-fg' : 'text-fg-muted'
                }`}
              >
                {s === 1 ? 'Basic Info' : 'Professional'}
              </span>
              {idx < arr.length - 1 && (
                <div
                  className={`h-px w-8 ${s < step ? 'bg-brand-400' : 'bg-border'}`}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form
          onSubmit={handleSubmit(
            isEditing ? onSubmit : step === 1 ? handleNext : onSubmit
          )}
        >
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
                  <UserRound className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-body font-semibold text-fg">
                  {isEditing ? 'Edit Information' : 'Basic Information'}
                </h3>
              </div>

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
                    placeholder="doctor@example.com"
                  />
                </Field>
                <Field label="Phone *" error={errors.phone?.message}>
                  <Input {...register('phone')} placeholder="1234567890" />
                </Field>
                <Field
                  label={`Password ${isEditing ? '(leave blank)' : '*'}`}
                  error={errors.password?.message}
                >
                  <Input
                    {...register('password')}
                    type="password"
                    placeholder={isEditing ? 'Leave blank' : 'Min 6 chars'}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
                  <UserRound className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-body font-semibold text-fg">
                  Professional Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="License Number *"
                  error={errors.license_no?.message}
                >
                  <Input {...register('license_no')} placeholder="LIC-001" />
                </Field>
                <Field label="Experience" error={errors.experience?.message}>
                  <Input {...register('experience')} placeholder="5 yrs" />
                </Field>
                <div className="md:col-span-2">
                  <label className="text-caption font-medium text-fg-muted mb-1.5 block">
                    About
                  </label>
                  <textarea
                    {...register('about_doctor')}
                    className="w-full rounded-(--radius-control) border border-border bg-surface text-fg px-3 py-2 text-body min-h-20 resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/30 focus-visible:border-focus-ring placeholder:text-fg-muted"
                    placeholder="Brief description about the doctor..."
                  />
                </div>
                <Field label="Education" error={errors.education?.message}>
                  <Input
                    {...register('education')}
                    placeholder="MD, Harvard Medical School"
                  />
                </Field>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="specialist"
                    {...register('is_specialist')}
                    className="h-4 w-4 rounded border-border accent-brand-600"
                  />
                  <label
                    htmlFor="specialist"
                    className="text-sm font-medium text-fg"
                  >
                    Is Specialist
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-6 border-t border-border mt-6">
            {step > 1 && !isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="border-border gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? (
                'Saving...'
              ) : step === 2 || isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Update Clinician' : 'Create Clinician'}
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" />
                </>
              )}
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
