import { BookOpen, Globe2 } from "lucide-react";
import AdminSidebarNav from "./AdminSidebarNav";
import AdminSidebarProfile from "./AdminSidebarProfile";

export default function AdminSidebar({ items, onItemClick, onGlossaryClick }) {
  return (
    <div
      className="flex h-full flex-col border border-border rounded-2xl p-4"
      style={{
        background: "var(--menu-glow), var(--menu-background)",
        WebkitBackdropFilter: "blur(18px) saturate(150%)",
        backdropFilter: "blur(18px) saturate(150%)",
      }}
    >
      {/* Nav items */}
      <AdminSidebarNav items={items} onItemClick={onItemClick} />

      {/* Bottom section */}
      <div className="mt-auto px-1 pt-3">
        {/* Glossary — bottom link style (same as VitalFlo external link) */}
        <button
          type="button"
          onClick={() => {
            onGlossaryClick?.();
            onItemClick?.();
          }}
          className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-fg-muted transition-colors duration-200 hover:bg-surface-raised hover:text-fg"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-raised">
            <BookOpen className="h-3.5 w-3.5" />
          </span>

          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-xs font-medium">Glossary</span>
            <span className="block truncate text-[10px] text-fg-muted">
              Medical terms
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
