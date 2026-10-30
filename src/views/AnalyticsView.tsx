import React from 'react';
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
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Flame,
} from 'lucide-react';
import { AnalyticsSummary } from '../types/civic';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
}

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

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#f43f5e',
  High: '#f59e0b',
  Medium: '#3b82f6',
  Low: '#64748b',
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            MUNICIPAL DATA INTELLIGENCE
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
          Civic Analytics & Resolution Benchmarks
        </h1>
        <p className="text-xs text-slate-400">
          Computed live from SQLite database tables for evidence-based resource allocation.
        </p>
      </div>

      {/* High-level Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Gross Resolution Rate</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {analytics.resolutionRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {analytics.resolvedComplaints} of {analytics.totalComplaints} closed
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Avg Turnaround Time</span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            {analytics.avgResolutionHours} hrs
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            SLA Target &lt; 24 hrs
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Emergency Backlog</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {analytics.criticalComplaints}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Critical priority items
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Active Pipeline</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {analytics.pendingComplaints + analytics.inProgressComplaints}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Under active field workflow
          </span>
        </div>
      </div>

      {/* Row 1: Weekly Incident Velocity & Resolution vs Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Area Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Daily Incident Inflow vs Resolution</h2>
              <p className="text-xs text-slate-400">Weekly operational velocity</p>
            </div>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="submitted" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSub)" name="Submitted" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorRes)" name="Resolved" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area-wise distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Area-Wise Incident Concentration</h2>
              <p className="text-xs text-slate-400">Spatial load across municipal sectors</p>
            </div>
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.areaBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="area" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#3b82f6" name="Total Issues" radius={[4, 4, 0, 0]} />
                <Bar dataKey="critical" fill="#f43f5e" name="Critical Emergencies" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Top Recurring Problems & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recurring Problems Table */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              Top Recurring Civic Problem Types
            </h2>
            <p className="text-xs text-slate-400">Identified through multi-report recurrence clustering</p>
          </div>

          <div className="space-y-3">
            {analytics.topRecurringIssues.map((item, idx) => (
              <div
                key={item.category}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-xs">{item.category}</h3>
                    <p className="text-[11px] text-slate-400">
                      Average AI Priority Score: <strong className="text-cyan-400">{item.avgPriority}/100</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-mono font-black text-white">{item.count}</span>
                  <span className="text-[10px] text-slate-400 block">Incidents</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown Pie Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Priority Distribution Matrix</h2>
              <p className="text-xs text-slate-400">Calculated from AI explainable weights</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Total {analytics.totalComplaints}</span>
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

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
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
      </div>
    </div>
  );
};
