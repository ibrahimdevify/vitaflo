import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Card, CardContent, CardHeader } from './card';
export default function Modal({
  open,
  onClose,
  children,
  title,
  className,
  overlayClassName,
  role = 'dialog',
  ariaModal = true,
  ariaLabel,
}) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }

    if (!mounted) return;

    setClosing(true);

    const timer = setTimeout(() => {
      setMounted(false);
    }, 180);

    return () => clearTimeout(timer);
  }, [open]);

  if (!mounted) return null;
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-150 ease-out',
        closing ? 'opacity-0' : 'opacity-100',
        overlayClassName
      )}
      role={role}
      aria-modal={ariaModal}
      aria-label={ariaLabel || title}
      onClick={onClose}
    >
      <div
        className={cn(
          closing ? 'animate-sheet-out' : 'animate-sheet-in',
          'w-full max-h-[85vh]',
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <Card className="flex max-h-[85vh] flex-col overflow-hidden">
          {/* Modal Header */}
          {title && (
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <h2 className="text-subheading font-bold text-fg">{title}</h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label={`Close ${title}`}
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
          )}
          {/* Modal Content */}
          <CardContent className="overflow-y-auto pt-4">{children}</CardContent>
        </Card>
      </div>
    </div>,
    document.body
  );
}
