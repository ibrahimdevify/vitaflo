import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Save,
  UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import { patientsAPI, usersAPI } from '../../services/api';
import Field from '../shared/Field';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genderOptions = ['M', 'F'];

const step1Schema = z.object({
  f_name: z.string().min(1, 'First name is required'),
  l_name: z.string().min(1, 'Last name is required'),
  email: z.string().optional(),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().optional(),
  dob: z.string().optional(),
});

const step2Schema = z.object({
  chart_no: z.string().optional(),
  blood_group: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  gender: z.string().optional(),
  status: z.string().optional(),
});

const step3Schema = z.object({
  patient_group_id: z.string().optional(),
  assigned_clinician_id: z.string().optional(),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export default function PatientForm({ onCancel, onSuccess, initialData }) {
  const isEditing = !!initialData;
  const [step, setStep] = useState(1);
  const maxStep = isEditing ? 2 : 3;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(
      isEditing
        ? fullSchema
        : step === 1
          ? step1Schema
          : step === 2
            ? step2Schema
            : step3Schema
    ),
    defaultValues: {
      f_name: '',
      l_name: '',
      email: '',
      phone: '',
      password: '',
      chart_no: '',
      blood_group: '',
      height: '',
      weight: '',
      dob: '',
      gender: 'M',
      status: 'active',
      patient_group_id: '',
      assigned_clinician_id: '',
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
        chart_no: initialData.patient_details?.chart_no || '',
        blood_group: initialData.patient_details?.blood_group || '',
        height: initialData.patient_details?.attributes?.height || '',
        weight: initialData.patient_details?.attributes?.weight || '',
        dob: initialData.patient_details?.attributes?.dob || '',
        gender: initialData.patient_details?.attributes?.gender || 'M',
        status: initialData.patient_details?.status || 'active',
        patient_group_id: initialData.patient_details?.patient_group_id || '',
        assigned_clinician_id:
          initialData.patient_details?.assigned_clinician_id || '',
      });
    }
  }, [initialData, reset]);

  const handleNext = () => setStep((p) => p + 1);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        const userData = {
          f_name: data.f_name,
          l_name: data.l_name,
          email: data.email,
          phone: data.phone,
          us_id_fk: data.status === 'active' ? 1 : 4,
        };
        if (data.password) userData.password = data.password;

        await usersAPI.update(initialData.user_id, userData);

        if (initialData.patient_details?.pd_id) {
          try {
            await patientsAPI.updateAttributes(
              initialData.patient_details.pd_id,
              {
                first_name: data.f_name,
                last_name: data.l_name,
                phone: data.phone,
                dob: data.dob,
                height: data.height ? parseFloat(data.height) : undefined,
                weight: data.weight ? parseFloat(data.weight) : undefined,
                gender: data.gender,
              }
            );
          } catch (attrErr) {
            if (attrErr.response?.status === 404) {
              await patientsAPI.createAttributes(
                initialData.patient_details.pd_id,
                {
                  first_name: data.f_name,
                  last_name: data.l_name,
                  phone: data.phone,
                  dob: data.dob,
                  height: data.height ? parseFloat(data.height) : undefined,
                  weight: data.weight ? parseFloat(data.weight) : undefined,
                  gender: data.gender,
                }
              );
            }
          }
        }

        toast.success('Patient updated successfully!');
      } else {
        await usersAPI.create({
          f_name: data.f_name,
          l_name: data.l_name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          ut_id_fk: 4,
          dob: data.dob,
          chart_no: data.chart_no,
          blood_group: data.blood_group,
          patient_group_id: data.patient_group_id
            ? parseInt(data.patient_group_id)
            : undefined,
          assigned_clinician_id: data.assigned_clinician_id
            ? parseInt(data.assigned_clinician_id)
            : undefined,
          height: data.height ? parseFloat(data.height) : undefined,
          weight: data.weight ? parseFloat(data.weight) : undefined,
        });
        toast.success('Patient created successfully!');
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save patient');
    }
  };

  const formValues = watch();

  return (
    <Card>
      {/* Step Indicator */}
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3]
            .filter((s) => (isEditing ? s <= 2 : true))
            .map((s, idx, arr) => (
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
                  className={`text-sm font-medium ${s <= step ? 'text-fg' : 'text-fg-muted'}`}
                >
                  {s === 1 ? 'Info' : s === 2 ? 'Medical' : 'Assign'}
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
            isEditing || step >= maxStep ? onSubmit : handleNext
          )}
        >
          {/* Step 1: Basic Info */}
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
                <Field label="Email">
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="patient@example.com"
                  />
                </Field>
                <Field label="Phone *" error={errors.phone?.message}>
                  <Input {...register('phone')} placeholder="1234567890" />
                </Field>
                <Field label={`Password ${isEditing ? '(leave blank)' : '*'}`}>
                  <Input
                    {...register('password')}
                    type="password"
                    placeholder={isEditing ? 'Leave blank' : 'Min 6 chars'}
                  />
                </Field>
                <Field label="Date of Birth">
                  <Input {...register('dob')} type="date" />
                </Field>
              </div>
            </div>
          )}

          {/* Step 2: Medical Info */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
                  <UserRound className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-body font-semibold text-fg">
                  Medical Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Chart Number">
                  <Input {...register('chart_no')} placeholder="CH-001" />
                </Field>

                {/* Blood Group — DropdownMenu */}
                <Field label="Blood Group">
                  <Controller
                    name="blood_group"
                    control={control}
                    render={({ field }) => {
                      const selected = field.value || '';
                      return (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild className="w-full!">
                            <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                              <span
                                className={
                                  !selected ? 'text-fg-muted' : 'text-fg'
                                }
                              >
                                {selected || 'Select'}
                              </span>
                              <ChevronDown className="h-4 w-4 text-fg-muted" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-(--anchor-width)"
                          >
                            <DropdownMenuItem
                              onClick={() => field.onChange('')}
                              className={cn(
                                'cursor-pointer',
                                !selected && 'bg-surface-raised font-medium'
                              )}
                            >
                              Select
                              {!selected && (
                                <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                              )}
                            </DropdownMenuItem>
                            {bloodGroups.map((bg) => (
                              <DropdownMenuItem
                                key={bg}
                                onClick={() => field.onChange(bg)}
                                className={cn(
                                  'cursor-pointer',
                                  selected === bg &&
                                    'bg-surface-raised font-medium'
                                )}
                              >
                                {bg}
                                {selected === bg && (
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

                <Field label="Height (cm)">
                  <Input
                    {...register('height')}
                    type="number"
                    placeholder="170"
                  />
                </Field>
                <Field label="Weight (kg)">
                  <Input
                    {...register('weight')}
                    type="number"
                    placeholder="70"
                  />
                </Field>

                {/* Gender — DropdownMenu */}
                <Field label="Gender">
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => {
                      const selected = field.value;
                      return (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild className="w-full!">
                            <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                              <span className="text-fg">
                                {selected === 'M' ? 'Male' : 'Female'}
                              </span>
                              <ChevronDown className="h-4 w-4 text-fg-muted" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-(--anchor-width)"
                          >
                            {genderOptions.map((g) => (
                              <DropdownMenuItem
                                key={g}
                                onClick={() => field.onChange(g)}
                                className={cn(
                                  'cursor-pointer',
                                  selected === g &&
                                    'bg-surface-raised font-medium'
                                )}
                              >
                                {g === 'M' ? 'Male' : 'Female'}
                                {selected === g && (
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
                    name="status"
                    control={control}
                    render={({ field }) => {
                      const selected = field.value;
                      const statusOptions = [
                        { value: 'active', label: 'Active' },
                        { value: 'unverified', label: 'Unverified' },
                        { value: 'verified', label: 'Verified' },
                      ];
                      const current = statusOptions.find(
                        (s) => s.value === selected
                      );
                      return (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild className="w-full!">
                            <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                              <span className="text-fg">
                                {current?.label || 'Select'}
                              </span>
                              <ChevronDown className="h-4 w-4 text-fg-muted" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-(--anchor-width)"
                          >
                            {statusOptions.map((s) => (
                              <DropdownMenuItem
                                key={s.value}
                                onClick={() => field.onChange(s.value)}
                                className={cn(
                                  'cursor-pointer',
                                  selected === s.value &&
                                    'bg-surface-raised font-medium'
                                )}
                              >
                                {s.label}
                                {selected === s.value && (
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
            </div>
          )}

          {/* Step 3: Assignment (Create only) */}
          {step === 3 && !isEditing && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-warning to-warning/70">
                  <UserRound className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-body font-semibold text-fg">Assignment</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Patient Group ID">
                  <Input
                    {...register('patient_group_id')}
                    placeholder="Group ID (optional)"
                  />
                </Field>
                <Field label="Assigned Clinician ID">
                  <Input
                    {...register('assigned_clinician_id')}
                    placeholder="Clinician ID (optional)"
                  />
                </Field>
              </div>
              <div className="bg-surface-raised rounded-card p-4 text-body">
                <p className="text-sm font-semibold text-fg mb-2">Summary</p>
                <div className="space-y-1 text-sm text-fg-muted">
                  <p>
                    Name: {formValues.f_name} {formValues.l_name}
                  </p>
                  <p>
                    Email: {formValues.email || 'N/A'} | Phone:{' '}
                    {formValues.phone}
                  </p>
                  <p>
                    Chart: {formValues.chart_no || 'N/A'} | Blood:{' '}
                    {formValues.blood_group || 'N/A'}
                  </p>
                  <p>
                    Height: {formValues.height || 'N/A'}cm | Weight:{' '}
                    {formValues.weight || 'N/A'}kg
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-6 border-t border-border mt-6">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-border gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? (
                'Saving...'
              ) : step >= maxStep ? (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Update Patient' : 'Create Patient'}
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
