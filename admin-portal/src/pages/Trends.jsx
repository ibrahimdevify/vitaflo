import { useEffect, useState } from 'react';
import { trendsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TrendingUp, Activity, Wind, Search } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Trends() {
  const [userId, setUserId] = useState('');
  const [spirometryTrends, setSpirometryTrends] = useState([]);
  const [iaqTrends, setIaqTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('spirometry');

  const loadTrends = async () => {
    if (!userId) { toast.error('Please enter a User ID'); return; }
    try {
      setLoading(true);
      const start = '2020-01-01';
      const end = '2030-12-31';

      if (activeTab === 'spirometry') {
        const res = await trendsAPI.getSpirometry(userId, start, end);
        const data = res.data.data || [];
        setSpirometryTrends(data.map(d => ({
          date: new Date(d.dbdate).toLocaleDateString(),
          fev1: d.fev1,
          fvc: d.fvc,
          pefr: d.pefr,
          fef2575: d.fef2575,
          fev1_perc: d.fev1_perc,
        })));
      } else if (activeTab === 'iaq') {
        const res = await trendsAPI.getIAQ(userId, start, end);
        const data = res.data.data || [];
        setIaqTrends(data.map(d => ({
          date: new Date(d.dbdate).toLocaleDateString(),
          pm25: d.pm25,
          pm10: d.pm10,
          temperature: d.temperature,
          humidity: d.humidity,
          co2: d.co2,
          voc: d.voc,
        })));
      }
    } catch (err) { toast.error('Failed to load trends'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trends & Analytics</h1>
      </div>

      {/* User ID Input */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Enter User ID..." value={userId} onChange={e => setUserId(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={loadTrends} disabled={loading}>
              <TrendingUp className="h-4 w-4 mr-2" /> Load Trends
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'spirometry', label: 'Spirometry', icon: Activity },
          { key: 'iaq', label: 'Air Quality (IAQ)', icon: Wind },
        ].map(tab => (
          <Button key={tab.key} variant={activeTab === tab.key ? 'default' : 'outline'} onClick={() => setActiveTab(tab.key)}>
            <tab.icon className="h-4 w-4 mr-2" /> {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div><p className="mt-2 text-slate-500">Loading trends...</p></div>
      ) : (
        <>
          {/* Spirometry Trends */}
          {activeTab === 'spirometry' && (
            <div className="space-y-6">
              {spirometryTrends.length > 0 ? (
                <>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-500" /> FEV1, FVC, PEFR Trends</CardTitle></CardHeader>
                    <CardContent>
                      <div style={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={spirometryTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="fev1" stroke="#3b82f6" name="FEV1 (L)" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="fvc" stroke="#10b981" name="FVC (L)" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="pefr" stroke="#f59e0b" name="PEFR (L/s)" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>FEV1% & FEF25-75 Trends</CardTitle></CardHeader>
                    <CardContent>
                      <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={spirometryTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="fev1_perc" stroke="#8b5cf6" name="FEV1%" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="fef2575" stroke="#ec4899" name="FEF25-75 (L/s)" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card><CardContent className="text-center py-12 text-slate-500"><Activity className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p className="text-lg">No spirometry trends found</p><p className="text-sm">Enter a User ID and click Load Trends</p></CardContent></Card>
              )}
            </div>
          )}

          {/* IAQ Trends */}
          {activeTab === 'iaq' && (
            <div className="space-y-6">
              {iaqTrends.length > 0 ? (
                <>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Wind className="h-5 w-5 text-green-500" /> PM2.5 & PM10 Trends</CardTitle></CardHeader>
                    <CardContent>
                      <div style={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={iaqTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="pm25" stroke="#f59e0b" name="PM2.5" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="pm10" stroke="#ef4444" name="PM10" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Temperature & Humidity</CardTitle></CardHeader>
                    <CardContent>
                      <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={iaqTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f97316" name="Temp (°C)" strokeWidth={2} dot={{ r: 3 }} />
                            <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#06b6d4" name="Humidity (%)" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card><CardContent className="text-center py-12 text-slate-500"><Wind className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p className="text-lg">No IAQ trends found</p><p className="text-sm">Enter a User ID and click Load Trends</p></CardContent></Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
