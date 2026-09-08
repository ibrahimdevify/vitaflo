import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { rolesAPI } from "../../services/api";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function PermissionsMatrix() {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null); // `${roleId}:${moduleId}` currently saving

  const load = () => {
    setLoading(true);
    rolesAPI
      .getPermissionsMatrix()
      .then((res) => setMatrix(res.data?.data ?? null))
      .catch((err) => {
        console.error("[PermissionsMatrix] load error:", err);
        toast.error("Failed to load permissions");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleCell = async (roleId, moduleId, field, currentValue) => {
    const key = `${roleId}:${moduleId}`;
    const roleRow = matrix.matrix.find((r) => r.roleId === roleId);
    const cell = roleRow.permissions.find((p) => p.moduleId === moduleId);
    const next = {
      isView: field === "isView" ? !currentValue : cell.isView,
      isWriteable: field === "isWriteable" ? !currentValue : cell.isWriteable,
    };

    // Optimistic update
    setMatrix((prev) => ({
      ...prev,
      matrix: prev.matrix.map((r) =>
        r.roleId !== roleId
          ? r
          : {
              ...r,
              permissions: r.permissions.map((p) =>
                p.moduleId !== moduleId ? p : { ...p, ...next }
              ),
            }
      ),
    }));

    setSavingKey(key);
    try {
      await rolesAPI.setPermissionCell(roleId, moduleId, next);
    } catch (err) {
      console.error("[PermissionsMatrix] save error:", err);
      toast.error("Failed to save — reverting");
      load(); // reload from server to undo the optimistic change
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-(--radius-control)" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!matrix || matrix.roles.length === 0 || matrix.modules.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-body text-fg-muted">
            {matrix?.roles.length === 0
              ? "No roles yet — add one in the Roles tab first."
              : "No modules yet — add one in the Modules tab first."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <h3 className="text-body font-semibold text-fg">Permissions Matrix</h3>
        <p className="text-caption text-fg-muted mt-1">
          Toggle view/write access per role and module.
        </p>
      </CardHeader>
      <CardContent className="pt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold text-fg-muted sticky left-0 bg-bg">
                Role
              </th>
              {matrix.modules.map((m) => (
                <th
                  key={m.id}
                  className="text-center py-2 px-3 font-semibold text-fg-muted whitespace-nowrap"
                >
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.matrix.map((roleRow) => (
              <tr key={roleRow.roleId} className="border-b border-border last:border-0">
                <td className="py-3 pr-4 font-medium text-fg sticky left-0 bg-bg whitespace-nowrap">
                  {roleRow.roleName}
                </td>
                {roleRow.permissions.map((cell) => {
                  const key = `${roleRow.roleId}:${cell.moduleId}`;
                  const isSaving = savingKey === key;
                  return (
                    <td key={cell.moduleId} className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-3">
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin text-fg-muted" />
                        ) : (
                          <>
                            <label className="flex items-center gap-1 text-caption text-fg-muted">
                              <input
                                type="checkbox"
                                checked={cell.isView}
                                onChange={() =>
                                  toggleCell(roleRow.roleId, cell.moduleId, "isView", cell.isView)
                                }
                              />
                              View
                            </label>
                            <label className="flex items-center gap-1 text-caption text-fg-muted">
                              <input
                                type="checkbox"
                                checked={cell.isWriteable}
                                onChange={() =>
                                  toggleCell(
                                    roleRow.roleId,
                                    cell.moduleId,
                                    "isWriteable",
                                    cell.isWriteable
                                  )
                                }
                              />
                              Write
                            </label>
                          </>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}