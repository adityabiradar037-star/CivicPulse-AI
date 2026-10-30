import React from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Sparkles,
  MapPin,
  BarChart3,
  Users2,
  Search,
  Settings,
  HelpCircle,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  pendingCount?: number;
  criticalCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  pendingCount = 0,
  criticalCount = 0,
}) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'citizen-portal',
      label: 'Citizen Complaint Portal',
      icon: FilePlus2,
      badge: 'Public',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    },
    {
      id: 'complaints',
      label: 'All Complaints',
      icon: FileText,
      badge: pendingCount > 0 ? `${pendingCount}` : null,
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-800',
    },
    {
      id: 'ai-intelligence',
      label: 'AI Intelligence Hub',
      icon: Sparkles,
      badge: 'AI Core',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    },
    {
      id: 'hotspots',
      label: 'Geographic Hotspots',
      icon: MapPin,
      badge: criticalCount > 0 ? `${criticalCount} Alert` : null,
      badgeColor: 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse',
    },
    {
      id: 'departments',
      label: 'Department Assignments',
      icon: Users2,
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'tracking',
      label: 'Citizen Tracking Portal',
      icon: Search,
      badge: 'Public',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'settings',
      label: 'Settings & About',
      icon: Settings,
      badge: 'Demo Script',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-20 h-screen md:h-[calc(100vh-4rem)] w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Mobile brand header inside drawer */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 md:hidden">
            <span className="font-bold text-white text-base">CivicPulse AI Menu</span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 text-sm font-mono"
            >
              ✕
            </button>
          </div>

          <div className="px-2 mb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 font-mono">
            Navigation Modules
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-300 font-semibold border border-cyan-800/60 shadow-sm shadow-cyan-900/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom system footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Demo Municipal Zone
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Connected to SQLite Local Storage with 52 synthetic records.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
