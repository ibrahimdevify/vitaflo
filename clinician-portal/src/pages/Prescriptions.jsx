import { useEffect, useState } from "react";
import { patientsAPI } from "../services/api";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Search,
  ClipboardList,
  Plus,
  X,
  User,
  Calendar,
  Pill,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

export default function Prescriptions() {
  const [search, setSearch] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [patientInfo, setPatientInfo] = useState(null);
  const [expanded, setExpanded] = useState({});

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  // Date range
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [form, setForm] = useState({
    diagnosis: "",
    pharmacy_instruction: "",
    medicines: [
      {
        drug: "",
        dosage: "",
        frequency: "",
        quantity: "",
        days: "",
        direction: "",
      },
    ],
  });
  const [submitting, setSubmitting] = useState(false);

  const searchPrescriptions = async (pageNum = 1) => {
    const query = search.trim();
    if (!query) {
      toast.error("Please enter a Patient ID, Username, or Email");
      return;
    }
    try {
      setLoading(true);
      setPatientId(query);
      setPage(pageNum);

      const res = await patientsAPI.getPrescriptions(query, {
        page: pageNum,
        limit,
        start_date: dateRange.start,
        end_date: dateRange.end,
      });

      const data = res.data.data || [];
      const pagination = res.data.pagination || {};

      setPrescriptions(data);
      setTotalPages(pagination.pages || 1);
      setTotalRecords(pagination.total || data.length);

      if (data.length > 0) {
        setPatientInfo({
          name: query,
          totalPrescriptions: pagination.total || data.length,
        });
      }

      if (data.length === 0) {
        toast.info("No prescriptions found for this date range");
      }
    } catch (err) {
      toast.error("Failed to load prescriptions");
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = () =>
    setForm({
      ...form,
      medicines: [
        ...form.medicines,
        {
          drug: "",
          dosage: "",
          frequency: "",
          quantity: "",
          days: "",
          direction: "",
        },
      ],
    });

  const removeMedicine = (idx) => {
    if (form.medicines.length <= 1) {
      toast.error("At least one medicine is required");
      return;
    }
    setForm({ ...form, medicines: form.medicines.filter((_, i) => i !== idx) });
  };

  const updateMedicine = (idx, field, value) => {
    const meds = [...form.medicines];
    meds[idx] = { ...meds[idx], [field]: value };
    setForm({ ...form, medicines: meds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.diagnosis.trim()) {
      toast.error("Diagnosis is required");
      return;
    }
    const validMedicines = form.medicines.filter((m) => m.drug.trim());
    if (validMedicines.length === 0) {
      toast.error("At least one medicine with a drug name is required");
      return;
    }

    try {
      setSubmitting(true);
      await patientsAPI.createPrescription(patientId, {
        diagnosis: form.diagnosis.trim(),
        pharmacy_instruction: form.pharmacy_instruction.trim(),
        doctor_id_fk: 1,
        medicines: validMedicines.map((m) => ({
          drug: m.drug.trim(),
          dosage: m.dosage.trim() || "N/A",
          frequency: m.frequency.trim() || "N/A",
          quantity: m.quantity.trim() || "1",
          days: m.days.trim() || "1",
          direction: m.direction.trim() || "N/A",
        })),
      });
      toast.success("Prescription created successfully!");
      setShowForm(false);
      setForm({
        diagnosis: "",
        pharmacy_instruction: "",
        medicines: [
          {
            drug: "",
            dosage: "",
            frequency: "",
            quantity: "",
            days: "",
            direction: "",
          },
        ],
      });
      searchPrescriptions(1);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create prescription");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchPrescriptions(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Prescriptions</h1>

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
                onClick={() => searchPrescriptions(1)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "Load"}
              </Button>
              {patientId && (
                <Button
                  variant="outline"
                  onClick={() => setShowForm(!showForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showForm ? "Cancel" : "New Prescription"}
                </Button>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-slate-400" />
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
                onClick={() => searchPrescriptions(1)}
                className="text-green-600"
              >
                Apply Filter
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Supports: Patient ID, Username, or Email address
          </p>
        </CardContent>
      </Card>

      {/* Patient Info + Record Count */}
      {patientInfo && (
        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
          <User className="h-4 w-4 text-green-500" />
          <span>
            Patient: <strong>{patientId}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>
            {dateRange.start} → {dateRange.end}
          </span>
          <span className="text-slate-300">|</span>
          <ClipboardList className="h-4 w-4 text-purple-500" />
          <span>
            {totalRecords} prescription{totalRecords !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* New Prescription Form */}
      {showForm && (
        <Card className="border-green-200 border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-green-500" />
                New Prescription for Patient {patientId}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Diagnosis <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.diagnosis}
                    onChange={(e) =>
                      setForm({ ...form, diagnosis: e.target.value })
                    }
                    required
                    placeholder="e.g., Asthma, COPD, Bronchitis"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Pharmacy Instructions
                  </label>
                  <Input
                    value={form.pharmacy_instruction}
                    onChange={(e) =>
                      setForm({ ...form, pharmacy_instruction: e.target.value })
                    }
                    placeholder="e.g., Take as needed, Before meals"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    Medicines <span className="text-red-500">*</span>
                  </label>
                  <Badge variant="outline">
                    {form.medicines.length} medicine
                    {form.medicines.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {form.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-lg p-3 mb-3 border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500">
                        Medicine #{idx + 1}
                      </span>
                      {form.medicines.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedicine(idx)}
                          className="text-red-500 h-6 px-2"
                        >
                          <X className="h-3 w-3 mr-1" /> Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">
                          Drug Name *
                        </label>
                        <Input
                          placeholder="e.g., Albuterol"
                          value={med.drug}
                          onChange={(e) =>
                            updateMedicine(idx, "drug", e.target.value)
                          }
                          required
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">
                          Dosage
                        </label>
                        <Input
                          placeholder="e.g., 2 puffs"
                          value={med.dosage}
                          onChange={(e) =>
                            updateMedicine(idx, "dosage", e.target.value)
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">
                          Frequency
                        </label>
                        <Input
                          placeholder="e.g., Every 4 hours"
                          value={med.frequency}
                          onChange={(e) =>
                            updateMedicine(idx, "frequency", e.target.value)
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">
                          Quantity
                        </label>
                        <Input
                          placeholder="e.g., 1"
                          value={med.quantity}
                          onChange={(e) =>
                            updateMedicine(idx, "quantity", e.target.value)
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">
                          Days
                        </label>
                        <Input
                          placeholder="e.g., 30"
                          value={med.days}
                          onChange={(e) =>
                            updateMedicine(idx, "days", e.target.value)
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">
                          Direction
                        </label>
                        <Input
                          placeholder="e.g., Inhale orally"
                          value={med.direction}
                          onChange={(e) =>
                            updateMedicine(idx, "direction", e.target.value)
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMedicine}
                  className="mt-2"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Medicine
                </Button>
              </div>

              <div className="flex gap-2 pt-2">
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
                      <ClipboardList className="h-4 w-4 mr-2" /> Create
                      Prescription
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

      {/* Prescriptions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            Prescriptions{" "}
            {prescriptions.length > 0 && (
              <Badge className="bg-blue-100 text-blue-800">
                {totalRecords}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">
                Loading prescriptions...
              </p>
            </div>
          ) : prescriptions.length > 0 ? (
            <>
              <div className="space-y-3 mb-4">
                {prescriptions.map((p, i) => (
                  <div
                    key={p.pr_id || i}
                    className="bg-white border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div
                      className="p-4 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleExpand(i)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">
                            {p.diagnosis}
                          </span>
                          <Badge className="text-xs">
                            {new Date(p.pr_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "2-digit",
                            })}
                          </Badge>
                        </div>
                        {p.pharmacy_instruction && (
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{" "}
                            {p.pharmacy_instruction}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.medicines?.map((m, j) => (
                            <Badge
                              key={j}
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              <Pill className="h-3 w-3 mr-1" />
                              {m.drug} {m.dosage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {p.doctor && (
                          <span className="text-xs text-slate-400 hidden sm:block">
                            Dr. {p.doctor.f_name} {p.doctor.l_name}
                          </span>
                        )}
                        {expanded[i] ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {expanded[i] && (
                      <div className="px-4 pb-4 border-t pt-3">
                        <h4 className="text-sm font-medium mb-2">
                          Medicine Details
                        </h4>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">Drug</TableHead>
                                <TableHead className="text-xs">
                                  Dosage
                                </TableHead>
                                <TableHead className="text-xs">
                                  Frequency
                                </TableHead>
                                <TableHead className="text-xs">Qty</TableHead>
                                <TableHead className="text-xs">Days</TableHead>
                                <TableHead className="text-xs">
                                  Direction
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {p.medicines?.map((m, j) => (
                                <TableRow key={j}>
                                  <TableCell className="text-sm font-medium">
                                    {m.drug}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {m.dosage}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {m.frequency}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {m.quantity || "1"}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {m.days || "1"}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {m.direction}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="flex justify-between mt-3 text-xs text-slate-400">
                          <span>
                            Prescribed by: Dr. {p.doctor?.f_name}{" "}
                            {p.doctor?.l_name}
                          </span>
                          <span>
                            Date: {new Date(p.pr_date).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-slate-500">
                    Page {page} of {totalPages} ({totalRecords} records)
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => searchPrescriptions(page - 1)}
                      disabled={page <= 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => searchPrescriptions(pageNum)}
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
                      onClick={() => searchPrescriptions(page + 1)}
                      disabled={page >= totalPages || loading}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : patientId ? (
            <div className="text-center py-12 text-slate-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-lg">No prescriptions found</p>
              <p className="text-sm">
                Try a different date range or create a new one
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-lg">
                Enter a Patient ID to view prescriptions
              </p>
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
