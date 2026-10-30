import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Flame,
  ShieldAlert,
  Sparkles,
  Building2,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { AnalyticsSummary, Complaint } from '../types/civic';

interface OverviewViewProps {
  analytics: AnalyticsSummary | null;
  recentComplaints: Complaint[];
  onOpenComplaint: (complaint: Complaint) => void;
  onNavigate: (tab: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#f43f5e',
  High: '#f59e0b',
  Medium: '#3b82f6',
  Low: '#64748b',
};

const CATEGORY_COLORS = [
  '#06b6d4',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#64748b',
];

export const OverviewView: React.FC<OverviewViewProps> = ({
  analytics,
  recentComplaints,
  onOpenComplaint,
  onNavigate,
}) => {
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const criticalIssues = recentComplaints.filter((c) => c.priority === 'Critical' && c.status !== 'Resolved').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mission Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/80 border border-slate-800 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                AI TRIAGE DISPATCH
              </span>
              <span className="text-slate-400 text-xs">Municipal Operations Zone 01</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              CivicPulse Command Center
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Transforming scattered citizen complaints into prioritized, explainable, and trackable municipal actions with real-time AI intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('hotspots')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Inspect Hotspots</span>
            </button>
            <button
              onClick={() => onNavigate('citizen-portal')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <span>+ New Citizen Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Lodged</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {analytics.totalComplaints}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Citywide registry</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Action</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {analytics.pendingComplaints}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Submitted / Review</span>
        </div>

        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-bold">Critical Priority</span>
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {analytics.criticalComplaints}
          </div>
          <span className="text-[11px] text-rose-300/80 mt-1 block font-medium">Immediate hazard</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">In Progress</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {analytics.inProgressComplaints}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Field crew active</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {analytics.resolvedComplaints}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Remediated & closed</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Resolution Rate</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold">
              Target 80%
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {analytics.resolutionRate}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.resolutionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Urgent Critical Alerts Ticker */}
      {criticalIssues.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
                High Risk Civic Emergencies Requiring Urgent Dispatch
              </h2>
            </div>
            <button
              onClick={() => onNavigate('complaints')}
              className="text-xs text-rose-300 hover:text-white flex items-center gap-1 font-semibold"
            >
              <span>View All Alerts</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onOpenComplaint(issue)}
                className="p-3 rounded-lg bg-slate-900/90 border border-rose-900/60 hover:border-rose-600/80 cursor-pointer transition-all flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-rose-400">
                      {issue.id}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                      Score: {issue.priority_score}/100
                    </span>
                    <span className="text-slate-400 text-[10px] truncate max-w-[120px]">
                      {issue.category}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                    {issue.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{issue.location_address}</span>
                  </p>
                </div>
                <button className="px-2.5 py-1 rounded bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-[10px] shrink-0 mt-1 transition-colors">
                  Action
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Priority Distribution</h2>
              <p className="text-xs text-slate-400">AI triage score allocation</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono">Explainable AI</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.priorityBreakdown}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {analytics.priorityBreakdown.map((entry) => (
                    <Cell
                      key={entry.priority}
                      fill={PRIORITY_COLORS[entry.priority] || '#38bdf8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            {analytics.priorityBreakdown.map((item) => (
              <div key={item.priority} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PRIORITY_COLORS[item.priority] || '#64748b' }}
                  />
                  {item.priority}
                </span>
                <span className="font-mono font-bold text-white">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Complaints by Category */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Complaints by Civic Category</h2>
              <p className="text-xs text-slate-400">Real-time volume from SQLite registry</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {analytics.categoryBreakdown.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span>Primary Civic Strain: <strong className="text-cyan-400">{analytics.categoryBreakdown[0]?.category}</strong></span>
            <span>Total Categories: {analytics.categoryBreakdown.length}</span>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Recent Citizen Reports</h2>
            <p className="text-xs text-slate-400">Live feed processed through AI triage pipeline</p>
          </div>
          <button
            onClick={() => onNavigate('complaints')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All ({analytics.totalComplaints})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Title & Issue</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentComplaints.slice(0, 7).map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onOpenComplaint(c)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                    {c.id}
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <p className="font-semibold text-white group-hover:text-cyan-300 truncate">
                      {c.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {c.location_address}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {c.category}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.priority === 'Critical'
                          ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                          : c.priority === 'High'
                          ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                          : 'bg-blue-950/80 text-blue-400 border-blue-800'
                      }`}
                    >
                      {c.priority} ({c.priority_score})
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {c.department}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
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
                  <td className="py-3 px-3 text-right">
                    <button className="px-2.5 py-1 rounded bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 text-[11px] font-bold transition-all">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
