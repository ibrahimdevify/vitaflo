import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Search, UserCog, Check, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Pagination from "../ui/pagination";
import EmptyState from "../shared/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { cliniciansAPI, clinicianAdminsAPI } from "../../services/api";

const avatarTones = ["brand", "info", "success", "warning", "danger"];
const toneGradients = {
  brand: "from-brand-500 to-brand-700",
  info: "from-info to-info/70",
  success: "from-success to-success/70",
  warning: "from-warning to-warning/70",
  danger: "from-danger to-danger/70",
};

function AdminRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 px-1 animate-pulse">
      <div className="h-10 w-10 rounded-pill bg-surface-raised shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 rounded bg-surface-raised" />
        <div className="h-3 w-44 rounded bg-surface-raised" />
      </div>
      <div className="h-8 w-20 rounded-(--radius-control) bg-surface-raised" />
    </div>
  );
}

export default function AssignAdminModal({ open, clinician, onClose, onAssigned }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadAdmins = useCallback(async () => {
    if (!open) return;
    try {
      setLoading(true);
      const params = { page, limit: 8 };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await clinicianAdminsAPI.getAll(params);
      setAdmins(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      toast.error("Failed to load clinician admins");
    } finally {
      setLoading(false);
    }
  }, [open, page, debouncedSearch]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleAssign = async (adminId) => {
    try {
      setAssigningId(adminId);
      await cliniciansAPI.assignAdmin(clinician.user_id, adminId);
      toast.success("Clinician assigned to admin");
      onAssigned?.();
      onClose();
    } catch (err) {
      toast.error("Failed to assign admin");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
              <UserCog className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-subheading font-semibold text-fg">
                Assign Clinician Admin
              </DialogTitle>
              <p className="text-caption text-fg-muted truncate">
                for {clinician?.f_name} {clinician?.l_name}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted pointer-events-none" />
            <Input
              placeholder="Search by name, username, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <div className="px-3 min-h-[19rem] max-h-96 overflow-y-auto">
          {loading ? (
            <div className="px-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <AdminRowSkeleton key={i} />
              ))}
            </div>
          ) : !admins.length ? (
            <div className="py-10">
              <EmptyState
                icon={UserCog}
                title="No clinician admins found"
                description={
                  debouncedSearch
                    ? "Try a different search term"
                    : "No clinician admins in the system yet"
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {admins.map((a, i) => {
                const tone = avatarTones[i % avatarTones.length];
                const gradient = toneGradients[tone];
                const isAssigning = assigningId === a.user_id;

                return (
                  <div
                    key={a.user_id}
                    className="group flex items-center gap-3 py-3 px-2 rounded-(--radius-control) hover:bg-surface-raised transition-colors"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-body font-semibold text-white bg-linear-to-br ${gradient}`}
                    >
                      {a.f_name?.[0]}
                      {a.l_name?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-fg text-body truncate">
                        {a.f_name} {a.l_name}
                      </p>
                      <p className="text-caption text-fg-muted truncate">
                        @{a.userName || "no-username"} · {a.email}
                      </p>
                    </div>
                    {a._count?.managed_clinicians > 0 && (
                      <Badge variant="outline" className="shrink-0 whitespace-nowrap hidden sm:inline-flex">
                        {a._count.managed_clinicians} clinician
                        {a._count.managed_clinicians === 1 ? "" : "s"}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={isAssigning ? "outline" : "default"}
                      disabled={assigningId !== null}
                      onClick={() => handleAssign(a.user_id)}
                      className="shrink-0 gap-1.5 min-w-[88px]"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Assigning
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Assign
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border bg-surface-raised/40">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="admins"
            loading={loading}
            onPageChange={setPage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}