import { useEffect, useState } from "react";
import { toast } from "sonner";
import { rolesAPI } from "../../services/api";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import EditableList from "./EditableList";

// Referenced by numeric id elsewhere in the app (see roleService.js
// PROTECTED_ROLE_IDS) — the backend already blocks deleting these, this just
// greys the delete button out up front instead of showing an error after the click.
const PROTECTED_ROLE_IDS = new Set([1, 2, 3, 4]);

export default function RolesPanel({ onRolesChanged }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    rolesAPI
      .listRoles()
      .then((res) => setRoles(res.data?.data ?? []))
      .catch((err) => {
        console.error("[RolesPanel] load error:", err);
        toast.error("Failed to load roles");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (name) => {
    try {
      await rolesAPI.createRole(name);
      toast.success("Role created");
      load();
      onRolesChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to create role");
    }
  };

  const handleRename = async (id, name) => {
    try {
      await rolesAPI.updateRole(id, name);
      toast.success("Role renamed");
      load();
      onRolesChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to rename role");
    }
  };

  const handleDelete = async (id) => {
    try {
      await rolesAPI.deleteRole(id);
      toast.success("Role deleted");
      load();
      onRolesChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete role");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded-(--radius-control)" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <EditableList
          title="Roles"
          description="User types — each maps to a permission set in the Permissions tab."
          createPlaceholder="New role name"
          items={roles.map((r) => ({
            id: r.id,
            name: r.name,
            subtitle: `${r.userCount} user${r.userCount === 1 ? "" : "s"}`,
            locked: PROTECTED_ROLE_IDS.has(r.id),
          }))}
          onCreate={handleCreate}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
}