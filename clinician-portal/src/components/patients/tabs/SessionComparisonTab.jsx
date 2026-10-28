import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { patientsAPI } from '../../../services/api';
import { formatDate, formatNumber } from './format';

const ROW_LABELS = [
  { key: 'FEV1', label: 'FEV1 (L)' },
  { key: 'FVC', label: 'FVC (L)' },
  { key: 'FEV1/FVC', label: 'FEV1/FVC' },
  { key: 'FEF2575', label: 'FEF25-75 (L/s)' },
  { key: 'FEV6', label: 'FEV6 (L)' },
  { key: 'PEFR', label: 'PEFR (L/s)' },
];

function fullDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? String(value) : date.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function SessionColumn({ title, session }) {
  const byVariable = new Map((session?.results || []).map(row => [row.variable, row]));
  return <section className="min-w-0 rounded-2xl border border-border bg-card p-4">
    <h3 className="mb-2 text-base font-semibold text-fg">{title}</h3>
    {!session ? <p className="py-8 text-center text-sm text-fg-muted">Select a date and press Compare</p> : <>
      <p className="mb-3 text-xs text-fg-muted">{fullDate(session.date)}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-sm">
          <thead><tr className="border-b border-border bg-surface-raised text-left">
            {['Variable','Observed','LLN','z-score','Predicted','% Predicted'].map(h =>
              <th key={h} className="px-3 py-3 font-medium text-fg-muted">{h}</th>)}</tr></thead>
          <tbody>{ROW_LABELS.map(({ key, label }) => {
            const row = byVariable.get(key);
            return <tr key={key} className="border-b border-border last:border-none">
              <td className="px-3 py-3 font-medium text-fg">{label}</td>
              {[row?.observed,row?.lln,row?.zScore,row?.predicted,row?.percentPredicted].map((value,i) =>
                <td key={i} className="px-3 py-3 text-fg">{value == null ? '—' : formatNumber(value)}</td>)}
            </tr>;
          })}</tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-fg-muted">
        Post-bronchodilator: {session.isPostBronchodilator ? 'Yes' : 'No'}
      </p>
    </>}
  </section>;
}

export default function SessionComparisonTab({ patientId, data, onRefetch, loading }) {
  const [options, setOptions] = useState([]);
  const [sessionId1, setSessionId1] = useState('');
  const [sessionId2, setSessionId2] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [nextPage, setNextPage] = useState(null);

  useEffect(() => {
    if (!patientId) return undefined;
    let active = true;
    setOptions([]); setSessionId1(''); setSessionId2(''); setNextPage(null);
    setLoadingOptions(true); setOptionsError('');
    patientsAPI.getSessionOptions(patientId, { page: 1, limit: 100 })
      .then(res => {
        if (!active) return;
        const rows = res.data?.data?.rows || [];
        setOptions(rows);
        setSessionId1(rows[0] ? String(rows[0].observationId) : '');
        setSessionId2(rows[1] ? String(rows[1].observationId) : '');
        const p = res.data?.data?.pagination;
        setNextPage(p && p.page < p.totalPages ? 2 : null);
      })
      .catch(err => { if (active) setOptionsError(err?.response?.data?.error || 'Could not load sessions'); })
      .finally(() => { if (active) setLoadingOptions(false); });
    return () => { active = false; };
  }, [patientId]);

  const loadMore = async () => {
    if (!nextPage || loadingOptions) return;
    setLoadingOptions(true);
    try {
      const res = await patientsAPI.getSessionOptions(patientId, { page: nextPage, limit: 100 });
      const rows = res.data?.data?.rows || [];
      setOptions(previous => [...previous, ...rows]);
      const p = res.data?.data?.pagination;
      setNextPage(p && p.page < p.totalPages ? p.page + 1 : null);
    } catch (err) { toast.error(err?.response?.data?.error || 'Could not load more sessions'); }
    finally { setLoadingOptions(false); }
  };
  const compare = () => {
    if (!sessionId1 || !sessionId2) return;
    if (sessionId1 === sessionId2) {
      toast.error('Choose two different sessions'); return;
    }
    onRefetch({ sessionId1: Number(sessionId1), sessionId2: Number(sessionId2) });
  };
  const selectClass = 'w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-fg';
  return <div className="space-y-5">
    <p className="text-sm text-fg-muted">Choose a test date and time for each side. Results use the same GLI calculation as the Spirometry tab.</p>
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
      {[[sessionId1,setSessionId1,'Session A'],[sessionId2,setSessionId2,'Session B']].map(([value,setValue,label]) =>
        <label key={label} className="block space-y-2">
          <span className="text-sm font-medium text-fg">{label} — Date & Time</span>
          <select className={selectClass} value={value} onChange={e => setValue(e.target.value)}
            disabled={loadingOptions && options.length === 0}>
            <option value="">Select date & time</option>
            {options.map(item => <option key={item.observationId} value={item.observationId}>
              {fullDate(item.date)} · {item.testsCount} test(s)
            </option>)}
          </select>
        </label>)}
      <Button onClick={compare} disabled={loading || !sessionId1 || !sessionId2}>Compare</Button>
    </div>
    {optionsError && <p role="alert" className="text-sm text-red-500">{optionsError}</p>}
    {!loadingOptions && options.length === 0 && !optionsError &&
      <p className="text-sm text-fg-muted">No spirometry sessions available for this patient.</p>}
    {nextPage && <Button variant="outline" onClick={loadMore} disabled={loadingOptions}>
      {loadingOptions ? 'Loading…' : 'Load more dates'}
    </Button>}
    {loading && <p className="text-sm text-fg-muted">Loading comparison…</p>}
    {data && <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SessionColumn title="Session A" session={data.session1}/>
        <SessionColumn title="Session B" session={data.session2}/>
      </div>
      {data.timeBetweenSessionsHours != null && <p className="text-xs text-fg-muted">
        Time between sessions: {formatNumber(data.timeBetweenSessionsHours, 1)} hours
      </p>}
    </>}
  </div>;
}
