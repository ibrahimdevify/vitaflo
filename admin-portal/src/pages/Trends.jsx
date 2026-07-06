import { Activity, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import EmptyState from '../components/shared/EmptyState';
import TrendsChart from '../components/trends/TrendsChart';
import TrendsSearch from '../components/trends/TrendsSearch';
import TrendsSkeleton from '../components/trends/TrendsSkeleton';
import TrendsStats from '../components/trends/TrendsStats';
import TrendsTabSwitcher from '../components/trends/TrendsTabSwitcher';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { trendsAPI } from '../services/api';

export default function Trends() {
  const [userId, setUserId] = useState('');
  const [spirometryTrends, setSpirometryTrends] = useState([]);
  const [iaqTrends, setIaqTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('spirometry');
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear() - 1, 0, 1)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const loadTrends = async () => {
    if (!userId.trim()) {
      toast.error('Please enter a Patient ID, Username, or Email');
      return;
    }
    try {
      setLoading(true);
      if (activeTab === 'spirometry') {
        const res = await trendsAPI.getSpirometry(
          userId.trim(),
          dateRange.start,
          dateRange.end
        );
        const data = (res.data.data || []).filter((d) => d.fev1 || d.fvc);
        if (data.length > 0) {
          const latest = data[data.length - 1];
          setStats({
            latest,
            bestFev1: Math.max(...data.map((d) => d.fev1 || 0)),
            bestFvc: Math.max(...data.map((d) => d.fvc || 0)),
            bestPefr: Math.max(...data.map((d) => d.pefr || 0)),
            total: data.length,
          });
        } else {
          setStats(null);
        }
        setSpirometryTrends(
          data.map((d) => ({
            date: new Date(d.dbdate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: '2-digit',
            }),
            fev1: d.fev1,
            fvc: d.fvc,
            pefr: d.pefr,
            fef2575: d.fef2575,
            fev1_perc: d.fev1_perc,
          }))
        );
        if (data.length === 0) toast.info('No spirometry data found');
      } else {
        const res = await trendsAPI.getIAQ(
          userId.trim(),
          dateRange.start,
          dateRange.end
        );
        const data = res.data.data || [];
        setIaqTrends(
          data.map((d) => ({
            date: new Date(d.dbdate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            pm25: d.pm25,
            pm10: d.pm10,
            temperature: d.temperature,
            humidity: d.humidity,
          }))
        );
        if (data.length === 0) toast.info('No air quality data found');
      }
    } catch (err) {
      toast.error('Failed to load trends');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !spirometryTrends.length && !iaqTrends.length)
    return <TrendsSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            Trends & Analytics
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Analyze patient health data over time
          </p>
        </div>
        {stats && (
          <Badge variant="info" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            {stats.total} Records
          </Badge>
        )}
      </div>

      <TrendsSearch
        userId={userId}
        onUserIdChange={setUserId}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        loading={loading}
        onSearch={loadTrends}
      />

      {stats && activeTab === 'spirometry' && <TrendsStats stats={stats} />}

      <TrendsTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'spirometry' &&
        (spirometryTrends.length > 0 ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <TrendsChart
                  data={spirometryTrends}
                  lines={[
                    {
                      key: 'fev1',
                      color: 'var(--color-info)',
                      name: 'FEV1 (L)',
                    },
                    {
                      key: 'fvc',
                      color: 'var(--color-success)',
                      name: 'FVC (L)',
                    },
                    {
                      key: 'pefr',
                      color: 'var(--color-warning)',
                      name: 'PEFR (L/s)',
                    },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <TrendsChart
                  data={spirometryTrends}
                  height={300}
                  lines={[
                    {
                      key: 'fev1_perc',
                      color: 'var(--color-brand-500)',
                      name: 'FEV1%',
                    },
                    {
                      key: 'fef2575',
                      color: '#ec4899',
                      name: 'FEF25-75 (L/s)',
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        ) : userId ? (
          <Card>
            <CardContent className="pt-4">
              <EmptyState
                icon={Activity}
                title="No spirometry trends found"
                description="Try adjusting the date range"
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4">
              <EmptyState
                icon={Search}
                title="Enter a Patient ID to view trends"
                description="Supports: Patient ID, Username, or Email"
              />
            </CardContent>
          </Card>
        ))}

      {activeTab === 'iaq' &&
        (iaqTrends.length > 0 ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <TrendsChart
                  data={iaqTrends}
                  lines={[
                    {
                      key: 'pm25',
                      color: 'var(--color-warning)',
                      name: 'PM2.5',
                    },
                    { key: 'pm10', color: 'var(--color-danger)', name: 'PM10' },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <TrendsChart
                  data={iaqTrends}
                  height={300}
                  lines={[
                    { key: 'temperature', color: '#f97316', name: 'Temp (°C)' },
                    { key: 'humidity', color: '#06b6d4', name: 'Humidity (%)' },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        ) : userId ? (
          <Card>
            <CardContent className="pt-4">
              <EmptyState icon={Activity} title="No air quality data found" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4">
              <EmptyState
                icon={Search}
                title="Enter a Patient ID to view trends"
              />
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
