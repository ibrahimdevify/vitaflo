import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../../components/ui/sheet';

export default function MobileSidebar({ open, onOpenChange, children }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <div className="lg:hidden absolute top-2 left-6 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface cursor-pointer hover:bg-surface-raised transition-colors">
          <Menu className="h-4 w-4" />
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-brand-900">
        {children}
      </SheetContent>
    </Sheet>
  );
}
