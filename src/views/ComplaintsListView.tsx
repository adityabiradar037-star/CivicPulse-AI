import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpDown,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  DepartmentName,
  PriorityLevel,
} from '../types/civic';

interface ComplaintsListViewProps {
  complaints: Complaint[];
  onOpenComplaint: (complaint: Complaint) => void;
  onRefresh: () => void;
}

export const ComplaintsListView: React.FC<ComplaintsListViewProps> = ({
  complaints,
  onOpenComplaint,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter complaints in memory
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        !searchTerm ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.citizen_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchPriority = selectedPriority === 'All' || c.priority === selectedPriority;
      const matchStatus = selectedStatus === 'All' || c.status === selectedStatus;
      const matchDept = selectedDept === 'All' || c.department === selectedDept;

      return matchSearch && matchCategory && matchPriority && matchStatus && matchDept;
    }).sort((a, b) => {
      if (sortBy === 'priority' || sortBy === 'score') {
        const diff = a.priority_score - b.priority_score;
        return sortOrder === 'asc' ? diff : -diff;
      }
      // date
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }, [complaints, searchTerm, selectedCategory, selectedPriority, selectedStatus, selectedDept, sortBy, sortOrder]);

  const handleExportCSV = () => {
    const headers = [
      'Complaint ID',
      'Title',
      'Category',
      'Priority',
      'Priority Score',
      'Status',
      'Department',
      'Assigned Officer',
      'Address',
      'Citizen Name',
      'Created At',
    ];

    const rows = filteredComplaints.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.priority_score,
      c.status,
      `"${c.department}"`,
      `"${c.assigned_to || 'Unassigned'}"`,
      `"${c.location_address.replace(/"/g, '""')}"`,
      `"${c.citizen_name}"`,
      c.created_at,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicPulse_Complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadge = (p: PriorityLevel, score: number) => {
    switch (p) {
      case 'Critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            Critical ({score})
          </span>
        );
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
            High ({score})
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-400 border border-blue-800">
            Medium ({score})
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Low ({score})
          </span>
        );
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'In Progress':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'Assigned':
        return 'bg-blue-950/80 text-blue-400 border-blue-800';
      case 'Under Review':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'Rejected':
        return 'bg-red-950/80 text-red-400 border-red-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Municipal Complaints Master Ledger
          </h1>
          <p className="text-xs text-slate-400">
            Real-time database of citizen reports, AI triage outputs, and operational statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, keyword, citizen name, address..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:border-slate-700"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>{sortOrder === 'desc' ? 'Newest / Highest' : 'Oldest / Lowest'}</span>
            </button>
          </div>
        </div>

        {/* Multi-dropdown filter row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
            >
              <option value="All">All Categories</option>
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
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical (85-100)</option>
              <option value="High">High (65-84)</option>
              <option value="Medium">Medium (40-64)</option>
              <option value="Low">Low (&lt;40)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
            >
              <option value="All">All Departments</option>
              <option value="Roads & Infrastructure">Roads & Infrastructure</option>
              <option value="Water & Drainage">Water & Drainage</option>
              <option value="Solid Waste Management">Solid Waste Management</option>
              <option value="Electrical & Lighting">Electrical & Lighting</option>
              <option value="Public Health & Safety">Public Health & Safety</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <span>Showing <strong className="text-white">{filteredComplaints.length}</strong> of {complaints.length} complaints</span>
          {(searchTerm || selectedCategory !== 'All' || selectedPriority !== 'All' || selectedStatus !== 'All' || selectedDept !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedPriority('All');
                setSelectedStatus('All');
                setSelectedDept('All');
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Complaints Datagrid */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Subject & Location</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority (AI Score)</th>
                <th className="py-3 px-4">Department / Assignee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No complaints matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onOpenComplaint(c)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {c.id}
                      {c.is_duplicate && (
                        <span className="block text-[9px] font-semibold text-amber-400 mt-0.5">
                          Duplicate Tag
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {c.title}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span className="truncate">{c.location_address}</span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {c.category}
                    </td>

                    <td className="py-3.5 px-4">
                      {getPriorityBadge(c.priority, c.priority_score)}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-200 font-medium">{c.department}</p>
                      <p className="text-[10px] text-slate-400">
                        {c.assigned_to || 'Unassigned'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                      {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button className="px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 text-xs font-bold transition-all shadow-sm">
                        Inspect
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
