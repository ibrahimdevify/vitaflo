import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Search,
  FileText,
  Plus,
  X,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

export default function Notes() {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [patientInfo, setPatientInfo] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [notePage, setNotePage] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState({});

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotes, setTotalNotes] = useState(0);
  const limit = 10;

  // Date range
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const loadNotes = async (userId, pageNum = 1) => {
    if (!userId) {
      toast.error("Please enter a Patient ID, Username, or Email");
      return;
    }
    try {
      setLoading(true);
      setPatientId(userId);
      setPage(pageNum);

      const res = await api.get("/notes", {
        params: {
          user_id: userId,
          page: pageNum,
          limit,
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
      });

      const data = res.data.data || [];
      const pagination = res.data.pagination || {};

      setNotes(data);
      setTotalPages(pagination.pages || 1);
      setTotalNotes(pagination.total || data.length);

      if (data.length === 0) {
        toast.info("No notes found for this patient");
      }
    } catch (err) {
      toast.error("Failed to load notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error("Note text is required");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/notes", {
        user_id: patientId,
        text: noteText.trim(),
        page: notePage,
      });
      toast.success("Note created successfully!");
      setShowForm(false);
      setNoteText("");
      setNotePage("general");
      loadNotes(patientId, 1);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create note");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") loadNotes(search, 1);
  };

  const pageTypes = [
    "general",
    "clinical",
    "medication",
    "diet",
    "exercise",
    "other",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notes</h1>

      {/* Search & Filter Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by Patient ID, Username, or Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => loadNotes(search, 1)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "Load Notes"}
              </Button>
              {patientId && (
                <Button
                  variant="outline"
                  onClick={() => setShowForm(!showForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showForm ? "Cancel" : "Add Note"}
                </Button>
              )}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-500">Date Range:</span>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="w-40 h-9 text-sm"
              />
              <span className="text-slate-400 text-sm">to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="w-40 h-9 text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadNotes(patientId || search, 1)}
                className="text-green-600"
              >
                Apply Filter
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Supports: Patient ID, Username, or Email
          </p>
        </CardContent>
      </Card>

      {/* Patient Info */}
      {patientId && notes.length >= 0 && (
        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
          <User className="h-4 w-4 text-green-500" />
          <span>
            Patient: <strong>{patientId}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <FileText className="h-4 w-4 text-blue-500" />
          <span>
            {totalNotes} note{totalNotes !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Add Note Form */}
      {showForm && (
        <Card className="border-green-200 border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Add Note for Patient {patientId}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Note Type
                </label>
                <select
                  value={notePage}
                  onChange={(e) => setNotePage(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {pageTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Note Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px] resize-y"
                  placeholder="Write your clinical note here..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>{" "}
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" /> Save Note
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Notes{" "}
            {notes.length > 0 && (
              <Badge className="bg-blue-100 text-blue-800">{totalNotes}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">Loading notes...</p>
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note, i) => (
                <div
                  key={note.id || i}
                  className="bg-white border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleExpand(i)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={
                            note.page === "clinical"
                              ? "bg-red-100 text-red-700"
                              : note.page === "medication"
                                ? "bg-purple-100 text-purple-700"
                                : note.page === "diet"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : note.page === "exercise"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-700"
                          }
                        >
                          {note.page || "general"}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(
                            note.dbdate || note.recorded_date,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {note.text?.substring(0, 150)}
                        {note.text?.length > 150 ? "..." : ""}
                      </p>
                    </div>
                    {expanded[i] ? (
                      <ChevronUp className="h-5 w-5 text-slate-400 ml-2" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 ml-2" />
                    )}
                  </div>

                  {expanded[i] && (
                    <div className="px-4 pb-4 border-t pt-3">
                      <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                      <div className="flex justify-between mt-3 text-xs text-slate-400">
                        <span>
                          Created:{" "}
                          {new Date(
                            note.dbdate || note.recorded_date,
                          ).toLocaleString()}
                        </span>
                        {note.user_id && <span>User ID: {note.user_id}</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-slate-500">
                    Page {page} of {totalPages} ({totalNotes} notes)
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadNotes(patientId, page - 1)}
                      disabled={page <= 1 || loading}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => loadNotes(patientId, pageNum)}
                          disabled={loading}
                          className={pageNum === page ? "bg-green-600" : ""}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadNotes(patientId, page + 1)}
                      disabled={page >= totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : patientId ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-lg">No notes found</p>
              <p className="text-sm">
                Try a different date range or create a new note
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-lg">Enter a Patient ID to view notes</p>
              <p className="text-sm">
                Supports: Patient ID, Username, or Email
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
