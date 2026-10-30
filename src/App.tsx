import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ComplaintDetailsModal } from './components/ComplaintDetailsModal';
import { OverviewView } from './views/OverviewView';
import { CitizenPortalView } from './views/CitizenPortalView';
import { ComplaintsListView } from './views/ComplaintsListView';
import { AiIntelligenceView } from './views/AiIntelligenceView';
import { HotspotsView } from './views/HotspotsView';
import { DepartmentsView } from './views/DepartmentsView';
import { AnalyticsView } from './views/AnalyticsView';
import { CitizenTrackingView } from './views/CitizenTrackingView';
import { SettingsAboutView } from './views/SettingsAboutView';
import {
  Complaint,
  AnalyticsSummary,
  ComplaintStatus,
  DepartmentName,
} from './types/civic';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [modalUpdates, setModalUpdates] = useState<any[]>([]);
  const [modalDuplicates, setModalDuplicates] = useState<any[]>([]);
  const [initialTrackingId, setInitialTrackingId] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch all complaints
  const fetchComplaints = useCallback(async () => {
    try {
      const res = await fetch('/api/complaints?limit=150');
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  }, []);

  // Fetch analytics summary
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchComplaints();
    fetchAnalytics();
  }, [fetchComplaints, fetchAnalytics]);

  // Open single complaint in modal
  const handleOpenComplaint = async (complaint: Complaint) => {
    try {
      const res = await fetch(`/api/complaints/${complaint.id}`);
      const data = await res.json();
      if (data.complaint) {
        setSelectedComplaint(data.complaint);
        setModalUpdates(data.updates || []);
        setModalDuplicates(data.duplicates || []);
      } else {
        setSelectedComplaint(complaint);
        setModalUpdates([]);
        setModalDuplicates([]);
      }
    } catch (err) {
      setSelectedComplaint(complaint);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (
    id: string,
    status: ComplaintStatus,
    remark: string
  ) => {
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remark, actor_name: 'Duty Municipal Officer' }),
      });
      const data = await res.json();
      if (res.ok && data.complaint) {
        showNotification(`Complaint ${id} status moved to ${status}`);
        fetchComplaints();
        fetchAnalytics();
        // Refresh modal data
        handleOpenComplaint(data.complaint);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle assignment
  const handleAssign = async (
    id: string,
    department: DepartmentName,
    assignedTo: string,
    remark?: string
  ) => {
    try {
      const res = await fetch(`/api/complaints/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department,
          assigned_to: assignedTo,
          remark,
          actor_name: 'Operations Dispatcher',
        }),
      });
      const data = await res.json();
      if (res.ok && data.complaint) {
        showNotification(`Complaint ${id} assigned to ${assignedTo} (${department})`);
        fetchComplaints();
        fetchAnalytics();
        handleOpenComplaint(data.complaint);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle manual details update (e.g. override category or priority)
  const handleUpdateDetails = async (id: string, updates: Partial<Complaint>) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.complaint) {
        showNotification(`Complaint ${id} updated successfully`);
        fetchComplaints();
        fetchAnalytics();
        handleOpenComplaint(data.complaint);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle duplicate confirmation or rejection
  const handleManageDuplicate = async (
    originalId: string,
    duplicateId: string,
    status: 'confirmed' | 'rejected'
  ) => {
    try {
      const res = await fetch(`/api/complaints/${originalId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duplicate_id: duplicateId, status }),
      });
      if (res.ok) {
        showNotification(`Duplicate link marked as ${status.toUpperCase()}`);
        fetchComplaints();
        fetchAnalytics();
        if (selectedComplaint) {
          handleOpenComplaint(selectedComplaint);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      {/* Top Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-cyan-950/90 text-cyan-200 border border-cyan-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onOpenQuickTrack={() => setCurrentTab('tracking')}
        onOpenSubmit={() => setCurrentTab('citizen-portal')}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* App Shell: Sidebar + Content */}
      <div className="flex flex-1">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          pendingCount={analytics?.pendingComplaints || 0}
          criticalCount={analytics?.criticalComplaints || 0}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {currentTab === 'overview' && (
            <OverviewView
              analytics={analytics}
              recentComplaints={complaints}
              onOpenComplaint={handleOpenComplaint}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'citizen-portal' && (
            <CitizenPortalView
              onSubmitSuccess={(newComplaint) => {
                showNotification(`Complaint ${newComplaint.id} submitted!`);
                fetchComplaints();
                fetchAnalytics();
              }}
              onNavigateToTracking={(id) => {
                setInitialTrackingId(id);
                setCurrentTab('tracking');
              }}
            />
          )}

          {currentTab === 'complaints' && (
            <ComplaintsListView
              complaints={complaints}
              onOpenComplaint={handleOpenComplaint}
              onRefresh={() => {
                fetchComplaints();
                fetchAnalytics();
              }}
            />
          )}

          {currentTab === 'ai-intelligence' && (
            <AiIntelligenceView
              complaints={complaints}
              onOpenComplaint={handleOpenComplaint}
              onRefresh={() => {
                fetchComplaints();
                fetchAnalytics();
              }}
            />
          )}

          {currentTab === 'hotspots' && (
            <HotspotsView
              complaints={complaints}
              onOpenComplaint={handleOpenComplaint}
            />
          )}

          {currentTab === 'departments' && (
            <DepartmentsView
              complaints={complaints}
              onOpenComplaint={handleOpenComplaint}
              onAssign={handleAssign}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView analytics={analytics} />
          )}

          {currentTab === 'tracking' && (
            <CitizenTrackingView
              initialComplaintId={initialTrackingId}
              onClearInitialId={() => setInitialTrackingId('')}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsAboutView
              onDatabaseReset={() => {
                fetchComplaints();
                fetchAnalytics();
                showNotification('Database reseeded with 52 records');
              }}
              onNavigate={setCurrentTab}
            />
          )}
        </main>
      </div>

      {/* Complaint Inspection & Action Modal */}
      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          updates={modalUpdates}
          duplicates={modalDuplicates}
          onClose={() => setSelectedComplaint(null)}
          onUpdateStatus={handleUpdateStatus}
          onAssign={handleAssign}
          onUpdateDetails={handleUpdateDetails}
          onManageDuplicate={handleManageDuplicate}
        />
      )}
    </div>
  );
}
