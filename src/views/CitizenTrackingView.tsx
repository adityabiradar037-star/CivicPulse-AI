import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Building2,
  User,
  AlertCircle,
  FileText,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ComplaintStatus, PriorityLevel } from '../types/civic';

interface CitizenTrackingViewProps {
  initialComplaintId?: string;
  onClearInitialId?: () => void;
}

const LIFECYCLE_STEPS: Array<{
  status: ComplaintStatus;
  label: string;
  desc: string;
}> = [
  {
    status: 'Submitted',
    label: 'Submitted',
    desc: 'Lodged in municipal database with geotag and evidence.',
  },
  {
    status: 'Under Review',
    label: 'Under Review',
    desc: 'AI Triage evaluation, priority scoring & duplicate check.',
  },
  {
    status: 'Assigned',
    label: 'Assigned',
    desc: 'Routed to relevant municipal department and field officer.',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    desc: 'Field team deployed on site with remedial equipment.',
  },
  {
    status: 'Resolved',
    label: 'Resolved',
    desc: 'Work verified on site and compliance logged.',
  },
];

export const CitizenTrackingView: React.FC<CitizenTrackingViewProps> = ({
  initialComplaintId,
  onClearInitialId,
}) => {
  const [complaintId, setComplaintId] = useState(initialComplaintId || '');
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample quick IDs for demoing
  const demoIds = ['CP-2026-1001', 'CP-2026-1008', 'CP-2026-1014', 'CP-2026-1019'];

  const handleTrack = async (idToSearch: string) => {
    const trimmed = idToSearch.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/complaints/${trimmed}/track`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Complaint ID not found.');
      }
      setTrackingData(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to retrieve tracking records');
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialComplaintId) {
      setComplaintId(initialComplaintId);
      handleTrack(initialComplaintId);
      if (onClearInitialId) onClearInitialId();
    }
  }, [initialComplaintId]);

  const getCurrentStepIndex = (status: ComplaintStatus) => {
    if (status === 'Rejected') return -1;
    const index = LIFECYCLE_STEPS.findIndex((s) => s.status === status);
    return index !== -1 ? index : 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
          PUBLIC TRANSPARENCY TRACKER
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Track Your Civic Complaint
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
          Enter your unique Complaint ID to check real-time progress, assigned department, and published authority remarks.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack(complaintId);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="Enter Complaint ID (e.g. CP-2026-1001)"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-cyan-500 placeholder-slate-500 font-mono transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !complaintId.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Checking Registry...' : 'Track Status'}
          </button>
        </form>

        {/* Demo ID Clickable Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Quick Demo Samples:</span>
          {demoIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setComplaintId(id);
                handleTrack(id);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-mono text-[11px] font-semibold transition-colors"
            >
              {id}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Tracking Result View */}
      {trackingData && (
        <div className="space-y-6">
          {/* Main Status & Header Banner */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    {trackingData.complaintId}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                    {trackingData.category}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-2 leading-snug">
                  {trackingData.title}
                </h2>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">
                  Current Status
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1 ${
                    trackingData.status === 'Resolved'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : trackingData.status === 'In Progress'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      : 'bg-blue-950 text-blue-400 border-blue-800'
                  }`}
                >
                  {trackingData.status}
                </span>
              </div>
            </div>

            {/* Stepper Lifecycle Visual */}
            <div className="pt-4 border-t border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                Complaint Lifecycle Progression
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const currentIdx = getCurrentStepIndex(trackingData.status);
                  const isCompleted = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;

                  return (
                    <div
                      key={step.status}
                      className={`p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                          : isCompleted
                          ? 'bg-slate-950/80 border-slate-800'
                          : 'bg-slate-950/30 border-slate-800/40 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-cyan-400 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isCurrent ? 'text-cyan-300' : isCompleted ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Location & Coordinates
              </span>
              <p className="text-white text-xs font-medium">{trackingData.location_address}</p>
              <p className="text-[11px] font-mono text-slate-400">
                GPS: {trackingData.latitude?.toFixed(4)}, {trackingData.longitude?.toFixed(4)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Assigned Department & Officer
              </span>
              <p className="text-white text-xs font-medium">{trackingData.department}</p>
              <p className="text-[11px] text-slate-400">
                Personnel: {trackingData.assigned_to || 'Assigned to field division'}
              </p>
            </div>
          </div>

          {/* Photographic Evidence if any */}
          {trackingData.image_url && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Filed Photo Evidence
              </span>
              <div className="rounded-xl overflow-hidden max-h-56 bg-slate-950 flex items-center justify-center border border-slate-800">
                <img
                  src={trackingData.image_url}
                  alt="Evidence"
                  className="max-h-56 object-cover w-full"
                />
              </div>
            </div>
          )}

          {/* Authority Remarks Audit Trail */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Published Authority Remarks & Actions Timeline
            </h2>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {trackingData.timeline?.map((item: any) => (
                <div key={item.id} className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-900"></span>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white flex items-center gap-2">
                        <span>{item.status}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          • {item.actor_name}
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{item.remark}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
