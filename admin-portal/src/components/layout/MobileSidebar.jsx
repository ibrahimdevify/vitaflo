import { Sheet, SheetContent } from "../../components/ui/sheet";

export default function MobileSidebar({ open, onOpenChange, children }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0 bg-brand-900">
        {children}
      </SheetContent>
    </Sheet>
  );
}
