import { useEffect, useState } from 'react';
import { predictedAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Brain, Search, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Predicted() {
  const [userId, setUserId] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ variable: 'FEV1', predicted: '', lln: '', uln: '', zScore: '', percentPredicted: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadPredictions = async () => {
    if (!userId) { toast.error('Please enter a User ID'); return; }
    try {
      setLoading(true);
      const res = await predictedAPI.getByUser(userId);
      setPredictions(res.data.data || []);
    } catch (err) { toast.error('Failed to load predictions'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await predictedAPI.create({
        user_id: parseInt(userId),
        variables: [{
          variable: form.variable,
          predicted: parseFloat(form.predicted),
          lln: form.lln ? parseFloat(form.lln) : null,
          uln: form.uln ? parseFloat(form.uln) : null,
          zScore: form.zScore ? parseFloat(form.zScore) : null,
          percentPredicted: form.percentPredicted ? parseFloat(form.percentPredicted) : null,
        }],
      });
      toast.success('Predicted values saved!');
      setShowForm(false);
      setForm({ variable: 'FEV1', predicted: '', lln: '', uln: '', zScore: '', percentPredicted: '' });
      loadPredictions();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const variables = ['FEV1', 'FVC', 'PEFR', 'FEF2575', 'FEV6', 'FEV1/FVC'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Predicted Values (GLI)</h1>
        <Button onClick={() => setShowForm(true)} disabled={!userId}>
          <Plus className="h-4 w-4 mr-2" /> Add Prediction
        </Button>
      </div>

      {/* User ID Input */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Enter User ID..." value={userId} onChange={e => setUserId(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={loadPredictions} disabled={loading}>
              <Brain className="h-4 w-4 mr-2" /> Load Predictions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Form */}
      {showForm && (
        <div className="mb-6">
          <form onSubmit={handleCreate} className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Brain className="h-5 w-5 text-purple-500" /> Add Predicted Values</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Variable *</label>
                <select value={form.variable} onChange={e => setForm({...form, variable: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10">
                  {variables.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Predicted *</label>
                <Input type="number" step="0.01" value={form.predicted} onChange={e => setForm({...form, predicted: e.target.value})} required placeholder="3.50" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">LLN</label>
                <Input type="number" step="0.01" value={form.lln} onChange={e => setForm({...form, lln: e.target.value})} placeholder="2.80" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ULN</label>
                <Input type="number" step="0.01" value={form.uln} onChange={e => setForm({...form, uln: e.target.value})} placeholder="4.20" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Z-Score</label>
                <Input type="number" step="0.01" value={form.zScore} onChange={e => setForm({...form, zScore: e.target.value})} placeholder="-0.50" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">% Predicted</label>
                <Input type="number" step="0.1" value={form.percentPredicted} onChange={e => setForm({...form, percentPredicted: e.target.value})} placeholder="92" />
              </div>
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Prediction'}</Button>
          </form>
        </div>
      )}

      {/* Predictions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Predicted Values {predictions.length > 0 && `(${predictions.length})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
          ) : predictions.length > 0 ? (
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
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{p.variable}</Badge>
                    </TableCell>
                    <TableCell>{p.predicted?.toFixed(2)}</TableCell>
                    <TableCell>{p.lln?.toFixed(2) || '-'}</TableCell>
                    <TableCell>{p.uln?.toFixed(2) || '-'}</TableCell>
                    <TableCell>{p.z_score?.toFixed(2) || '-'}</TableCell>
                    <TableCell>
                      <Badge className={p.percent_predicted >= 80 ? 'bg-green-500' : p.percent_predicted >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>
                        {p.percent_predicted ? `${p.percent_predicted}%` : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{new Date(p.created).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Brain className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-lg">No predicted values found</p>
              <p className="text-sm">Enter a User ID and click Load Predictions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
