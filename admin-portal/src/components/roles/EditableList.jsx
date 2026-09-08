import { useState } from "react";
import { Check, Loader2, Lock, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "../ui/button";

export default function EditableList({
  title,
  description,
  items, // [{ id, name, subtitle?, locked? }]
  onCreate,
  onRename,
  onDelete,
  createPlaceholder = "New name",
}) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [busyId, setBusyId] = useState(null); // id currently saving/deleting

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await onCreate(name);
      setNewName("");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (id) => {
    const name = editingName.trim();
    if (!name) return;
    setBusyId(id);
    try {
      await onRename(id, name);
      cancelEdit();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await onDelete(id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-body font-semibold text-fg">{title}</h3>
        {description && <p className="text-caption text-fg-muted mt-1">{description}</p>}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder={createPlaceholder}
          className="flex-1 rounded-(--radius-control) border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted"
        />
        <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim()}>
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-body text-fg-muted">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            const isBusy = busyId === item.id;

            return (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                {isEditing ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)}
                    autoFocus
                    className="flex-1 rounded-(--radius-control) border border-border bg-bg px-2 py-1 text-sm text-fg"
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-fg truncate">{item.name}</p>
                    {item.subtitle && (
                      <p className="text-caption text-fg-muted">{item.subtitle}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin text-fg-muted" />
                  ) : isEditing ? (
                    <>
                      <Button variant="ghost" size="icon-sm" onClick={() => saveEdit(item.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon-sm" onClick={() => startEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {item.locked ? (
                        <span title="This item is referenced elsewhere and can't be deleted">
                          <Button variant="ghost" size="icon-sm" disabled>
                            <Lock className="h-4 w-4 text-fg-muted" />
                          </Button>
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}