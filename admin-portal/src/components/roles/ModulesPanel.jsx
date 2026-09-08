import { useEffect, useState } from "react";
import { toast } from "sonner";
import { rolesAPI } from "../../services/api";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import EditableList from "./EditableList";

export default function ModulesPanel({ onModulesChanged }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    rolesAPI
      .listModules()
      .then((res) => setModules(res.data?.data ?? []))
      .catch((err) => {
        console.error("[ModulesPanel] load error:", err);
        toast.error("Failed to load modules");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (name) => {
    try {
      await rolesAPI.createModule(name);
      toast.success("Module created");
      load();
      onModulesChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to create module");
    }
  };

  const handleRename = async (id, name) => {
    try {
      await rolesAPI.updateModule(id, name);
      toast.success("Module renamed");
      load();
      onModulesChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to rename module");
    }
  };

  const handleDelete = async (id) => {
    try {
      await rolesAPI.deleteModule(id);
      toast.success("Module deleted");
      load();
      onModulesChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete module");
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
          title="Modules"
          description="Permissionable areas of the app — appear as columns in the Permissions matrix."
          createPlaceholder="New module name"
          items={modules.map((m) => ({ id: m.id, name: m.name }))}
          onCreate={handleCreate}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
}