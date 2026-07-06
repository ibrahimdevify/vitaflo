import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Field from '../shared/Field';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  breezometer: z.boolean().optional(),
  awair: z.boolean().optional(),
  bronchodilator_responsiveness_testing: z.boolean().optional(),
  clinical_decision_support_flowchart: z.boolean().optional(),
});

const features = [
  { key: 'breezometer', label: 'Breezometer' },
  { key: 'awair', label: 'Awair' },
  {
    key: 'bronchodilator_responsiveness_testing',
    label: 'Bronchodilator Test',
  },
  {
    key: 'clinical_decision_support_flowchart',
    label: 'Clinical Decision Support',
  },
];

export default function AccountForm({
  initialData,
  submitting,
  onSubmit,
  onCancel,
}) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      breezometer: true,
      awair: true,
      bronchodilator_responsiveness_testing: true,
      clinical_decision_support_flowchart: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      const attrs = initialData.account_attributes || {};
      reset({
        name: initialData.name || '',
        breezometer: attrs.breezometer ?? true,
        awair: attrs.awair ?? true,
        bronchodilator_responsiveness_testing:
          attrs.bronchodilator_responsiveness_testing ?? true,
        clinical_decision_support_flowchart:
          attrs.clinical_decision_support_flowchart ?? false,
      });
    }
  }, [initialData, reset]);

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          {isEditing ? 'Edit Account' : 'Create Account'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field label="Account Name *" error={errors.name?.message}>
            <Input {...register('name')} placeholder="Hospital Name" />
          </Field>

          <div>
            <label className="text-caption font-medium text-fg-muted mb-2 block">
              Features
            </label>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feat) => (
                <label
                  key={feat.key}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded-(--radius-control) hover:bg-surface-raised transition-colors"
                >
                  <input
                    type="checkbox"
                    {...register(feat.key)}
                    className="h-4 w-4 rounded border-border accent-brand-600"
                  />
                  <span className="text-body text-fg">{feat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border mt-6">
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              {isEditing ? 'Update Account' : 'Create Account'}
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
