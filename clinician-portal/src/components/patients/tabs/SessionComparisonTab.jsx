import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { patientsAPI } from '../../../services/api';
import { formatNumber } from './format';
import BronchodilatorPhase from './BronchodilatorPhase';
import { downloadObservationPdf, getPdfErrorMessage } from './downloadObservationPdf';

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
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      {session && <BronchodilatorPhase phase={session.phase} linked={session.phaseLinked} />}
    </div>
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
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const ready = Boolean(sessionId1 && sessionId2 && sessionId1 !== sessionId2);
  const selectedA = useMemo(() => options.find(o => String(o.observationId) === sessionId1), [options,sessionId1]);
  const selectedB = useMemo(() => options.find(o => String(o.observationId) === sessionId2), [options,sessionId2]);
  const existingLinked = Boolean(data?.isLinkedPair);

  useEffect(() => {
    if (!patientId) return undefined;
    let active = true;
    setOptions([]); setSessionId1(''); setSessionId2(''); setNextPage(null);
    setLoadingOptions(true); setOptionsError(''); setConfirmed(false);
    patientsAPI.getSessionOptions(patientId, { page: 1, limit: 100 })
      .then(res => {
        if (!active) return;
        const rows = res.data?.data?.rows || [];
        setOptions(rows);
        // Newest-first API order: default PRE (A) to the older observation.
        // This is a convenience only; the clinician must confirm the phase.
        setSessionId1(rows[1] ? String(rows[1].observationId) : (rows[0] ? String(rows[0].observationId) : ''));
        setSessionId2(rows[1] ? String(rows[0].observationId) : '');
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
    if (!ready) { toast.error('Choose two different sessions'); return; }
    onRefetch({ sessionId1: Number(sessionId1), sessionId2: Number(sessionId2) });
  };
  const confirmPair = async () => {
    if (!ready || !confirmed || saving) return;
    setSaving(true);
    try {
      await patientsAPI.confirmPrePostPair(patientId, Number(sessionId1), Number(sessionId2));
      toast.success('PRE and POST tests linked successfully');
      setConfirmed(false);
      setOptions(previous => previous.map(item =>
        String(item.observationId) === sessionId1 ? { ...item, phase: 'PRE', phaseLinked: true, linkedObservationId: Number(sessionId2) } :
        String(item.observationId) === sessionId2 ? { ...item, phase: 'POST', phaseLinked: true, linkedObservationId: Number(sessionId1) } : item));
      onRefetch({ sessionId1: Number(sessionId1), sessionId2: Number(sessionId2) });
    } catch (err) { toast.error(err?.response?.data?.error || 'Unable to save PRE/POST pairing'); }
    finally { setSaving(false); }
  };
  const removePair = async () => {
    if (!ready || saving) return;
    setSaving(true);
    try {
      await patientsAPI.removePrePostPair(patientId, Number(sessionId1));
      toast.success('Pairing removed. Recorded flags were retained.');
      setOptions(previous => previous.map(item =>
        [sessionId1, sessionId2].includes(String(item.observationId))
          ? { ...item, phaseLinked: false, linkedObservationId: null,
              phase: item.phase === 'PRE' ? 'UNKNOWN' : item.phase } : item));
      onRefetch({ sessionId1: Number(sessionId1), sessionId2: Number(sessionId2) });
    } catch (err) { toast.error(err?.response?.data?.error || 'Unable to remove pairing'); }
    finally { setSaving(false); }
  };
  const downloadLinkedPair = async () => {
    if (!data?.isLinkedPair || downloadingPdf) return;
    const pre = [data.session1, data.session2].find(s => s?.phase === 'PRE');
    if (!pre?.observationId) return;
    setDownloadingPdf(true);
    try { await downloadObservationPdf(pre.observationId); }
    catch (error) { toast.error(await getPdfErrorMessage(error)); }
    finally { setDownloadingPdf(false); }
  };
  const selectClass = 'w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-fg';
  const selectedMatchesDisplayed = data &&
    Number(sessionId1) === data.session1?.observationId && Number(sessionId2) === data.session2?.observationId;
  return <div className="space-y-5">
    <p className="text-sm text-fg-muted">Compare any two historical tests. To save a PRE/POST relationship, verify that the chosen observations belong to the same bronchodilator assessment.</p>
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
      {[[sessionId1,setSessionId1,'Session A'],[sessionId2,setSessionId2,'Session B']].map(([value,setValue,label]) =>
        <label key={label} className="block space-y-2">
          <span className="text-sm font-medium text-fg">{label} — Date & Time</span>
          <select className={selectClass} value={value} onChange={e => { setValue(e.target.value); setConfirmed(false); }}
            disabled={loadingOptions && options.length === 0}>
            <option value="">Select date & time</option>
            {options.map(item => <option key={item.observationId} value={item.observationId}>
              {fullDate(item.date)} · {item.phase || 'UNKNOWN'}{item.phaseLinked ? ' (linked)' : ' (unpaired / unverified)'} · {item.testsCount} blow(s) · #{item.observationId}
            </option>)}
          </select>
        </label>)}
      <Button onClick={compare} disabled={loading || !ready}>Compare</Button>
    </div>
    {optionsError && <p role="alert" className="text-sm text-red-500">{optionsError}</p>}
    {!loadingOptions && options.length === 0 && !optionsError &&
      <p className="text-sm text-fg-muted">No spirometry sessions available for this patient.</p>}
    {nextPage && <Button variant="outline" onClick={loadMore} disabled={loadingOptions}>
      {loadingOptions ? 'Loading…' : 'Load more dates'}
    </Button>}
    {loading && <p className="text-sm text-fg-muted">Loading comparison…</p>}
    {selectedMatchesDisplayed && <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SessionColumn title="Session A" session={data.session1}/>
        <SessionColumn title="Session B" session={data.session2}/>
      </div>
      {data.timeBetweenSessionsHours != null && <p className="text-xs text-fg-muted">
        Time between sessions: {formatNumber(data.timeBetweenSessionsHours)} hours
      </p>}
      {data.isLinkedPair && <section className="rounded-xl border border-border bg-surface-raised p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-fg">Linked bronchodilator response</h3>
          <span className="text-xs font-medium text-fg-muted">Linked PRE / POST observations</span>
        </div>
        <div className="overflow-x-auto"><table className="min-w-[550px] w-full text-sm">
          <thead><tr className="border-b border-border text-left text-fg-muted">
            <th className="py-2">Metric</th><th className="py-2">Absolute change</th>
            <th className="py-2">Change vs PRE</th><th className="py-2">Change / predicted</th>
          </tr></thead>
          <tbody>{(data.bronchodilatorResponse || []).map(row => <tr key={row.variable} className="border-b border-border last:border-none">
            <td className="py-2 font-medium">{row.variable}</td>
            <td className="py-2">{row.absoluteChange == null ? '—' : `${formatNumber(row.absoluteChange, { maximumFractionDigits: 3 })}${row.variable === 'FEV1/FVC' ? ' ratio' : ' L'}`}</td>
            <td className="py-2">{row.percentBaselineChange == null ? '—' : `${formatNumber(row.percentBaselineChange)}%`}</td>
            <td className="py-2">{row.percentPredictedChange == null ? '—' : `${formatNumber(row.percentPredictedChange)}%`}</td>
          </tr>)}</tbody>
        </table></div>
        <p className="text-xs text-fg-muted">Linked observations should be clinically confirmed against the original test record. Values are descriptive, not an automatic diagnosis. Percentage of predicted uses the PRE reference value.</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={downloadLinkedPair} disabled={downloadingPdf}>
            {downloadingPdf ? 'Preparing PDF…' : 'Download PRE / POST PDF'}
          </Button>
          <Button variant="outline" size="sm" onClick={removePair} disabled={saving}>
            {saving ? 'Updating…' : 'Remove pairing'}
          </Button>
        </div>
      </section>}
    </>}
    <section className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-fg">Confirm a PRE / POST pair</h3>
      <p className="text-sm text-fg-muted">The current mobile app does not reliably link observations, especially after offline sync. The clinician must verify the actual test sequence before saving a pair.</p>
      <div className="flex flex-wrap gap-4 text-xs text-fg-muted">
        <span>Session A: <strong className="text-fg">{selectedA?.phase || 'UNKNOWN'}</strong> → will be PRE</span>
        <span>Session B: <strong className="text-fg">{selectedB?.phase || 'UNKNOWN'}</strong> → will be POST</span>
      </div>
      {ready && selectedA?.date && selectedB?.date && new Date(selectedA.date) > new Date(selectedB.date) &&
        <p role="alert" className="text-xs text-amber-700 dark:text-amber-300">
          Selected PRE is newer than selected POST. Check the true test order; uploaded timestamps may reflect delayed sync.
        </p>}
      <label className="flex items-start gap-2 text-sm text-fg">
        <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 accent-current" />
        I have verified that Session A was performed before bronchodilator medication and Session B after medication, as part of the same assessment.
      </label>
      <Button size="sm" onClick={confirmPair} disabled={!ready || !confirmed || saving || (selectedMatchesDisplayed && existingLinked)}>
        {saving ? 'Saving…' : 'Save PRE / POST pair'}
      </Button>
      <p className="text-xs text-fg-muted">This action saves the PRE/POST link in existing database columns; there is no persistent clinician/time audit without a schema migration. Raw measurements remain unchanged.</p>
    </section>
  </div>;
}
