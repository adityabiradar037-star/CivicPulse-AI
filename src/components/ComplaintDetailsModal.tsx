import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  User,
  Phone,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Send,
  Building2,
  FileCheck2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  DepartmentName,
  PriorityLevel,
} from '../types/civic';

interface ComplaintDetailsModalProps {
  complaint: Complaint | null;
  updates: any[];
  duplicates: any[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: ComplaintStatus, remark: string) => Promise<void>;
  onAssign: (id: string, department: DepartmentName, assignedTo: string, remark?: string) => Promise<void>;
  onUpdateDetails: (id: string, updates: Partial<Complaint>) => Promise<void>;
  onManageDuplicate: (originalId: string, dupeId: string, status: 'confirmed' | 'rejected') => Promise<void>;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaint,
  updates,
  duplicates,
  onClose,
  onUpdateStatus,
  onAssign,
  onUpdateDetails,
  onManageDuplicate,
}) => {
  if (!complaint) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'timeline' | 'action'>('overview');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint.status);
  const [statusRemark, setStatusRemark] = useState('');
  const [selectedDept, setSelectedDept] = useState<DepartmentName>(complaint.department);
  const [assigneeName, setAssigneeName] = useState(complaint.assigned_to || '');
  const [assignRemark, setAssignRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form states for manual AI override
  const [overrideCategory, setOverrideCategory] = useState<ComplaintCategory>(complaint.category);
  const [overridePriority, setOverridePriority] = useState<PriorityLevel>(complaint.priority);
  const [isSavingOverride, setIsSavingOverride] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(complaint.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusRemark.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateStatus(complaint.id, newStatus, statusRemark);
      setStatusRemark('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeName.trim()) return;
    setIsSubmitting(true);
    try {
      await onAssign(complaint.id, selectedDept, assigneeName, assignRemark);
      setAssignRemark('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveOverrides = async () => {
    setIsSavingOverride(true);
    try {
      await onUpdateDetails(complaint.id, {
        category: overrideCategory,
        priority: overridePriority,
      });
    } finally {
      setIsSavingOverride(false);
    }
  };

  const getPriorityBadgeClass = (level: PriorityLevel) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-400 border-rose-800/80';
      case 'High':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'Medium':
        return 'bg-blue-950/80 text-blue-400 border-blue-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadgeClass = (st: ComplaintStatus) => {
    switch (st) {
      case 'Resolved':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
      case 'In Progress':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
      case 'Assigned':
        return 'bg-blue-950/80 text-blue-400 border-blue-800/80';
      case 'Under Review':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      case 'Rejected':
        return 'bg-red-950/80 text-red-400 border-red-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-800 text-cyan-400 font-bold border border-slate-700 flex items-center gap-1.5">
              {complaint.id}
              <button
                onClick={handleCopyId}
                title="Copy Complaint ID"
                className="hover:text-white"
              >
                {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getPriorityBadgeClass(complaint.priority)}`}>
              {complaint.priority} ({complaint.priority_score}/100)
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadgeClass(complaint.status)}`}>
              {complaint.status}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tab Nav */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Complaint Details
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            AI Intelligence & Reasons
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'action'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Authority Actions & Routing
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit History ({updates.length})
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Title & Description */}
              <div>
                <h2 className="text-xl font-bold text-white mb-2 leading-snug">
                  {complaint.title}
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {complaint.description}
                </p>
              </div>

              {/* Attached Image if available */}
              {complaint.image_url && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Photographic Evidence
                  </h3>
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-64 flex items-center justify-center">
                    <img
                      src={complaint.image_url}
                      alt="Complaint evidence"
                      className="w-full h-auto max-h-64 object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Location & Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Location Address</span>
                  </div>
                  <p className="text-white text-xs font-medium">
                    {complaint.location_address}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Coordinates: {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Department & Assignee</span>
                  </div>
                  <p className="text-white text-xs font-medium">
                    {complaint.department}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Officer: {complaint.assigned_to || 'Unassigned / Queue'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Reported By</span>
                  </div>
                  <p className="text-white text-xs font-medium">
                    {complaint.citizen_name}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Contact: {complaint.citizen_contact}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Submission Date</span>
                  </div>
                  <p className="text-white text-xs font-medium">
                    {new Date(complaint.created_at).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Last Updated: {new Date(complaint.updated_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Duplicate relationships list */}
              {duplicates.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Detected Duplicate Reports ({duplicates.length})
                    </span>
                    <span className="text-[10px] text-amber-400/80">
                      Requires Administrator Confirmation
                    </span>
                  </div>

                  <div className="space-y-2">
                    {duplicates.map((dupe: any) => (
                      <div
                        key={dupe.id}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-cyan-400">
                              {dupe.original_complaint_id === complaint.id
                                ? dupe.duplicate_complaint_id
                                : dupe.original_complaint_id}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                              {dupe.similarity_score}% Match
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              Status: {dupe.status}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs mt-1 font-medium">
                            {dupe.matched_title}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-slate-400">
                            {dupe.match_reasons.map((r: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800">
                                • {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {dupe.status === 'suggested' ? (
                            <>
                              <button
                                onClick={() =>
                                  onManageDuplicate(
                                    dupe.original_complaint_id,
                                    dupe.duplicate_complaint_id,
                                    'confirmed'
                                  )
                                }
                                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[11px] transition-colors"
                              >
                                Confirm Duplicate
                              </button>
                              <button
                                onClick={() =>
                                  onManageDuplicate(
                                    dupe.original_complaint_id,
                                    dupe.duplicate_complaint_id,
                                    'rejected'
                                  )
                                }
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                              >
                                Mark Separate
                              </button>
                            </>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                              {dupe.status.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* AI Header Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/60 border border-cyan-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Automated Triage Analysis
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Priority Score: {complaint.priority_score} / 100 ({complaint.priority})
                  </h3>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 block mb-1">
                    Model: {complaint.ai_provider}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Confidence: {Math.round(complaint.ai_confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* AI Summary */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  AI Executive Summary
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {complaint.ai_summary}
                </p>
              </div>

              {/* AI Action Brief */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Tactical Action Brief for Officials
                </h4>
                <p className="text-cyan-100 text-sm leading-relaxed font-medium">
                  {complaint.ai_action_brief}
                </p>
              </div>

              {/* Explainable Priority Reasons */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Explainable Factor Scoring Breakdown
                </h4>
                <div className="space-y-2.5">
                  {complaint.priority_reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold border border-cyan-800">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Override Controls */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Authority Verification & Overrides
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Municipal officers can verify or override the AI-predicted category and priority if field conditions differ.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Verify / Change Category
                    </label>
                    <select
                      value={overrideCategory}
                      onChange={(e) => setOverrideCategory(e.target.value as ComplaintCategory)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                    >
                      <option value="Road Damage">Road Damage</option>
                      <option value="Waterlogging">Waterlogging</option>
                      <option value="Garbage">Garbage</option>
                      <option value="Streetlight">Streetlight</option>
                      <option value="Drainage">Drainage</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Public Safety">Public Safety</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Override Priority
                    </label>
                    <select
                      value={overridePriority}
                      onChange={(e) => setOverridePriority(e.target.value as PriorityLevel)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveOverrides}
                    disabled={isSavingOverride}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {isSavingOverride ? 'Saving...' : 'Apply Overrides'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'action' && (
            <div className="space-y-6">
              {/* Status Transition Form */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-cyan-400" />
                  Update Complaint Status
                </h3>
                <form onSubmit={handleStatusSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved (Remediation Complete)</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Authority Remark (Public on Citizen Portal)
                    </label>
                    <textarea
                      rows={2}
                      value={statusRemark}
                      onChange={(e) => setStatusRemark(e.target.value)}
                      placeholder="e.g. Field inspection completed. Repair crew dispatched with patching equipment."
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !statusRemark.trim()}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmitting ? 'Updating...' : 'Publish Status Update'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Department Assignment Form */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  Reassign Municipal Department & Officer
                </h3>
                <form onSubmit={handleAssignSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Department
                      </label>
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value as DepartmentName)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                      >
                        <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                        <option value="Water & Drainage">Water & Drainage</option>
                        <option value="Solid Waste Management">Solid Waste Management</option>
                        <option value="Electrical & Lighting">Electrical & Lighting</option>
                        <option value="Public Health & Safety">Public Health & Safety</option>
                        <option value="General Administration">General Administration</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Assigned Officer / Crew
                      </label>
                      <input
                        type="text"
                        value={assigneeName}
                        onChange={(e) => setAssigneeName(e.target.value)}
                        placeholder="e.g. Inspector R. Sharma"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Internal Directive Remark (Optional)
                    </label>
                    <input
                      type="text"
                      value={assignRemark}
                      onChange={(e) => setAssignRemark(e.target.value)}
                      placeholder="e.g. High priority SLA: rectify within 24 hours."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !assigneeName.trim()}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      {isSubmitting ? 'Assigning...' : 'Assign Work Order'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Official Lifecycle & Audit Trail
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {updates.map((update: any) => (
                  <div key={update.id} className="relative group">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-900"></span>
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-white flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(update.status)}`}>
                            {update.status}
                          </span>
                          <span className="text-slate-400 text-[11px]">by {update.actor_name}</span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {new Date(update.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed mt-1">
                        {update.remark}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
