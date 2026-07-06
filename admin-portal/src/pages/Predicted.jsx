import { Brain, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AddPredictionForm from '../components/predicted/AddPredictionForm';
import PredictedSearch from '../components/predicted/PredictedSearch';
import PredictedStats from '../components/predicted/PredictedStats';
import PredictedTable from '../components/predicted/PredictedTable';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { predictedAPI } from '../services/api';

export default function Predicted() {
  const [userId, setUserId] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPredictions = async () => {
    if (!userId.trim()) {
      toast.error('Please enter a Patient ID');
      return;
    }
    try {
      setLoading(true);
      const res = await predictedAPI.getByUser(userId.trim());
      const data = res.data || res.data?.data || [];
      setPredictions(Array.isArray(data) ? data : []);
      if (data.length === 0) toast.info('No predicted values found');
    } catch (err) {
      toast.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      setSubmitting(true);
      await predictedAPI.create({
        user_id: parseInt(userId),
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
      toast.success('Predicted values saved!');
      setShowForm(false);
      loadPredictions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
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
              0
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
            Manage GLI predicted reference values
          </p>
        </div>
        {userId && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Prediction
          </Button>
        )}
      </div>

      <PredictedSearch
        userId={userId}
        onUserIdChange={setUserId}
        loading={loading}
        onSearch={loadPredictions}
      />
      {stats && <PredictedStats stats={stats} />}

      {showForm && (
        <AddPredictionForm
          patientId={userId}
          submitting={submitting}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

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
          <PredictedTable
            data={predictions}
            loading={loading}
            hasSearched={!!userId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
