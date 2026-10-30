import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Sliders,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { Complaint, DuplicateRelationship } from '../types/civic';

interface AiIntelligenceViewProps {
  complaints: Complaint[];
  onOpenComplaint: (complaint: Complaint) => void;
  onRefresh: () => void;
}

export const AiIntelligenceView: React.FC<AiIntelligenceViewProps> = ({
  complaints,
  onOpenComplaint,
  onRefresh,
}) => {
  const [duplicatePairs, setDuplicatePairs] = useState<any[]>([]);
  const [isLoadingDupes, setIsLoadingDupes] = useState(false);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch all duplicate pairs for dedicated review
  const loadDuplicates = async () => {
    setIsLoadingDupes(true);
    try {
      const res = await fetch('/api/ai/duplicates');
      const data = await res.json();
      setDuplicatePairs(data.duplicates || []);
    } catch (err) {
      console.warn('Failed to load duplicates:', err);
    } finally {
      setIsLoadingDupes(false);
    }
  };

  useEffect(() => {
    loadDuplicates();
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => setAiStatus(data))
      .catch(() => {});
  }, []);

  const handleDuplicateAction = async (
    origId: string,
    dupeId: string,
    status: 'confirmed' | 'rejected'
  ) => {
    try {
      const res = await fetch(`/api/complaints/${origId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duplicate_id: dupeId, status }),
      });
      if (res.ok) {
        setActionSuccess(`Duplicate link marked as ${status.toUpperCase()}`);
        setTimeout(() => setActionSuccess(''), 3000);
        loadDuplicates();
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const criticalComplaints = complaints.filter((c) => c.priority === 'Critical');

  return (
    <div className="space-y-6">
      {/* Top AI Status Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                HYBRID AI PIPELINE ARCHITECTURE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Real-time Dual Engine
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              AI Intelligence & Explainable Triage
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              CivicPulse AI combines Google Gemini 3.8 Flash semantic reasoning with deterministic rule-based geospatial scoring and Jaccard token similarity for 100% reliable municipal governance.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 shrink-0 bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Primary AI:</span>
              <span className="text-cyan-300 font-bold">
                {aiStatus?.geminiConfigured ? 'Gemini 3.8 Flash' : 'Rule Engine Fallback'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Geospatial Engine:</span>
              <span className="text-slate-300">Haversine 450m Radius</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Duplicate Metric:</span>
              <span className="text-slate-300">Stemmed Jaccard + Proximity</span>
            </div>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 4 Pillars of CivicPulse AI Intelligence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            1. Autonomous Categorization
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-class civic NLP classifier categorizes raw citizen text into 8 standardized municipal disciplines, eliminating manual clerical sorting.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            2. Duplicate Detection
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Calculates pairwise geographic distances and textual overlap to flag redundant complaints. Administrators maintain final confirmation control.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            3. Explainable 0-100 Scoring
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deconstructs urgency into 5 transparent weighted factors: safety hazard, physical severity, transit exposure, cluster recurrence, and vulnerability.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            4. Tactical Action Briefs
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generates executive field briefs for department heads, specifying required machinery, immediate cordoning steps, and turnaround SLAs.
          </p>
        </div>
      </div>

      {/* Duplicate Management Queue Section */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Duplicate Complaints Verification Queue ({duplicatePairs.length})
            </h2>
            <p className="text-xs text-slate-400">
              AI identifies similar civic reports lodged in the same neighborhood. Confirm to link under a single master work order.
            </p>
          </div>
          <button
            onClick={loadDuplicates}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {isLoadingDupes ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading duplicate pairs...</div>
        ) : duplicatePairs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
            No pending duplicate relationships detected. All current complaints are distinct.
          </div>
        ) : (
          <div className="space-y-3">
            {duplicatePairs.map((pair) => (
              <div
                key={pair.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold text-xs font-mono">
                      {pair.similarity_score}% SIMILARITY MATCH
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Status: <strong className="text-white uppercase">{pair.status}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {pair.status === 'suggested' ? (
                      <>
                        <button
                          onClick={() =>
                            handleDuplicateAction(
                              pair.original_complaint_id,
                              pair.duplicate_complaint_id,
                              'confirmed'
                            )
                          }
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirm Duplicate
                        </button>
                        <button
                          onClick={() =>
                            handleDuplicateAction(
                              pair.original_complaint_id,
                              pair.duplicate_complaint_id,
                              'rejected'
                            )
                          }
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject / Keep Separate
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                        DECISION RECORDED: {pair.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Side by side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Original */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-400 text-xs">
                        Master: {pair.original_complaint_id}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {pair.original_category}
                      </span>
                    </div>
                    <p className="font-bold text-white text-xs leading-snug">
                      {pair.original_title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      📍 {pair.original_location}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Reported by {pair.original_citizen}
                    </p>
                  </div>

                  {/* Duplicate Candidate */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        Candidate: {pair.duplicate_complaint_id}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {pair.dupe_category}
                      </span>
                    </div>
                    <p className="font-bold text-white text-xs leading-snug">
                      {pair.dupe_title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      📍 {pair.dupe_location}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Reported by {pair.dupe_citizen}
                    </p>
                  </div>
                </div>

                {/* Matching Factors */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <span className="font-semibold text-slate-300">Match Signals:</span>
                  {pair.match_reasons.map((r: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono text-[10px] border border-slate-800">
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explainable Priority Matrix Deep-Dive */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            Explainable Priority Scoring Model (Weights & Factors)
          </h2>
          <p className="text-xs text-slate-400">
            How CivicPulse AI evaluates scores from 0 to 100 without arbitrary black-box outputs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Weight: 35%</span>
            <h4 className="text-xs font-bold text-white">Public Safety Risk</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Cave-ins, electric spark hazards, open manholes, pedestrian collision danger.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Weight: 25%</span>
            <h4 className="text-xs font-bold text-white">Severity & Scale</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Feet deep water, extensive craters, completely blocked roadways, structural collapses.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Weight: 20%</span>
            <h4 className="text-xs font-bold text-white">Transit Exposure</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Main arterial highways, metro stations, school crossings, and market hubs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Weight: 15%</span>
            <h4 className="text-xs font-bold text-white">Cluster Recurrence</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Density of corroborating neighbor complaints within 400 meters in the past 7 days.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Weight: 10%</span>
            <h4 className="text-xs font-bold text-white">Vulnerability</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Proximity to hospitals, schools, retirement homes, and water supply contamination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
