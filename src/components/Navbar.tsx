import React, { useEffect, useState } from 'react';
import {
  Activity,
  Sparkles,
  Search,
  PlusCircle,
  Menu,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenQuickTrack: () => void;
  onOpenSubmit: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenQuickTrack,
  onOpenSubmit,
  onToggleSidebar,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<{
    model: string;
    geminiConfigured: boolean;
    activeProvider: string;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => setAiStatus(data))
      .catch(() => {
        setAiStatus({
          model: 'gemini-3.8-flash',
          geminiConfigured: false,
          activeProvider: 'rule-engine-fallback',
        });
      });
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => onNavigate('overview')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-['Plus_Jakarta_Sans']">
                CivicPulse <span className="text-cyan-400">AI</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                GovTech v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              From Complaints to Action
            </p>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* AI Engine Status Pill */}
        <div
          onClick={() => onNavigate('ai-intelligence')}
          className="cursor-pointer hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
          title="Click to view AI Intelligence Hub"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400 font-mono text-[11px]">AI Model:</span>
          <span className="font-semibold text-cyan-300 font-mono text-[11px]">
            {aiStatus?.activeProvider === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Hybrid Rule Engine'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
        </div>

        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400 px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span>{currentTime || '12:00:00'}</span>
        </div>

        {/* Citizen Quick Track CTA */}
        <button
          onClick={onOpenQuickTrack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Track Complaint</span>
          <span className="sm:hidden">Track</span>
        </button>

        {/* File Report CTA */}
        <button
          onClick={onOpenSubmit}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Report Civic Issue</span>
          <span className="sm:hidden">Report</span>
        </button>
      </div>
    </header>
  );
};
