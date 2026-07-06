import { zodResolver } from '@hookform/resolvers/zod';
import { Brain, Check, ChevronDown, Loader2, X } from 'lucide-react';
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

const VARIABLES = ['FEV1', 'FVC', 'PEFR', 'FEF2575', 'FEV6', 'FEV1/FVC'];

const schema = z.object({
  variable: z.string().min(1),
  predicted: z.string().min(1, 'Predicted value is required'),
  lln: z.string().optional(),
  uln: z.string().optional(),
  zScore: z.string().optional(),
  percentPredicted: z.string().optional(),
});

export default function AddPredictionForm({
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
    resolver: zodResolver(schema),
    defaultValues: {
      variable: 'FEV1',
      predicted: '',
      lln: '',
      uln: '',
      zScore: '',
      percentPredicted: '',
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
            <Brain className="h-3.5 w-3.5 text-white" />
          </div>
          Add Predicted Values for Patient #{patientId}
        </CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Variable *">
              <Controller
                name="variable"
                control={control}
                render={({ field }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                        <span className="text-fg">{field.value}</span>
                        <ChevronDown className="h-4 w-4 text-fg-muted" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-(--anchor-width)"
                    >
                      {VARIABLES.map((v) => (
                        <DropdownMenuItem
                          key={v}
                          onClick={() => field.onChange(v)}
                          className={cn(
                            'cursor-pointer',
                            field.value === v && 'bg-surface-raised font-medium'
                          )}
                        >
                          {v}
                          {field.value === v && (
                            <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />
            </Field>
            <Field label="Predicted *" error={errors.predicted?.message}>
              <Input
                {...register('predicted')}
                type="number"
                step="0.01"
                placeholder="3.50"
              />
            </Field>
            <Field label="LLN (Lower Limit)">
              <Input
                {...register('lln')}
                type="number"
                step="0.01"
                placeholder="2.80"
              />
            </Field>
            <Field label="ULN (Upper Limit)">
              <Input
                {...register('uln')}
                type="number"
                step="0.01"
                placeholder="4.20"
              />
            </Field>
            <Field label="Z-Score">
              <Input
                {...register('zScore')}
                type="number"
                step="0.01"
                placeholder="-0.50"
              />
            </Field>
            <Field label="% Predicted">
              <Input
                {...register('percentPredicted')}
                type="number"
                step="0.1"
                placeholder="92"
              />
            </Field>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Brain className="h-4 w-4" />
              {submitting ? 'Saving...' : 'Save Prediction'}
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
