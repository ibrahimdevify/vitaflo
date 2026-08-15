import { Brain, Plus, Search, UserRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AddPredictionForm from "../components/predicted/AddPredictionForm";

import PredictedStats from "../components/predicted/PredictedStats";
import PredictedTable from "../components/predicted/PredictedTable";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import EmptyState from "../components/shared/EmptyState";
import { predictedAPI } from "../services/api";

export default function Predicted() {
  const [userId, setUserId] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);

  const loadPredictions = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a Patient Username");
      return;
    }
    try {
      setLoading(true);
      const res = await predictedAPI.getByUser(userId.trim());
      const data = res.data?.data || res.data || [];
      setPredictions(Array.isArray(data) ? data : []);
      setPatientInfo({ userName: userId.trim() });

      if (data.length === 0) {
        toast.info("No predicted values found for this patient");
      } else {
        toast.success(`Loaded ${data.length} predicted values`);
      }
    } catch (err) {
      toast.error("Failed to load predictions");
      setPredictions([]);
      setPatientInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") loadPredictions();
  };

  const handleCreate = async (data) => {
    try {
      setSubmitting(true);
      await predictedAPI.create({
        user_id: userId, // ✅ Send username string, backend will resolve
        variables: [
          {
            ...data,
            predicted: parseFloat(data.predicted),
            lln: data.lln ? parseFloat(data.lln) : null,
            uln: data.uln ? parseFloat(data.uln) : null,
            zScore: data.zScore ? parseFloat(data.zScore) : null,
            percentPredicted: data.percentPredicted
              ? parseFloat(data.percentPredicted)
              : null,
          },
        ],
      });
      toast.success("Predicted values saved!");
      setShowForm(false);
      loadPredictions();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save predictions");
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            Predicted Values (GLI)
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Manage GLI predicted reference values for patients
          </p>
        </div>
        {patientInfo && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Prediction
          </Button>
        )}
      </div>

      {/* Search Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
              <Input
                placeholder="Search by Patient Username..."
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Button onClick={loadPredictions} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Loading..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Info */}
      {patientInfo && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-linear-to-br from-brand-500 to-brand-700 text-white font-semibold">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-fg">
                Patient: {patientInfo.userName}
              </p>
              <p className="text-caption text-fg-muted">
                {predictions.length} predicted values found
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && <PredictedStats stats={stats} />}

      {showForm && (
        <AddPredictionForm
          patientId={userId}
          submitting={submitting}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
              <Brain className="h-3.5 w-3.5 text-white" />
            </div>
            Predicted Values
            {predictions.length > 0 && (
              <Badge variant="brand">{predictions.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
          ) : predictions.length > 0 ? (
            <PredictedTable
              data={predictions}
              loading={loading}
              hasSearched={!!userId}
            />
          ) : userId ? (
            <EmptyState
              icon={Brain}
              title="No predicted values found"
              description="Search for a patient username to view their GLI predicted values"
            />
          ) : (
            <EmptyState
              icon={Brain}
              title="Search for a Patient"
              description="Enter a Patient Username above to view their predicted values"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
