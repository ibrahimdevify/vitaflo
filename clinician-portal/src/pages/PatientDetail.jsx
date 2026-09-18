import { ArrowLeft, BookOpen, Download, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { patientsAPI } from '../services/api';

import GlossaryModal from '../components/patients/GlossaryModal.jsx';
import AlertsTab from '../components/patients/tabs/AlertsTab';
import AnalysisTab from '../components/patients/tabs/AnalysisTab';
import BillingTab from '../components/patients/tabs/BillingTab';
import PatientInfoTab from '../components/patients/tabs/PatientInfoTab.jsx';
import ReportsTab from '../components/patients/tabs/ReportsTab';
import SessionComparisonTab from '../components/patients/tabs/SessionComparisonTab';
import SpirometryTab from '../components/patients/tabs/SpirometryTab';

const TABS = [
  { key: 'patient-info', label: 'Patient Info' },
  { key: 'spirometry', label: 'Spirometry' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'session-comparison', label: 'Session Comparison' },
  { key: 'reports', label: 'Reports' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'billing', label: 'Billing' },
];

const TAB_COMPONENTS = {
  'patient-info': PatientInfoTab,
  spirometry: SpirometryTab,
  analysis: AnalysisTab,
  'session-comparison': SessionComparisonTab,
  reports: ReportsTab,
  alerts: AlertsTab,
  billing: BillingTab,
};

// Tabs where a PDF report doesn't make sense / needs user-picked input first
const NON_DOWNLOADABLE_TABS = new Set(['alerts']);

const STORAGE_KEY = 'activePatientId';

export default function PatientDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'patient-info';

  // Resolve the patient id ONCE on mount:
  //   1. prefer navigation state (fresh click from the patients list)
  //   2. fall back to sessionStorage (tab change / refresh)
  // Never read location.state again after this — setSearchParams wipes it.
  const [id] = useState(() => {
    const fromState = Number(location.state?.patientId);
    if (Number.isFinite(fromState) && fromState > 0) {
      sessionStorage.setItem(STORAGE_KEY, String(fromState));
      return fromState;
    }

    const stored = Number(sessionStorage.getItem(STORAGE_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : NaN;
  });

  const [patientName, setPatientName] = useState('');
  const [tabData, setTabData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Params actually used for the currently-loaded tabData — kept in sync so
  // the download button always requests the same slice of data the user is
  // looking at (same date range / session ids / page).
  const [currentParams, setCurrentParams] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  // If we have no id at all (deep link / cleared storage), bounce out.
  useEffect(() => {
    if (!Number.isFinite(id)) {
      navigate('/patients', { replace: true });
    }
  }, [id, navigate]);

  // Header: fetch the patient's name.
  useEffect(() => {
    if (!Number.isFinite(id)) return;
    let isMounted = true;

    patientsAPI
      .getTabData(id, 'patient-info')
      .then((res) => {
        if (isMounted) setPatientName(res.data?.data?.name || '');
      })
      .catch((err) => {
        console.error(
          '[Header fetch error]',
          err?.response?.data || err.message
        );
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const loadTabData = useCallback(
    async (tab, params = {}) => {
      if (!Number.isFinite(id)) {
        setLoading(false);
        setError('No patient selected');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await patientsAPI.getTabData(id, tab, params);

        setTabData(res.data?.data ?? null);
        setCurrentParams(params); // remember what produced this data
      } catch (err) {
        console.error('[PatientDetail] Load patient tab error:', err);

        const detail =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load patient data';
        const status = err?.response?.status;
        setError(status ? `[${status}] ${detail}` : detail);
        toast.error(detail);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  /**
   * Initial params sent when a tab is first opened (or re-opened).
   *
   * Only Session Comparison needs client-side gating (it waits for the user
   * to enter two session ids — there's nothing sensible to load until then).
   * Every other tab is loaded with no filter at all: the backend returns the
   * patient's full history, page 1, for spirometry / analysis / reports /
   * billing / alerts when no startDate/endDate is passed — so the client
   * must NOT invent a date range or a single `date` param, or it would
   * silently override that "show everything by default" behavior.
   */
  const getDefaultParamsForTab = (tab) => {
    if (tab === 'session-comparison') {
      return null; // waits for user to pick sessions
    }
    return {};
  };

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setLoading(false);
      return;
    }

    setTabData(null);
    setCurrentParams({});

    const defaultParams = getDefaultParamsForTab(activeTab);
    if (defaultParams === null) {
      setLoading(false);
      return;
    }

    loadTabData(activeTab, defaultParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeTab]);

  const handleTabChange = (tabKey) => {
    if (tabKey === activeTab) return;
    // No need to carry location.state — id lives in sessionStorage now.
    setSearchParams({ tab: tabKey });
  };

  const handleBack = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    navigate('/patients');
  };

  // Extracts a readable message even when the server returns a JSON error
  // body but we requested responseType: 'blob' (axios hands back a Blob).
  const parseDownloadError = async (err) => {
    const data = err?.response?.data;
    if (data instanceof Blob && data.type.includes('json')) {
      try {
        const text = await data.text();
        const json = JSON.parse(text);
        return json.error || json.message || 'Failed to generate PDF';
      } catch {
        return 'Failed to generate PDF';
      }
    }
    return err?.message || 'Failed to generate PDF';
  };

  const handleDownloadReport = async () => {
    if (!Number.isFinite(id)) return;

    // NOTE: patientsAPI.getPatientReportPdf calls a PDF export endpoint that
    // hasn't been built on the backend yet (only the JSON tab endpoints from
    // patientController.getPatientById exist so far). This will 404/error
    // until that endpoint is added — left in place since removing the
    // button wasn't requested, but flagging it so it isn't mistaken for a
    // working feature.
    try {
      setDownloading(true);
      const res = await patientsAPI.getPatientReportPdf(
        id,
        activeTab,
        currentParams
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patient-${id}-${activeTab}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = await parseDownloadError(err);
      console.error('[PatientDetail] PDF download error:', err);
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  const canDownload =
    !loading &&
    !error &&
    !NON_DOWNLOADABLE_TABS.has(activeTab) &&
    (activeTab !== 'session-comparison' ||
      Boolean(currentParams?.sessionId1 && currentParams?.sessionId2));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-heading font-semibold tracking-tight text-fg">
              {patientName || (
                <Skeleton className="h-6 w-48 rounded-(--radius-control)" />
              )}
            </h1>

            <p className="mt-0.5 text-caption text-fg-muted">
              Patient overview and clinical data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGlossaryOpen(true)}
            className="gap-1.5 flex-1"
          >
            <BookOpen className="h-4 w-4" />
            <span className="">Glossary</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            disabled={!canDownload || downloading}
            className="gap-1.5 flex-1"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="">Download PDF</span>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex overflow-x-auto scrollbar-none">
            <div className="flex min-w-max  w-full items-center gap-1 rounded-(--radius-control) bg-surface-raised p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`whitespace-nowrap grow rounded-(--radius-control) px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-surface text-brand-600 shadow-sm'
                      : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-9 w-full rounded-(--radius-control)"
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-body text-red-600">{error}</p>
          ) : ActiveTabComponent ? (
            <ActiveTabComponent
              patientId={id}
              data={tabData}
              onRefetch={(params) => loadTabData(activeTab, params)}
            />
          ) : null}
        </CardContent>
      </Card>
      <GlossaryModal
        open={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
      />
    </div>
  );
}