# CivicPulse AI – From Complaints to Action

> **AI-Powered Civic Complaint Management, Priority Triage & Geographic Hotspot Platform**

CivicPulse AI transforms scattered citizen complaints into prioritized, explainable, and trackable municipal actions. Built as a high-reliability full-stack hackathon MVP, the platform combines Google Gemini 3.8 Flash semantic intelligence with deterministic geospatial scoring and SQLite persistent storage.

---

## 1. Executive Summary

Municipal corporations often struggle under a flood of unorganized citizen messages across disparate channels. Critical public safety emergencies (sinkholes, live electric wires, subterranean sewage backflows) get buried alongside routine maintenance tickets.

**CivicPulse AI** solves this through:
- **Autonomous Multi-Class Categorization:** NLP mapping to 8 municipal disciplines.
- **Explainable 0–100 Priority Scoring:** Deconstructing urgency across safety risk, physical scale, transit exposure, cluster density, and population vulnerability.
- **Pairwise Duplicate Detection:** Spatial Haversine clustering combined with stemmed token similarity to link recurring citizen reports under a single master work order.
- **Geographic Hotspot Diagnostics:** Automated spatial grouping with AI area-level insights.
- **Closed-Loop Citizen Transparency:** Public tracking portal with an animated 5-stage lifecycle stepper and published authority audit remarks.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React icons, Recharts for municipal analytics, Leaflet & OpenStreetMap for interactive geospatial GIS mapping.
- **Backend:** Node.js, Express.js REST API server with request validation and streaming capabilities.
- **Database:** SQLite (`better-sqlite3`) with WAL (Write-Ahead Logging) mode, foreign key cascades, and automated synthetic seeding.
- **AI Intelligence:** Dual-layer hybrid architecture:
  - **Google Gemini 3.8 Flash** via `@google/genai` TypeScript SDK (server-side only, zero client key exposure).
  - **Deterministic Rule Engine & Stemmed Jaccard Token Matcher** as a zero-key offline fallback.

---

## 3. Database Schema

The SQLite schema consists of three core relational tables:

```sql
-- 1. Master Complaints Registry
CREATE TABLE complaints (
  id TEXT PRIMARY KEY,                       -- e.g. "CP-2026-1001"
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  ai_category TEXT NOT NULL,
  priority TEXT NOT NULL,                    -- Critical, High, Medium, Low
  priority_score INTEGER NOT NULL,           -- 0 to 100
  priority_reasons TEXT NOT NULL,            -- JSON array of explainable bullet factors
  priority_factors TEXT,                     -- JSON array of weighted factor scores
  ai_summary TEXT NOT NULL,
  ai_action_brief TEXT NOT NULL,
  ai_confidence REAL NOT NULL,
  ai_provider TEXT NOT NULL,                 -- 'gemini-3.8-flash' or 'rule-engine-fallback'
  status TEXT NOT NULL,                      -- Submitted, Under Review, Assigned, In Progress, Resolved, Rejected
  department TEXT NOT NULL,
  assigned_to TEXT,
  location_address TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  image_url TEXT,
  citizen_name TEXT NOT NULL,
  citizen_contact TEXT NOT NULL,
  is_duplicate INTEGER DEFAULT 0,
  duplicate_of_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. Lifecycle Audit History & Authority Remarks
CREATE TABLE complaint_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id TEXT NOT NULL,
  status TEXT NOT NULL,
  remark TEXT NOT NULL,
  actor_type TEXT NOT NULL,                  -- 'citizen', 'authority', 'system'
  actor_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 3. Duplicate Relationships
CREATE TABLE duplicate_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_complaint_id TEXT NOT NULL,
  duplicate_complaint_id TEXT NOT NULL,
  similarity_score INTEGER NOT NULL,         -- 0 to 100%
  match_reasons TEXT NOT NULL,               -- JSON array of signals
  status TEXT NOT NULL DEFAULT 'suggested',  -- 'suggested', 'confirmed', 'rejected'
  created_at TEXT NOT NULL,
  FOREIGN KEY (original_complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (duplicate_complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
```

---

## 4. Synthetic Dataset (52 Preloaded Records)

The platform automatically seeds 52 realistic civic records across 4 primary spatial clusters in Metro Demo City (Center: `28.6139° N, 77.2090° E`):
1. **Sector 12 / Main Road Underpass:** Severe waterlogging, blocked storm drains, submerged missing manhole covers.
2. **Central Market Square Ward:** Commercial waste overflow, snapped dangling live power cables, multi-block streetlight failures.
3. **North Industrial Highway 9 Corridor:** Subsurface soil subsidence, 4-foot deep sinkholes, heavy vehicle axle damage.
4. **Green Valley Residential Enclave:** 12-inch drinking water trunk pipeline burst, sewage cross-contamination.

All records use realistic fictional citizen names and contact information.

---

## 5. REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/complaints` | Lodges new complaint, executes hybrid AI pipeline, checks duplicates, persists to SQLite. |
| `GET` | `/api/complaints` | Retrieves filterable complaints list (`category`, `priority`, `status`, `department`, `search`). |
| `GET` | `/api/complaints/:id` | Returns single complaint with full audit timeline and duplicate relationships. |
| `GET` | `/api/complaints/:id/track` | Public citizen tracking endpoint returning lifecycle stepper data and remarks. |
| `PATCH` | `/api/complaints/:id/status` | Updates complaint status (`In Progress`, `Resolved`, etc.) and records official remark. |
| `POST` | `/api/complaints/:id/assign` | Reassigns complaint to municipal department and designated personnel. |
| `PUT` | `/api/complaints/:id` | Authority override of category, priority score, and metadata. |
| `POST` | `/api/complaints/:id/duplicate` | Confirms or rejects a detected duplicate relationship. |
| `GET` | `/api/hotspots` | Runs spatial clustering algorithm to group complaints within 450m and returns AI area diagnostics. |
| `GET` | `/api/analytics` | Computes live aggregations (resolution rates, incident velocity, category counts). |
| `GET` | `/api/ai/duplicates` | Returns all detected duplicate pairs for the AI Intelligence review hub. |
| `GET` | `/api/ai/status` | Reports Gemini 3.8 Flash connection status and fallback readiness. |
| `POST` | `/api/seed/reset` | Reseeds clean database with the 52 synthetic civic complaints. |

---

## 6. AI Implementation Details

### Explainable Scoring Formula (0 to 100)
$$\text{Priority Score} = S_{\text{safety}} + S_{\text{severity}} + S_{\text{transit}} + S_{\text{cluster}} + S_{\text{vulnerability}}$$
- **Public Safety Risk ($S_{\text{safety}}$, 0–35 pts):** Checks for indicators like cave-in, sparking live wire, open manhole, toxic fire, hospital/school zones.
- **Physical Scale ($S_{\text{severity}}$, 0–25 pts):** Analyzes terms like "feet deep", "massive", "unpassable", "collapsed".
- **Transit Corridor Exposure ($S_{\text{transit}}$, 0–20 pts):** Weights major arterials, highways, and metro interchanges.
- **Cluster Density ($S_{\text{cluster}}$, 0–15 pts):** Corroborating complaints within 400 meters in SQLite.
- **Vulnerability ($S_{\text{vulnerability}}$, 0–10 pts):** Secondary vector risks (drinking water contamination, pediatric school gates).

### Duplicate Detection
- **Haversine Distance:** Proximity weighting ($\le 80\text{m} = +45\text{ pts}$, $\le 250\text{m} = +30\text{ pts}$).
- **Stemmed Jaccard Overlap:** Tokenizes citizen statements with stop-word removal and root stemming.
- **Human-in-the-Loop:** Administrators confirm or reject links, preventing accidental closure of unrelated complaints.

---

## 7. Installation & Run Instructions

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (Optional - platform automatically falls back if key is absent)
cp .env.example .env
# Edit .env with your GEMINI_API_KEY if desired

# 3. Run pure logic unit tests
npm test

# 4. Start full-stack application (Express + Vite)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Five-Minute Hackathon Demo Script

1. **Minute 0:00 – Overview Dashboard:** Highlight the live KPIs (52 Total, Critical Emergencies ticker, Priority and Category distribution).
2. **Minute 1:00 – Citizen Portal:** Click preset *"🌊 Severe Waterlogging (Main Road)"*. Review the auto-filled address and photo. Click *"Submit & Run AI Intelligence"*. Copy the generated Complaint ID (e.g. `CP-2026-XXXX`).
3. **Minute 2:00 – AI Intelligence Hub:** Open the *Duplicate Verification Queue*. Demonstrate how the new report is flagged alongside nearby complaint `CP-2026-1001` based on distance and semantic similarity. Click *"Confirm Duplicate"*.
4. **Minute 3:00 – Hotspots & Authority Dispatch:** Open *Geographic Hotspots*. Click the *Sector 12 Corridor* cluster circle. Review the AI area-level diagnostic insight. Click on the complaint, open *Authority Actions*, assign it to Officer R. Verma, and transition status to *In Progress*.
5. **Minute 4:00 – Transparency Tracking:** Switch to *Citizen Tracking Portal*. Enter the complaint ID. Show the citizen the 5-step lifecycle stepper advancing to *Resolved* with the timestamped authority remarks!

---

## 9. Limitations & Future Roadmap

- **Multi-Lingual Voice Ingestion:** Integrate Gemini Audio Transcription (`gemini-3.5-transcribe`) for direct citizen vernacular voice notes.
- **IoT Sensor Grounding:** Interface with municipal stormwater depth sensors and smart energy meters.
- **Offline PWA Sync:** Enable background service workers for field workers with intermittent cellular connectivity.
