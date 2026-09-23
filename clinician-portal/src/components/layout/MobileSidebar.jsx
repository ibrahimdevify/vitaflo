import { Sheet, SheetContent } from '../../components/ui/sheet';

export default function MobileSidebar({ open, onOpenChange, children }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="min-w-full p-3">
        {children}
      </SheetContent>
    </Sheet>
  );
}
