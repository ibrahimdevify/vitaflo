import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronDown, FileText, Loader2, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { cn } from '../../lib/utils';

const noteSchema = z.object({
  text: z
    .string()
    .min(1, 'Note text is required')
    .max(5000, 'Max 5000 characters'),
  page: z.enum([
    'general',
    'clinical',
    'medication',
    'diet',
    'exercise',
    'other',
  ]),
});

const pageTypes = [
  { value: 'general', label: 'General' },
  { value: 'clinical', label: 'Clinical' },
  { value: 'medication', label: 'Medication' },
  { value: 'diet', label: 'Diet' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'other', label: 'Other' },
];

export default function NotesAddForm({
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
    resolver: zodResolver(noteSchema),
    defaultValues: { text: '', page: 'general' },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
            <FileText className="h-3.5 w-3.5 text-white" />
          </div>
          Add Note for Patient {patientId}
        </CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Note Type — DropdownMenu */}
          <div>
            <label className="text-caption font-medium text-fg-muted mb-1.5 block">
              Note Type
            </label>
            <Controller
              name="page"
              control={control}
              render={({ field }) => {
                const selected = pageTypes.find((t) => t.value === field.value);
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="outline"
                        className="w-full justify-between border-border h-9 font-normal"
                      >
                        <span
                          className={!field.value ? 'text-fg-muted' : 'text-fg'}
                        >
                          {selected?.label || 'Select type'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-fg-muted ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-(--anchor-width)"
                    >
                      {pageTypes.map((type) => (
                        <DropdownMenuItem
                          key={type.value}
                          onClick={() => field.onChange(type.value)}
                          className={cn(
                            'cursor-pointer',
                            field.value === type.value &&
                              'bg-surface-raised font-medium'
                          )}
                        >
                          {type.label}
                          {field.value === type.value && (
                            <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }}
            />
          </div>

          {/* Note Text */}
          <div>
            <label className="text-caption font-medium text-fg-muted mb-1.5 block">
              Note Text <span className="text-danger">*</span>
            </label>
            <textarea
              {...register('text')}
              className="w-full rounded-(--radius-control) border border-border bg-surface text-fg px-3 py-2 text-body min-h-30 resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/30 focus-visible:border-focus-ring placeholder:text-fg-muted"
              placeholder="Write your clinical note here..."
            />
            {errors.text && (
              <p className="text-caption text-danger mt-1">
                {errors.text.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={submitting}>
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              )}
              <FileText className="h-4 w-4 mr-1.5" />
              {submitting ? 'Saving...' : 'Save Note'}
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
