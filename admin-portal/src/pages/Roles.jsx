import { useState } from "react";
import ModulesPanel from "../components/roles/ModulesPanel";
import PermissionsMatrix from "../components/roles/PermissionsMatrix";
import RolesPanel from "../components/roles/RolesPanel";
import { Card, CardContent, CardHeader } from "../components/ui/card";

const TABS = [
  { key: "permissions", label: "Permissions" },
  { key: "roles", label: "Roles" },
  { key: "modules", label: "Modules" },
];

export default function Roles() {
  const [activeTab, setActiveTab] = useState("permissions");
  // Bumping this remounts PermissionsMatrix, forcing a fresh fetch whenever a
  // role or module is added/renamed/deleted elsewhere so the matrix never
  // shows a stale row/column.
  const [matrixVersion, setMatrixVersion] = useState(0);
  const refreshMatrix = () => setMatrixVersion((v) => v + 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading font-bold text-fg tracking-tight">Role Management</h1>
        <p className="text-caption text-fg-muted mt-1">
          Manage roles, modules, and who can view or edit what
        </p>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-0">
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-fg-muted hover:text-fg"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {activeTab === "permissions" && <PermissionsMatrix key={matrixVersion} />}
          {activeTab === "roles" && <RolesPanel onRolesChanged={refreshMatrix} />}
          {activeTab === "modules" && <ModulesPanel onModulesChanged={refreshMatrix} />}
        </CardContent>
      </Card>
    </div>
  );
}