import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Flame,
  AlertTriangle,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { Complaint, Hotspot, PriorityLevel } from '../types/civic';

interface HotspotsViewProps {
  complaints: Complaint[];
  onOpenComplaint: (complaint: Complaint) => void;
}

export const HotspotsView: React.FC<HotspotsViewProps> = ({
  complaints,
  onOpenComplaint,
}) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const circlesLayerRef = useRef<any>(null);

  // Fetch detected hotspots from backend algorithm
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/hotspots')
      .then((res) => res.json())
      .then((data) => {
        setHotspots(data.hotspots || []);
        if (data.hotspots?.length > 0) {
          setSelectedHotspot(data.hotspots[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !mapContainerRef.current) return;

        // Center on Metro Demo City (approx lat 28.6200, lng 77.2150)
        const map = L.map(mapContainerRef.current).setView([28.6250, 77.2150], 12);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        circlesLayerRef.current = L.layerGroup().addTo(map);
      } catch (err) {
        console.warn('Map initialization error:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Markers and Hotspot Circles on Map
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current || !circlesLayerRef.current) return;
      const L = (await import('leaflet')).default;

      markersLayerRef.current.clearLayers();
      circlesLayerRef.current.clearLayers();

      // Draw Hotspot circular zones
      hotspots.forEach((hs) => {
        const isSelected = selectedHotspot?.id === hs.id;
        const color =
          hs.risk_level === 'Critical'
            ? '#f43f5e'
            : hs.risk_level === 'High'
            ? '#f59e0b'
            : '#38bdf8';

        const circle = L.circle([hs.latitude, hs.longitude], {
          color: isSelected ? '#ffffff' : color,
          weight: isSelected ? 3 : 2,
          fillColor: color,
          fillOpacity: isSelected ? 0.28 : 0.15,
          radius: hs.radius_meters || 380,
        }).addTo(circlesLayerRef.current);

        circle.on('click', () => {
          setSelectedHotspot(hs);
          mapInstanceRef.current.panTo([hs.latitude, hs.longitude]);
        });
      });

      // Filter complaints to show
      const visibleComplaints = complaints.filter((c) => {
        const matchCat = filterCategory === 'All' || c.category === filterCategory;
        const matchPrio = filterPriority === 'All' || c.priority === filterPriority;
        return matchCat && matchPrio;
      });

      // Render Individual Complaint Markers
      visibleComplaints.forEach((c) => {
        let pinColor = '#3b82f6'; // default medium blue
        let pingClass = '';
        if (c.status === 'Resolved') {
          pinColor = '#10b981'; // emerald
        } else if (c.priority === 'Critical') {
          pinColor = '#f43f5e'; // red
          pingClass = 'animate-ping';
        } else if (c.priority === 'High') {
          pinColor = '#f59e0b'; // amber
        }

        const iconHtml = `
          <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
            ${
              c.priority === 'Critical' && c.status !== 'Resolved'
                ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${pinColor}; opacity: 0.6;" class="${pingClass}"></span>`
                : ''
            }
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${pinColor}; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.6);"></div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'complaint-pin',
          html: iconHtml,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([c.latitude, c.longitude], { icon }).addTo(
          markersLayerRef.current
        );

        const popupContent = `
          <div style="font-family: sans-serif; color: #0f172a; min-width: 180px; padding: 2px;">
            <div style="font-size: 10px; font-weight: bold; color: ${pinColor}; text-transform: uppercase;">
              ${c.id} • ${c.priority} (${c.priority_score})
            </div>
            <div style="font-size: 12px; font-weight: bold; margin-top: 2px; line-height: 1.2;">
              ${c.title}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
              📍 ${c.location_address}
            </div>
            <div style="font-size: 10px; color: #0284c7; margin-top: 4px; font-weight: 600;">
              Status: ${c.status}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          // Open details on click if popup already open or double click
        });
      });
    }

    updateMarkers();
  }, [complaints, hotspots, selectedHotspot, filterCategory, filterPriority]);

  const handleSelectHotspot = (hs: Hotspot) => {
    setSelectedHotspot(hs);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([hs.latitude, hs.longitude], 14, { duration: 1 });
    }
  };

  const relatedComplaints = selectedHotspot
    ? complaints.filter((c) => selectedHotspot.complaint_ids.includes(c.id))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              SPATIAL CLUSTERING & HOTSPOT DIAGNOSTICS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Geographic Intelligence & Recurring Clusters
          </h1>
          <p className="text-xs text-slate-400">
            Automated cluster grouping identifies multi-incident municipal hotspots with AI area diagnostics.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 font-medium">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            Critical
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            High
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Medium
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Resolved
          </span>
        </div>
      </div>

      {/* Main Map + Hotspots Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col h-[580px]">
          {/* Map Controls Toolbar */}
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-semibold">Filter Pins:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white text-[11px] focus:outline-hidden"
              >
                <option value="All">All Categories</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Waterlogging">Waterlogging</option>
                <option value="Garbage">Garbage</option>
                <option value="Streetlight">Streetlight</option>
                <option value="Drainage">Drainage</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Public Safety">Public Safety</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white text-[11px] focus:outline-hidden"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Click any circle or pin to inspect
            </span>
          </div>

          {/* Leaflet Canvas Element */}
          <div ref={mapContainerRef} className="flex-1 w-full bg-slate-950 z-10" />
        </div>

        {/* Hotspots List & Selected AI Area Insight */}
        <div className="space-y-4 flex flex-col h-[580px]">
          {/* Hotspots scroll list */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                Detected Civic Hotspots ({hotspots.length})
              </h2>
              <span className="text-[10px] font-mono text-cyan-400">Radius ~350m</span>
            </div>

            <div className="space-y-2">
              {hotspots.map((hs) => {
                const isSelected = selectedHotspot?.id === hs.id;
                return (
                  <div
                    key={hs.id}
                    onClick={() => handleSelectHotspot(hs)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white truncate max-w-[170px]">
                        {hs.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          hs.risk_level === 'Critical'
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : hs.risk_level === 'High'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-blue-950 text-blue-400 border-blue-800'
                        }`}
                      >
                        {hs.risk_level} Risk
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Related Reports: <strong className="text-cyan-400">{hs.complaint_count}</strong></span>
                      <span>Main Issue: <strong className="text-slate-200">{hs.main_issue}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Area Level Diagnostic Insight for Selected Hotspot */}
          {selectedHotspot && (
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  AI Area Diagnostic ({selectedHotspot.area_name})
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  {selectedHotspot.complaint_count} Clustered Issues
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedHotspot.ai_area_insight}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-900/60 text-[11px] text-cyan-200">
                <strong>Recommended Action:</strong> {selectedHotspot.recommended_action}
              </div>

              {/* Related complaints peek */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>View {relatedComplaints.length} linked complaints in this hotspot</span>
                <button
                  onClick={() => {
                    if (relatedComplaints.length > 0) {
                      onOpenComplaint(relatedComplaints[0]);
                    }
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <span>Inspect First</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
