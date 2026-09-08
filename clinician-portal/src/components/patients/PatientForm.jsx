import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronDown, Loader2, Save, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { patientsAPI } from '../../services/api';
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

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genderOptions = ['M', 'F'];

const patientSchema = z.object({
  f_name: z.string().min(1, 'First name is required'),
  l_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().optional(),
  dob: z.string().optional(),
  chart_no: z.string().optional(),
  blood_group: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  gender: z.string().optional(),
  status: z.string().optional(),
  patient_group_id: z.string().optional(),
});

export default function PatientForm({ onCancel, onSuccess, initialData }) {
  const isEditing = !!initialData;
  const { user } = useAuth();
  const [patientGroups, setPatientGroups] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      f_name: '',
      l_name: '',
      email: '',
      phone: '',
      password: '',
      dob: '',
      chart_no: '',
      blood_group: '',
      height: '',
      weight: '',
      gender: 'M',
      status: 'active',
      patient_group_id: '',
    },
  });

  useEffect(() => {
    // Load patient groups
    patientsAPI
      .getGroups()
      .then((res) => setPatientGroups(res.data.data || []))
      .catch(() => setPatientGroups([]));
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        f_name: initialData.f_name || '',
        l_name: initialData.l_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: '',
        dob: initialData.patient_details?.attributes?.dob || '',
        chart_no: initialData.patient_details?.chart_no || '',
        blood_group: initialData.patient_details?.blood_group || '',
        height:
          initialData.patient_details?.attributes?.height?.toString() || '',
        weight:
          initialData.patient_details?.attributes?.weight?.toString() || '',
        gender: initialData.patient_details?.attributes?.gender || 'M',
        status: initialData.patient_details?.status || 'active',
        patient_group_id:
          initialData.patient_details?.patient_group_id?.toString() || '',
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        f_name: data.f_name,
        l_name: data.l_name,
        email:
          data.email ||
          `${data.f_name.toLowerCase()}.${data.l_name.toLowerCase()}@VitalFlo.com`,
        phone: data.phone,
        password: data.password || 'TempPass123!',
        dob: data.dob,
        chart_no: data.chart_no || '',
        blood_group: data.blood_group || null,
        height: data.height ? parseFloat(data.height) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        gender: data.gender || '',
        status: data.status || 'active',
        patient_group_id: data.patient_group_id
          ? parseInt(data.patient_group_id)
          : null,
        // Auto-assign logged-in clinician
        assigned_clinician_id: user?.user_id || user?.id,
      };

      await patientsAPI.create(payload);
      toast.success(
        isEditing
          ? 'Patient updated successfully!'
          : 'Patient created successfully!'
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          (isEditing ? 'Failed to update patient' : 'Failed to create patient')
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold text-fg flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
            <UserRound className="h-3.5 w-3.5 text-white" />
          </div>
          {isEditing ? 'Edit Patient' : 'Patient Information'}
        </CardTitle>
        <p className="text-caption text-fg-muted mt-1">
          {isEditing
            ? 'Update patient information below'
            : 'Fill in the patient details below to create a new record'}
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-body font-semibold text-fg border-b border-border pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="First Name *" error={errors.f_name?.message}>
                <Input {...register('f_name')} placeholder="John" />
              </Field>
              <Field label="Last Name *" error={errors.l_name?.message}>
                <Input {...register('l_name')} placeholder="Doe" />
              </Field>
              <Field label="Email (optional)" error={errors.email?.message}>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="john@example.com"
                />
              </Field>
              <Field label="Phone *" error={errors.phone?.message}>
                <Input {...register('phone')} placeholder="1234567890" />
              </Field>
              <Field label="Password (default: TempPass123!)">
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="Min 6 chars"
                />
              </Field>
              <Field label="Date of Birth">
                <Input {...register('dob')} type="date" />
              </Field>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="space-y-4">
            <h3 className="text-body font-semibold text-fg border-b border-border pb-2">
              Medical Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Chart Number">
                <Input {...register('chart_no')} placeholder="CH-001" />
              </Field>
              <Field label="Blood Group">
                <Controller
                  name="blood_group"
                  control={control}
                  render={({ field }) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                          <span
                            className={
                              !field.value ? 'text-fg-muted' : 'text-fg'
                            }
                          >
                            {field.value || 'Select Blood Group'}
                          </span>
                          <ChevronDown className="h-4 w-4 text-fg-muted" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-(--anchor-width)"
                      >
                        {bloodGroups.map((bg) => (
                          <DropdownMenuItem
                            key={bg}
                            onClick={() => field.onChange(bg)}
                            className={cn(
                              'cursor-pointer',
                              field.value === bg &&
                                'bg-surface-raised font-medium'
                            )}
                          >
                            {bg}
                            {field.value === bg && (
                              <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                />
              </Field>
              <Field label="Height (cm)">
                <Input
                  {...register('height')}
                  type="number"
                  step="0.1"
                  placeholder="170"
                />
              </Field>
              <Field label="Weight (kg)">
                <Input
                  {...register('weight')}
                  type="number"
                  step="0.1"
                  placeholder="70"
                />
              </Field>
              <Field label="Gender">
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                          <span className="text-fg">
                            {field.value === 'M' ? 'Male' : 'Female'}
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
                              field.value === g &&
                                'bg-surface-raised font-medium'
                            )}
                          >
                            {g === 'M' ? 'Male' : 'Female'}
                            {field.value === g && (
                              <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                />
              </Field>
              <Field label="Status">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                          <span className="text-fg">
                            {field.value === 'active' ? 'Active' : 'Pending'}
                          </span>
                          <ChevronDown className="h-4 w-4 text-fg-muted" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-(--anchor-width)"
                      >
                        <DropdownMenuItem
                          onClick={() => field.onChange('active')}
                          className="cursor-pointer"
                        >
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => field.onChange('unverified')}
                          className="cursor-pointer"
                        >
                          Unverified
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                />
              </Field>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="space-y-4">
            <h3 className="text-body font-semibold text-fg border-b border-border pb-2">
              Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Patient Group">
                <Controller
                  name="patient_group_id"
                  control={control}
                  render={({ field }) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                          <span
                            className={
                              !field.value ? 'text-fg-muted' : 'text-fg'
                            }
                          >
                            {patientGroups.find(
                              (g) => g.id.toString() === field.value
                            )?.name || 'Select Patient Group'}
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
                          className="cursor-pointer text-fg-muted"
                        >
                          No Group
                        </DropdownMenuItem>
                        {patientGroups.map((g) => (
                          <DropdownMenuItem
                            key={g.id}
                            onClick={() => field.onChange(g.id.toString())}
                            className={cn(
                              'cursor-pointer',
                              field.value === g.id.toString() &&
                                'bg-surface-raised font-medium'
                            )}
                          >
                            {g.name}
                            {field.value === g.id.toString() && (
                              <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                />
              </Field>

              {/* Auto-assigned clinician info */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-raised border border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
                  <UserRound className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-fg">
                    Assigned Clinician: {user?.f_name} {user?.l_name}
                  </p>
                  <p className="text-xs text-fg-muted">
                    You will be automatically assigned to this patient
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-1.5 min-w-[150px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Update Patient' : 'Create Patient'}
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
