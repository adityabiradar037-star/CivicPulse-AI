import React, { useState } from 'react';
import {
  Settings,
  HelpCircle,
  Database,
  Sparkles,
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  FileText,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';

interface SettingsAboutViewProps {
  onDatabaseReset: () => void;
  onNavigate: (tab: string) => void;
}

export const SettingsAboutView: React.FC<SettingsAboutViewProps> = ({
  onDatabaseReset,
  onNavigate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'architecture' | 'api' | 'db'>('script');
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleResetData = async () => {
    if (!window.confirm('Reset database to clean initial state with 52 synthetic civic complaints?')) return;
    setIsResetting(true);
    setResetMessage('');
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setResetMessage('Database re-seeded successfully with 52 synthetic complaints.');
        onDatabaseReset();
        setTimeout(() => setResetMessage(''), 4000);
      }
    } catch (err) {
      setResetMessage('Error resetting database.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              PLATFORM SPECIFICATION & DEMO PLAYBOOK
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Settings, Architecture & Hackathon Demo Guide
          </h1>
          <p className="text-xs text-slate-400">
            System internals, API reference, and the complete 5-minute judge demonstration script.
          </p>
        </div>

        <button
          onClick={handleResetData}
          disabled={isResetting}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-200 hover:text-rose-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Reseeding...' : 'Reset & Reseed Demo Data (52 Records)'}</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900 px-4 rounded-xl">
        <button
          onClick={() => setActiveSubTab('script')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'script'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-cyan-400" />
          5-Minute Hackathon Demo Script
        </button>
        <button
          onClick={() => setActiveSubTab('architecture')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'architecture'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          System Architecture & AI Design
        </button>
        <button
          onClick={() => setActiveSubTab('api')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'api'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          REST APIs & Integration
        </button>
        <button
          onClick={() => setActiveSubTab('db')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'db'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          Database Schema & Synthetic Dataset
        </button>
      </div>

      {/* Subtab Contents */}
      {activeSubTab === 'script' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs leading-relaxed">
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 space-y-1">
            <h2 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Live 5-Minute Hackathon Judging Walkthrough
            </h2>
            <p className="text-slate-300">
              Follow these sequential steps during your presentation to demonstrate the complete full-stack civic feedback loop.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-mono text-xs">
                  1
                </span>
                <span>The Problem & Overview Dashboard (Minute 0:00 - 1:00)</span>
              </div>
              <p className="text-slate-300">
                • Start on the <strong>Overview Dashboard</strong>. Point out the live telemetry: 52 lodged complaints, resolution percentage, urgent critical emergencies ticker, and priority allocation.
              </p>
              <p className="text-slate-400">
                <em>Script line:</em> "Municipalities struggle with flood of unorganized citizen messages. CivicPulse AI turns noisy complaints into prioritized, explainable, and trackable municipal actions."
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-mono text-xs">
                  2
                </span>
                <span>Citizen Reporting & Instant AI Triage (Minute 1:00 - 2:00)</span>
              </div>
              <p className="text-slate-300">
                • Navigate to <strong>Citizen Portal</strong>. Click the preset: <em>"🌊 Severe Waterlogging (Main Road)"</em>.
              </p>
              <p className="text-slate-300">
                • Note the auto-filled description, photo evidence, and interactive OpenStreetMap pin.
              </p>
              <p className="text-slate-300">
                • Click <strong>"Submit & Run AI Intelligence"</strong>. Watch the modal generate a unique Complaint ID (e.g. <code>CP-2026-XXXX</code>) and immediate priority score!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-mono text-xs">
                  3
                </span>
                <span>Explainable AI & Duplicate Detection Hub (Minute 2:00 - 3:00)</span>
              </div>
              <p className="text-slate-300">
                • Navigate to <strong>AI Intelligence Hub</strong>.
              </p>
              <p className="text-slate-300">
                • Show the <strong>Duplicate Complaints Verification Queue</strong>: display how the newly filed report or <code>CP-2026-1002</code> is flagged as a 91% duplicate of <code>CP-2026-1001</code> based on Haversine distance (&lt;60m) and text similarity.
              </p>
              <p className="text-slate-300">
                • Click <strong>"Confirm Duplicate"</strong> or <strong>"Reject / Keep Separate"</strong> to demonstrate administrator authority in the loop.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-mono text-xs">
                  4
                </span>
                <span>Geographic Hotspots & Tactical Remediation (Minute 3:00 - 4:00)</span>
              </div>
              <p className="text-slate-300">
                • Navigate to <strong>Geographic Hotspots</strong>. Show the interactive Leaflet map with pulsing red markers.
              </p>
              <p className="text-slate-300">
                • Click on the <strong>"Sector 12 Corridor"</strong> hotspot. Highlight the AI-generated area-level diagnostic insight explaining the hydraulic trunk drainage bottleneck.
              </p>
              <p className="text-slate-300">
                • Open complaint <code>CP-2026-1001</code>. Under <em>"Authority Actions"</em>, assign it to Officer R. Verma, change status from <em>"Assigned"</em> to <em>"In Progress"</em> and then <em>"Resolved"</em> with a remark!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-mono text-xs">
                  5
                </span>
                <span>Citizen Tracking & Transparency (Minute 4:00 - 5:00)</span>
              </div>
              <p className="text-slate-300">
                • Navigate to <strong>Citizen Tracking Portal</strong>. Enter the complaint ID or click <code>CP-2026-1001</code>.
              </p>
              <p className="text-slate-300">
                • Show the citizen the animated 5-step lifecycle stepper advancing to <strong>"Resolved"</strong>, complete with the timestamped authority remarks!
              </p>
              <p className="text-slate-400">
                <em>Conclusion line:</em> "CivicPulse AI closes the loop between citizens and governance—from scattered complaints to accountable, transparent civic action."
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'architecture' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs text-slate-300 leading-relaxed">
          <h2 className="text-sm font-bold text-white">Full-Stack System Architecture</h2>
          <div className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800">
            [Citizen Browser / Authority Dashboard]
                   │
                   ▼ (Vite + React 19 + Tailwind CSS)
            [Node.js + Express REST API Server]
                   │
         ┌─────────┴──────────────────────┐
         ▼                                ▼
    [SQLite (better-sqlite3)]    [Hybrid AI Intelligence Engine]
    - complaints                 ├── Google Gemini 3.8 Flash (LLM)
    - complaint_updates          ├── Rule-Based Explainable Scorer (0-100)
    - duplicate_relationships    ├── Stemmed Jaccard Text Matcher
                                 └── Haversine Geospatial Clustering
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Zero-Key Fallback Reliability
            </h3>
            <p>
              If <code>GEMINI_API_KEY</code> is missing, exhausted, or offline, CivicPulse AI automatically engages its deterministic rule scoring engine. Every priority score (0-100), category inference, and action brief continues to calculate with full explainability.
            </p>
          </div>
        </div>
      )}

      {activeSubTab === 'api' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white">REST API Specification</h2>
          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-emerald-400 font-bold">POST /api/complaints</span>
              <span className="text-slate-400">Lodges complaint, triggers AI pipeline</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-blue-400 font-bold">GET /api/complaints</span>
              <span className="text-slate-400">Filterable master ledger (category, priority, status)</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-blue-400 font-bold">GET /api/complaints/:id</span>
              <span className="text-slate-400">Full record with updates history & duplicates</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-cyan-400 font-bold">GET /api/complaints/:id/track</span>
              <span className="text-slate-400">Public citizen status & remarks timeline</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-amber-400 font-bold">PATCH /api/complaints/:id/status</span>
              <span className="text-slate-400">Transitions status & records authority remark</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-amber-400 font-bold">POST /api/complaints/:id/assign</span>
              <span className="text-slate-400">Routes complaint to department and officer</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-purple-400 font-bold">POST /api/complaints/:id/duplicate</span>
              <span className="text-slate-400">Confirms or rejects duplicate link</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-blue-400 font-bold">GET /api/hotspots</span>
              <span className="text-slate-400">Returns spatial clusters with AI diagnostics</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-blue-400 font-bold">GET /api/analytics</span>
              <span className="text-slate-400">Real-time aggregations from SQLite</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-rose-400 font-bold">POST /api/seed/reset</span>
              <span className="text-slate-400">Reseeds 52 realistic synthetic records</span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'db' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
          <h2 className="text-sm font-bold text-white">Database Schema & Synthetic Dataset</h2>
          <p>
            The backend uses <strong>SQLite</strong> with WAL (Write-Ahead-Logging) mode. The database automatically initializes and populates 52 realistic synthetic complaints across 4 major spatial clusters in Metro Demo City:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            <li><strong>Cluster 1 (Main Road & Sector 12):</strong> Severe waterlogging, blocked storm drains, open manholes.</li>
            <li><strong>Cluster 2 (Market Square):</strong> Garbage dump overflow, dangling live wires, broken streetlights.</li>
            <li><strong>Cluster 3 (North Industrial Highway 9):</strong> Road subsidence, deep sinkholes, heavy vehicle hazards.</li>
            <li><strong>Cluster 4 (Green Valley Residential):</strong> 12-inch drinking water trunk line burst, water contamination.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
