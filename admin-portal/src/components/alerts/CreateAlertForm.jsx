import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Field from '../shared/Field';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

const alertSchema = z.object({
  user_id: z.string().min(1, 'Patient ID is required'),
  message: z.string().min(1, 'Message is required'),
});

export default function CreateAlertForm({ submitting, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(alertSchema),
    defaultValues: { user_id: '', message: '' },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-danger to-danger/70">
            <AlertTriangle className="h-3.5 w-3.5 text-white" />
          </div>
          Create Alert
        </CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Patient ID *" error={errors.user_id?.message}>
            <Input {...register('user_id')} placeholder="Enter patient ID" />
          </Field>
          <Field label="Message *" error={errors.message?.message}>
            <Input
              {...register('message')}
              placeholder="e.g., FEV1 below 80% threshold"
            />
          </Field>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <AlertTriangle className="h-4 w-4" />
              {submitting ? 'Creating...' : 'Create Alert'}
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
