import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, Loader2, Send, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Field from '../shared/Field';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

const notifySchema = z.object({
  user_id: z.string().min(1, 'Patient ID is required'),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
});

export default function SendNotificationForm({
  submitting,
  onSubmit,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(notifySchema),
    defaultValues: { user_id: '', title: '', body: '' },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
            <Bell className="h-3.5 w-3.5 text-white" />
          </div>
          Send Push Notification
        </CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Patient ID *" error={errors.user_id?.message}>
              <Input {...register('user_id')} placeholder="Enter patient ID" />
            </Field>
            <Field label="Title *" error={errors.title?.message}>
              <Input {...register('title')} placeholder="e.g., Health Alert" />
            </Field>
          </div>
          <Field label="Body *" error={errors.body?.message}>
            <textarea
              {...register('body')}
              className="w-full rounded-(--radius-control) border border-border bg-surface text-fg px-3 py-2 text-body min-h-25 resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/30 placeholder:text-fg-muted"
              placeholder="e.g., Your FEV1 has dropped below 80%. Please contact your doctor."
            />
          </Field>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Send className="h-4 w-4" />
              {submitting ? 'Sending...' : 'Send Notification'}
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
