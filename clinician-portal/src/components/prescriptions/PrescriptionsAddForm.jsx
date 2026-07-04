import { zodResolver } from '@hookform/resolvers/zod';
import { ClipboardList, Loader2, Pill, Plus, X } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import MedicineRow from './MedicineRow';

const medicineSchema = z.object({
  drug: z.string().min(1, 'Drug name is required'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  quantity: z.string().optional(),
  days: z.string().optional(),
  direction: z.string().optional(),
});

const prescriptionSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  pharmacy_instruction: z.string().optional(),
  medicines: z
    .array(medicineSchema)
    .min(1, 'At least one medicine is required'),
});

export default function PrescriptionsAddForm({
  patientId,
  submitting,
  onSubmit,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      diagnosis: '',
      pharmacy_instruction: '',
      medicines: [
        {
          drug: '',
          dosage: '',
          frequency: '',
          quantity: '',
          days: '',
          direction: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicines',
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
            <Pill className="h-3.5 w-3.5 text-white" />
          </div>
          New Prescription for Patient {patientId}
        </CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-caption font-medium text-fg-muted mb-1.5 block">
                Diagnosis <span className="text-danger">*</span>
              </label>
              <Input
                {...register('diagnosis')}
                placeholder="e.g., Asthma, COPD, Bronchitis"
              />
              {errors.diagnosis && (
                <p className="text-caption text-danger mt-1">
                  {errors.diagnosis.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-caption font-medium text-fg-muted mb-1.5 block">
                Pharmacy Instructions
              </label>
              <Input
                {...register('pharmacy_instruction')}
                placeholder="e.g., Take as needed, Before meals"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-caption font-medium text-fg-muted">
                Medicines <span className="text-danger">*</span>
              </label>
              <Badge variant="secondary">
                {fields.length} medicine{fields.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            {errors.medicines?.root && (
              <p className="text-caption text-danger mb-2">
                {errors.medicines.root.message}
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <MedicineRow
                  key={field.id}
                  index={index}
                  register={register}
                  errors={errors}
                  onRemove={remove}
                  showRemove={fields.length > 1}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  drug: '',
                  dosage: '',
                  frequency: '',
                  quantity: '',
                  days: '',
                  direction: '',
                })
              }
              className="mt-3 border-border gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Medicine
            </Button>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={submitting}>
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              )}
              <ClipboardList className="h-4 w-4 mr-1.5" />
              {submitting ? 'Saving...' : 'Create Prescription'}
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
