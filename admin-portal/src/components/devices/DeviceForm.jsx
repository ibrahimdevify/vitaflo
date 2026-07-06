import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon, Loader2, Save, Smartphone } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Field from '../shared/Field';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

const deviceSchema = z.object({
  dev_name: z.string().min(1, 'Device name is required'),
  dev_detail: z.string().optional(),
  dev_image: z.string().optional(),
});

export default function DeviceForm({
  initialData,
  submitting,
  onSubmit,
  onCancel,
}) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: { dev_name: '', dev_detail: '', dev_image: '' },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        dev_name: initialData.dev_name || '',
        dev_detail: initialData.dev_detail || '',
        dev_image: initialData.dev_image || '',
      });
    }
  }, [initialData, reset]);

  const imageUrl = watch('dev_image');

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-warning to-warning/70">
            <Smartphone className="h-3.5 w-3.5 text-white" />
          </div>
          {isEditing ? 'Edit Device' : 'Register New Device'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Device Name *" error={errors.dev_name?.message}>
              <Input {...register('dev_name')} placeholder="Air Sensor A1" />
            </Field>
            <Field label="Description">
              <Input
                {...register('dev_detail')}
                placeholder="Indoor air quality monitor"
              />
            </Field>
            <div className="md:col-span-2">
              <Field
                label={
                  <span>
                    <ImageIcon className="h-3 w-3 inline mr-1" /> Image URL
                  </span>
                }
              >
                <Input
                  {...register('dev_image')}
                  placeholder="https://example.com/device-image.jpg"
                />
              </Field>
              {imageUrl && (
                <div className="mt-2">
                  <p className="text-caption text-fg-muted mb-1">Preview:</p>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-(--radius-control) border border-border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-border mt-6">
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              {isEditing ? 'Update Device' : 'Create Device'}
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
