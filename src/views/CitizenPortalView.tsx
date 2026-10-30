import React, { useState, useEffect, useRef } from 'react';
import {
  FilePlus2,
  MapPin,
  Upload,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { ComplaintCategory, Complaint } from '../types/civic';

interface CitizenPortalViewProps {
  onSubmitSuccess: (newComplaint: Complaint) => void;
  onNavigateToTracking: (id: string) => void;
}

// Preset quick scenarios for instant hackathon evaluation
const DEMO_PRESETS = [
  {
    label: '🌊 Severe Waterlogging (Main Road)',
    title: 'Severe waterlogging at Main Road underpass near Metro Gate 2',
    description: 'Underpass completely submerged in 2.5 feet of muddy stormwater. Multiple vehicles have stalled, creating heavy traffic gridlock. Immediate suction pumps needed.',
    category: 'Waterlogging' as ComplaintCategory,
    address: 'Main Road Metro Underpass, Sector 12',
    lat: 28.6139,
    lng: 77.2090,
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    citizen: 'Arun Mehra',
    phone: '+91 98765 12345',
  },
  {
    label: '⚠️ Deep Sinkhole & live wire',
    title: 'Major road sinkhole and sparking electric wire near public school',
    description: 'A 4-foot deep cave-in appeared abruptly right where school buses stop. A low-hanging severed power wire is sparking nearby in the rain.',
    category: 'Public Safety' as ComplaintCategory,
    address: 'School Road Crossroad, Ward 14',
    lat: 28.6180,
    lng: 77.2350,
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    citizen: 'Kavita Chawla',
    phone: '+91 98112 33445',
  },
  {
    label: '🗑️ Garbage Dump Overflow',
    title: 'Huge municipal garbage container overflowing into street for 5 days',
    description: 'Waste has piled up onto half of the roadway. Stray dogs and rodents roaming everywhere, extreme odor invading local grocery shops.',
    category: 'Garbage' as ComplaintCategory,
    address: 'Central Market Square Gate 4',
    lat: 28.6328,
    lng: 77.2195,
    image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
    citizen: 'Rajiv Malhotra',
    phone: '+91 98220 55667',
  },
  {
    label: '💡 Dark Streetlight Corridor',
    title: 'Series of 6 broken streetlights along girls college walkway',
    description: 'Complete blackout along this corridor for over 2 weeks. Students feel unsafe walking after evening shift classes.',
    category: 'Streetlight' as ComplaintCategory,
    address: 'College Road, Sector 8',
    lat: 28.5980,
    lng: 77.2130,
    image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=600&q=80',
    citizen: 'Priyanka Sen',
    phone: '+91 97110 44332',
  },
];

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  onSubmitSuccess,
  onNavigateToTracking,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Road Damage');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(28.6139);
  const [longitude, setLongitude] = useState<number>(77.2090);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenContact, setCitizenContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize Leaflet map for coordinate selection
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current).setView([latitude, longitude], 14);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-pin',
          html: `<div style="background-color: #06b6d4; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(6,182,212,0.8);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const marker = L.marker([latitude, longitude], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);
        markerRef.current = marker;

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setLatitude(pos.lat);
          setLongitude(pos.lng);
        });

        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng);
          setLatitude(e.latlng.lat);
          setLongitude(e.latlng.lng);
        });
      } catch (err) {
        console.warn('Leaflet map init warning:', err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position if coordinates change externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.panTo([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleApplyPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setCategory(preset.category);
    setAddress(preset.address);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setImageUrl(preset.image);
    setCitizenName(preset.citizen);
    setCitizenContact(preset.phone);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPreviewError('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setPreviewError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !address.trim()) {
      setPreviewError('Please fill in all required fields (title, description, location address).');
      return;
    }

    setIsSubmitting(true);
    setPreviewError('');

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          location_address: address,
          latitude,
          longitude,
          image_url: imageUrl || undefined,
          citizen_name: citizenName || 'Anonymous Citizen',
          citizen_contact: citizenContact || 'Unspecified',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit complaint');
      }

      setSubmittedComplaint(data.complaint);
      onSubmitSuccess(data.complaint);
    } catch (err: any) {
      setPreviewError(err.message || 'Error communicating with server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
          PUBLIC CIVIC PORTAL
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Report a Civic Problem
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Submit local infrastructure defects, waterlogging, or hazards. Our AI engine instantly categorizes, prioritizes, and routes your report directly to the responsible municipal department.
        </p>
      </div>

      {/* Quick Demo Presets Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Demo Presets (1-Click Fill)
          </span>
          <span className="text-[11px] text-slate-400">Perfect for live hackathon evaluation</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEMO_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 hover:text-white transition-all font-medium"
            >
              <div className="truncate font-semibold">{preset.label}</div>
              <div className="text-[10px] text-slate-400 truncate">{preset.address}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        {previewError && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{previewError}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Complaint Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Severe waterlogging at Main Road underpass near Metro Gate 2"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-cyan-500 placeholder-slate-500 transition-colors"
          />
        </div>

        {/* Category & Department hint */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Complaint Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-cyan-500 transition-colors"
            >
              <option value="Road Damage">Road Damage (Potholes, Cracks, Sinkhole)</option>
              <option value="Waterlogging">Waterlogging (Street Flooding, Submerged Path)</option>
              <option value="Garbage">Garbage (Overflowing Bins, Dumping, Dead Animal)</option>
              <option value="Streetlight">Streetlight (Dark Roads, Broken Lamps)</option>
              <option value="Drainage">Drainage (Choked Drains, Open Sewer, Manholes)</option>
              <option value="Water Supply">Water Supply (Pipe Burst, Contamination, Low Pressure)</option>
              <option value="Public Safety">Public Safety (Exposed Wires, Fallen Trees, Hazards)</option>
              <option value="Other">Other Civic Issues</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              AI Intelligent Routing
            </label>
            <div className="px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-cyan-400 font-mono flex items-center justify-between">
              <span>Automatic Department Triage</span>
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Detailed Description *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the severity, depth, duration, and safety danger to pedestrians or commuters in detail..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-cyan-500 placeholder-slate-500 resize-none transition-colors"
          />
        </div>

        {/* Image Upload / URL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Photographic Evidence (Upload or URL)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste direct image URL (or upload below)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500 placeholder-slate-500"
              />
            </div>
            <div>
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {imageUrl && (
            <div className="mt-3 relative w-full max-h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Upload preview"
                className="max-h-48 object-cover w-full"
                onError={() => setPreviewError('Could not load image preview. Please check URL.')}
              />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-950/80 text-rose-400 text-xs font-bold"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Location & Map Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Location & Geotagging *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or landmark (e.g. Main Arterial Underpass, Sector 12)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-400">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
            </div>
          </div>

          {/* Interactive Leaflet Pin Drop Map */}
          <div className="rounded-xl overflow-hidden border border-slate-800">
            <div className="bg-slate-950 px-3 py-1.5 text-[11px] text-slate-400 border-b border-slate-800 flex items-center justify-between">
              <span>Click on map or drag pin to position accurate GPS coordinates</span>
              <span className="text-cyan-400 font-mono text-[10px]">OpenStreetMap Live</span>
            </div>
            <div ref={mapContainerRef} className="h-56 w-full bg-slate-950 z-10" />
          </div>
        </div>

        {/* Citizen Contact (Fictional/Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Citizen Name
            </label>
            <input
              type="text"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              placeholder="e.g. Rajesh Sharma"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Contact Phone / Email
            </label>
            <input
              type="text"
              value={citizenContact}
              onChange={(e) => setCitizenContact(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing AI Triage Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit & Run AI Intelligence</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Confirmation Modal */}
      {submittedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Complaint Lodged Successfully!</h2>
                <p className="text-xs text-slate-400">Stored in municipal SQLite registry and triaged by AI.</p>
              </div>
            </div>

            {/* Generated ID Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Your Unique Complaint ID</span>
                <span className="text-xl font-black font-mono text-cyan-400">{submittedComplaint.id}</span>
              </div>
              <button
                onClick={() => handleCopyId(submittedComplaint.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            {/* AI Immediate Result Preview */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/40 border border-cyan-800/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Instant AI Triage Report
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800 text-[10px]">
                  Priority: {submittedComplaint.priority} ({submittedComplaint.priority_score}/100)
                </span>
              </div>
              <p className="text-slate-300 text-xs">
                <strong>Executive Summary:</strong> {submittedComplaint.ai_summary}
              </p>
              <p className="text-cyan-200 text-xs">
                <strong>Assigned Department:</strong> {submittedComplaint.department}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSubmittedComplaint(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Submit Another Report
              </button>
              <button
                onClick={() => {
                  const id = submittedComplaint.id;
                  setSubmittedComplaint(null);
                  onNavigateToTracking(id);
                }}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <span>Track This Complaint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
