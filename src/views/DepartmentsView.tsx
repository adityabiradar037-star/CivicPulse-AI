import React, { useState } from 'react';
import {
  Building2,
  Users2,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  AlertCircle,
  Shield,
  Layers,
} from 'lucide-react';
import { Complaint, DepartmentName, PriorityLevel } from '../types/civic';

interface DepartmentsViewProps {
  complaints: Complaint[];
  onOpenComplaint: (complaint: Complaint) => void;
  onAssign: (id: string, department: DepartmentName, assignedTo: string, remark?: string) => Promise<void>;
}

const DEPARTMENTS: Array<{
  name: DepartmentName;
  description: string;
  defaultLead: string;
  color: string;
}> = [
  {
    name: 'Roads & Infrastructure',
    description: 'Potholes, sinkholes, road caving, footpath damage, and speed breaker repairs.',
    defaultLead: 'Eng. Vikram Saxena',
    color: '#f59e0b',
  },
  {
    name: 'Water & Drainage',
    description: 'Underpass waterlogging, drainage clogs, pipeline bursts, and manhole safety.',
    defaultLead: 'Eng. Ritu Verma',
    color: '#06b6d4',
  },
  {
    name: 'Solid Waste Management',
    description: 'Dump overflow, missed trash collection, toxic dumping, and street cleanliness.',
    defaultLead: 'Officer K. Rao',
    color: '#10b981',
  },
  {
    name: 'Electrical & Lighting',
    description: 'Broken streetlights, dangling live wires, non-functional high-mast fixtures.',
    defaultLead: 'Technician P. Joshi',
    color: '#8b5cf6',
  },
  {
    name: 'Public Health & Safety',
    description: 'Hazardous chemical runoff, burning garbage, structural collapses, emergency safety.',
    defaultLead: 'Inspector S. Gill',
    color: '#f43f5e',
  },
  {
    name: 'General Administration',
    description: 'Civic amenities, parks, inter-departmental jurisdiction and citizen disputes.',
    defaultLead: 'Admin Officer D. Sharma',
    color: '#64748b',
  },
];

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  complaints,
  onOpenComplaint,
  onAssign,
}) => {
  const [selectedDept, setSelectedDept] = useState<DepartmentName>('Roads & Infrastructure');
  const [quickAssignOfficer, setQuickAssignOfficer] = useState('');
  const [quickAssignComplaintId, setQuickAssignComplaintId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');

  // Department statistics
  const deptStats = DEPARTMENTS.map((dept) => {
    const list = complaints.filter((c) => c.department === dept.name);
    const pending = list.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected').length;
    const critical = list.filter((c) => c.priority === 'Critical' && c.status !== 'Resolved').length;
    const resolved = list.filter((c) => c.status === 'Resolved').length;
    const total = list.length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return {
      ...dept,
      total,
      pending,
      critical,
      resolved,
      rate,
      complaints: list,
    };
  });

  const currentDeptData = deptStats.find((d) => d.name === selectedDept) || deptStats[0];

  const handleQuickAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAssignComplaintId || !quickAssignOfficer.trim()) return;

    setIsAssigning(true);
    try {
      await onAssign(
        quickAssignComplaintId,
        selectedDept,
        quickAssignOfficer,
        `Reassigned via Department Workload Board to ${quickAssignOfficer}`
      );
      setAssignSuccess(`Complaint ${quickAssignComplaintId} assigned to ${quickAssignOfficer}`);
      setQuickAssignComplaintId('');
      setQuickAssignOfficer('');
      setTimeout(() => setAssignSuccess(''), 3000);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Departmental Assignments & Workload Balancing
        </h1>
        <p className="text-xs text-slate-400">
          Monitor operational caseloads, pending work orders, and field crew deployments across municipal wings.
        </p>
      </div>

      {assignSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{assignSuccess}</span>
        </div>
      )}

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deptStats.map((dept) => {
          const isSelected = selectedDept === dept.name;
          return (
            <div
              key={dept.name}
              onClick={() => setSelectedDept(dept.name)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: dept.color }}
                  />
                  <h3 className="text-sm font-bold text-white truncate max-w-[180px]">
                    {dept.name}
                  </h3>
                </div>
                {dept.critical > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold animate-pulse">
                    {dept.critical} Critical
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                {dept.description}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Pending</span>
                  <span className="text-sm font-bold text-amber-400">{dept.pending}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Resolved</span>
                  <span className="text-sm font-bold text-emerald-400">{dept.resolved}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Rate</span>
                  <span className="text-sm font-bold text-white">{dept.rate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Department Details & Assigned Roster */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Department Docket
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {currentDeptData.name} ({currentDeptData.complaints.length} Total Records)
            </h2>
            <p className="text-xs text-slate-400">
              Department Superintendent: <strong className="text-slate-200">{currentDeptData.defaultLead}</strong>
            </p>
          </div>

          {/* Quick Assign Form */}
          <form
            onSubmit={handleQuickAssign}
            className="flex flex-wrap items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs"
          >
            <span className="font-semibold text-slate-300">Quick Assign:</span>
            <select
              value={quickAssignComplaintId}
              onChange={(e) => setQuickAssignComplaintId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden"
              required
            >
              <option value="">Select Unassigned ID</option>
              {currentDeptData.complaints
                .filter((c) => !c.assigned_to && c.status !== 'Resolved')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.title.slice(0, 30)}...
                  </option>
                ))}
            </select>

            <input
              type="text"
              value={quickAssignOfficer}
              onChange={(e) => setQuickAssignOfficer(e.target.value)}
              placeholder="Officer / Crew Lead"
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden"
              required
            />

            <button
              type="submit"
              disabled={isAssigning || !quickAssignComplaintId}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-colors"
            >
              {isAssigning ? 'Assigning...' : 'Assign'}
            </button>
          </form>
        </div>

        {/* Complaints in this Department */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Complaint ID</th>
                <th className="py-2.5 px-3">Issue Title</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Assigned Personnel</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentDeptData.complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No complaints assigned to this department.
                  </td>
                </tr>
              ) : (
                currentDeptData.complaints.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onOpenComplaint(c)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                      {c.id}
                    </td>
                    <td className="py-3 px-3 max-w-xs font-semibold text-white group-hover:text-cyan-300 truncate">
                      {c.title}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.priority === 'Critical'
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : c.priority === 'High'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-blue-950 text-blue-400 border-blue-800'
                        }`}
                      >
                        {c.priority} ({c.priority_score})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {c.assigned_to || (
                        <span className="text-amber-400 italic">Unassigned (In Queue)</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : c.status === 'In Progress'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-[150px]">
                      {c.location_address}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="px-2.5 py-1 rounded bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 text-[11px] font-bold transition-all">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
