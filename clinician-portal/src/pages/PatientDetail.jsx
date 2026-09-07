import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Download, Loader2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { patientsAPI } from "../services/api";

import PatientInfoTab from "../components/patients/tabs/PatientInfoTab.jsx";
import SpirometryTab from "../components/patients/tabs/SpirometryTab";
import AnalysisTab from "../components/patients/tabs/AnalysisTab";
import ReportsTab from "../components/patients/tabs/ReportsTab";
import AlertsTab from "../components/patients/tabs/AlertsTab";
import BillingTab from "../components/patients/tabs/BillingTab";
import SessionComparisonTab from "../components/patients/tabs/SessionComparisonTab";
import GlossaryModal from "../components/patients/GlossaryModal.jsx";

const TABS = [
  { key: "patient-info", label: "Patient Info" },
  { key: "spirometry", label: "Spirometry" },
  { key: "analysis", label: "Analysis" },
  { key: "session-comparison", label: "Session Comparison" },
  { key: "reports", label: "Reports" },
  { key: "alerts", label: "Alerts" },
  { key: "billing", label: "Billing" },
];

const TAB_COMPONENTS = {
  "patient-info": PatientInfoTab,
  spirometry: SpirometryTab,
  analysis: AnalysisTab,
  "session-comparison": SessionComparisonTab,
  reports: ReportsTab,
  alerts: AlertsTab,
  billing: BillingTab,
};

// Tabs where a PDF report doesn't make sense / needs user-picked input first
const NON_DOWNLOADABLE_TABS = new Set(["alerts"]);

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "patient-info";

  const [patientName, setPatientName] = useState("");
  const [tabData, setTabData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Params actually used for the currently-loaded tabData — kept in sync so
  // the download button always requests the same slice of data the user is
  // looking at (same date / date range / session ids).
  const [currentParams, setCurrentParams] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    patientsAPI
      .getTabData(id, "patient-info")
      .then((res) => {
        if (isMounted) setPatientName(res.data?.data?.name || "");
      })
      .catch((err) => {
        console.error("[Header fetch error]", err?.response?.data || err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const loadTabData = useCallback(
    async (tab, params = {}) => {
      if (!id) {
        setLoading(false);
        setError("No patient id in URL");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await patientsAPI.getTabData(id, tab, params);

        setTabData(res.data?.data ?? null);
        setCurrentParams(params); // remember what produced this data
      } catch (err) {
        console.error("[PatientDetail] Load patient tab error:", err);

        const detail =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load patient data";
        const status = err?.response?.status;
        setError(status ? `[${status}] ${detail}` : detail);
        toast.error(detail);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  const getDefaultParamsForTab = (tab) => {
    const toISODate = (d) => d.toISOString().split("T")[0];
    const today = new Date();

    switch (tab) {
      case "spirometry":
        return { date: toISODate(today) };

      case "analysis":
      case "reports":
      case "billing": {
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        return { startDate: toISODate(startDate), endDate: toISODate(today) };
      }

      case "session-comparison":
        return null; // waits for user to pick sessions

      case "patient-info":
      case "alerts":
      default:
        return {};
    }
  };

  useEffect(() => {
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
    setSearchParams({ tab: tabKey });
  };

  // Extracts a readable message even when the server returns a JSON error
  // body but we requested responseType: 'blob' (axios hands back a Blob).
  const parseDownloadError = async (err) => {
    const data = err?.response?.data;
    if (data instanceof Blob && data.type.includes("json")) {
      try {
        const text = await data.text();
        const json = JSON.parse(text);
        return json.error || json.message || "Failed to generate PDF";
      } catch {
        return "Failed to generate PDF";
      }
    }
    return err?.message || "Failed to generate PDF";
  };

  const handleDownloadReport = async () => {
    if (!id) return;

    try {
      setDownloading(true);
      const res = await patientsAPI.getPatientReportPdf(id, activeTab, currentParams);

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `patient-${id}-${activeTab}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = await parseDownloadError(err);
      console.error("[PatientDetail] PDF download error:", err);
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
    (activeTab !== "session-comparison" ||
      Boolean(currentParams?.sessionId1 && currentParams?.sessionId2));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate("/patients")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-heading font-bold text-fg tracking-tight">
              {patientName || <Skeleton className="h-6 w-48 rounded-(--radius-control)" />}
            </h1>
            <p className="text-caption text-fg-muted mt-1">Patient overview and clinical data</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setGlossaryOpen(true)}>
            <BookOpen className="h-4 w-4 mr-2" />
            Glossary
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            disabled={!canDownload || downloading}
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-0">
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-fg-muted hover:text-fg"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full rounded-(--radius-control)" />
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

      <GlossaryModal open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </div>
  );
}