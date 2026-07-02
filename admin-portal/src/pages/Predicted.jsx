import { useEffect, useState } from "react";
import { predictedAPI } from "../services/api";
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
  Brain,
  Search,
  Plus,
  X,
  Loader2,
  TrendingUp,
  Target,
  Activity,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

const VARIABLES = ["FEV1", "FVC", "PEFR", "FEF2575", "FEV6", "FEV1/FVC"];

export default function Predicted() {
  const [userId, setUserId] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    variable: "FEV1",
    predicted: "",
    lln: "",
    uln: "",
    zScore: "",
    percentPredicted: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadPredictions = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a Patient ID, Username, or Email");
      return;
    }
    try {
      setLoading(true);
      const res = await predictedAPI.getByUser(userId.trim());
      const data = res.data || res.data?.data || [];
      setPredictions(Array.isArray(data) ? data : []);
      if (data.length === 0) toast.info("No predicted values found");
    } catch (err) {
      toast.error("Failed to load predictions");
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.predicted) {
      toast.error("Predicted value is required");
      return;
    }
    try {
      setSubmitting(true);
      await predictedAPI.create({
        user_id: parseInt(userId),
        variables: [
          {
            variable: form.variable,
            predicted: parseFloat(form.predicted),
            lln: form.lln ? parseFloat(form.lln) : null,
            uln: form.uln ? parseFloat(form.uln) : null,
            zScore: form.zScore ? parseFloat(form.zScore) : null,
            percentPredicted: form.percentPredicted
              ? parseFloat(form.percentPredicted)
              : null,
          },
        ],
      });
      toast.success("Predicted values saved successfully!");
      setShowForm(false);
      setForm({
        variable: "FEV1",
        predicted: "",
        lln: "",
        uln: "",
        zScore: "",
        percentPredicted: "",
      });
      loadPredictions();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save predictions");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") loadPredictions();
  };

  // Calculate stats
  const stats =
    predictions.length > 0
      ? {
          total: predictions.length,
          variables: [...new Set(predictions.map((p) => p.variable))].length,
          avgPredicted: (
            predictions.reduce(
              (sum, p) => sum + (p.percent_predicted || 0),
              0,
            ) / predictions.length
          ).toFixed(1),
        }
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Predicted Values (GLI)</h1>
        {userId && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Prediction
          </Button>
        )}
      </div>

      {/* Search Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Patient ID, Username, or Email..."
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Button
              onClick={loadPredictions}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              {loading ? "Loading..." : "Load Predictions"}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Supports: Patient ID, Username, or Email
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Values",
              value: stats.total,
              icon: Brain,
              color: "bg-purple-500",
              textColor: "text-purple-600",
            },
            {
              label: "Variables",
              value: stats.variables,
              icon: Activity,
              color: "bg-blue-500",
              textColor: "text-blue-600",
            },
            {
              label: "Avg % Predicted",
              value: `${stats.avgPredicted}%`,
              icon: Target,
              color: "bg-green-500",
              textColor: "text-green-600",
            },
          ].map((card, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-3 pt-4 pb-4">
                <div className={`p-2.5 rounded-lg ${card.color}`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{card.label}</p>
                  <p className={`text-xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <Card className="border-purple-200 border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100">
                  <Brain className="h-5 w-5 text-purple-500" />
                </div>
                Add Predicted Values for Patient #{userId}
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
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Variable <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.variable}
                    onChange={(e) =>
                      setForm({ ...form, variable: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
                  >
                    {VARIABLES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Predicted <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.predicted}
                    onChange={(e) =>
                      setForm({ ...form, predicted: e.target.value })
                    }
                    required
                    placeholder="3.50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    LLN (Lower Limit)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.lln}
                    onChange={(e) => setForm({ ...form, lln: e.target.value })}
                    placeholder="2.80"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    ULN (Upper Limit)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.uln}
                    onChange={(e) => setForm({ ...form, uln: e.target.value })}
                    placeholder="4.20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Z-Score
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.zScore}
                    onChange={(e) =>
                      setForm({ ...form, zScore: e.target.value })
                    }
                    placeholder="-0.50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    % Predicted
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.percentPredicted}
                    onChange={(e) =>
                      setForm({ ...form, percentPredicted: e.target.value })
                    }
                    placeholder="92"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Brain className="h-4 w-4 mr-1" />
                  )}
                  {submitting ? "Saving..." : "Save Prediction"}
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

      {/* Predictions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Predicted Values
            {predictions.length > 0 && (
              <Badge className="bg-purple-100 text-purple-800 ml-2">
                {predictions.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
              <p className="mt-2 text-slate-500">Loading predictions...</p>
            </div>
          ) : predictions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variable</TableHead>
                    <TableHead>Predicted</TableHead>
                    <TableHead>LLN</TableHead>
                    <TableHead>ULN</TableHead>
                    <TableHead>Z-Score</TableHead>
                    <TableHead>% Predicted</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.map((p, i) => (
                    <TableRow
                      key={p.id || i}
                      className={i % 2 === 0 ? "bg-slate-50" : ""}
                    >
                      <TableCell className="font-medium">
                        <Badge variant="outline" className="font-mono text-xs">
                          {p.variable}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {p.predicted?.toFixed(2) || "-"}
                      </TableCell>
                      <TableCell>{p.lln?.toFixed(2) || "-"}</TableCell>
                      <TableCell>{p.uln?.toFixed(2) || "-"}</TableCell>
                      <TableCell>{p.z_score?.toFixed(2) || "-"}</TableCell>
                      <TableCell>
                        {p.percent_predicted ? (
                          <Badge
                            className={
                              p.percent_predicted >= 80
                                ? "bg-green-500"
                                : p.percent_predicted >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }
                          >
                            {p.percent_predicted}%
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                        {new Date(p.created).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : userId ? (
            <div className="text-center py-12 text-slate-500">
              <Brain className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-lg">No predicted values found</p>
              <p className="text-sm">Click "Add Prediction" to create one</p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-lg">Enter a Patient ID to view predictions</p>
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
