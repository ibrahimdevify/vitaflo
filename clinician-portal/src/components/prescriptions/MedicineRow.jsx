import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function MedicineRow({
  index,
  register,
  errors,
  onRemove,
  showRemove,
}) {
  return (
    <div className="bg-surface-raised rounded-card p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-caption font-medium text-fg-muted">
          Medicine #{index + 1}
        </span>
        {showRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-danger h-6 px-2"
          >
            <X className="h-3 w-3 mr-1" /> Remove
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        <div>
          <label className="text-caption text-fg-muted mb-1 block">
            Drug Name *
          </label>
          <Input
            {...register(`medicines.${index}.drug`)}
            placeholder="e.g., Albuterol"
          />
        </div>
        <div>
          <label className="text-caption text-fg-muted mb-1 block">
            Dosage
          </label>
          <Input
            {...register(`medicines.${index}.dosage`)}
            placeholder="e.g., 2 puffs"
          />
        </div>
        <div>
          <label className="text-caption text-fg-muted mb-1 block">
            Frequency
          </label>
          <Input
            {...register(`medicines.${index}.frequency`)}
            placeholder="e.g., Every 4 hours"
          />
        </div>
        <div>
          <label className="text-caption text-fg-muted mb-1 block">
            Quantity
          </label>
          <Input
            {...register(`medicines.${index}.quantity`)}
            placeholder="e.g., 1"
          />
        </div>
        <div>
          <label className="text-caption text-fg-muted mb-1 block">Days</label>
          <Input
            {...register(`medicines.${index}.days`)}
            placeholder="e.g., 30"
          />
        </div>
        <div>
          <label className="text-caption text-fg-muted mb-1 block">
            Direction
          </label>
          <Input
            {...register(`medicines.${index}.direction`)}
            placeholder="e.g., Inhale orally"
          />
        </div>
      </div>
    </div>
  );
}
