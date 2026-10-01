import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

function NavGroup({ item, isChildActive, onItemClick }) {
  const [open, setOpen] = useState(isChildActive);
  const { icon: Icon, label, children } = item;

  return (
    <div className={`smooth-open-trigger ${open ? "is-open" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
          isChildActive ? "" : "text-(--menu-color) hover:text-brand-500"
        }`}
      >
        <Icon
          className={`h-4 w-4 shrink-0 transition-colors ${
            isChildActive
              ? ""
              : "text-(--menu-color) group-hover:text-brand-500"
          }`}
        />
        <span className="flex-1 text-left uppercase font-semibold">
          {label}
        </span>
        {open ? (
          <>
            <span className="flex flex-col items-center gap-0">
              <ChevronUp className="h-4 w-4 text-brand-500" />
              <span className="h-px w-3 rounded-full bg-brand-500 blink" />
            </span>
          </>
        ) : (
          <ChevronDown className="h-4 w-4 text-(--menu-color) group-hover:text-brand-500" />
        )}
      </button>

      <div className="smooth-open">
        <div>
          <div className="mt-0.5 space-y-0.5 pl-4">
            {children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-lg px-3 py-1.25 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand-400/15 text-brand-500"
                      : "text-(--sub-menu-color) hover:bg-surface-raised hover:text-brand-500"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <child.icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-brand-500"
                          : "text-(--sub-menu-color) group-hover:text-brand-500"
                      }`}
                    />
                    {child.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebarNav({ items, onItemClick }) {
  const location = useLocation();

  return (
    <nav className="flex-1 space-y-0.5 overflow-auto pt-4">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-500">
        Main Menu
      </p>

      {items.map((item) => {
        if (item.children) {
          const isChildActive = item.children.some(
            (child) => location.pathname === child.path,
          );
          return (
            <NavGroup
              key={item.label}
              item={item}
              isChildActive={isChildActive}
              onItemClick={onItemClick}
            />
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "text-brand-500"
                  : "text-(--menu-color) hover:text-brand-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-brand-500"
                      : "text-(--menu-color) group-hover:text-brand-500"
                  }`}
                />
                <span className="uppercase font-semibold">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
