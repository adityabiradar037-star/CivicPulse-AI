import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  initDatabase,
  seedDatabase,
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  assignComplaint,
  updateComplaint,
  updateDuplicateStatus,
  detectHotspots,
  getAnalyticsSummary,
  getAllDuplicatePairs,
} from './src/server/db';
import {
  processComplaintWithAI,
  getDepartmentForCategory,
} from './src/server/ai-engine';
import { ComplaintCategory, ComplaintStatus, DepartmentName, PriorityLevel } from './src/types/civic';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable JSON body parser with generous limit for base64 images
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initialize SQLite database and seed initial 52 records
initDatabase();

// ==========================================
// REST API ROUTES
// ==========================================

/**
 * GET /api/ai/status
 * Check Gemini AI status and fallback readiness
 */
app.get('/api/ai/status', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'online',
    model: 'gemini-3.8-flash',
    geminiConfigured: hasKey,
    fallbackEngine: 'active_and_deterministic',
    activeProvider: hasKey ? 'gemini-3.8-flash' : 'rule-engine-fallback',
  });
});

/**
 * GET /api/complaints
 * Filterable list of complaints
 */
app.get('/api/complaints', (req: Request, res: Response) => {
  try {
    const { category, priority, status, department, search, limit, offset } = req.query;
    const result = getComplaints({
      category: category as string,
      priority: priority as string,
      status: status as string,
      department: department as string,
      search: search as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch complaints', details: err.message });
  }
});

/**
 * POST /api/complaints
 * Submit a new complaint, execute AI pipeline, persist in DB
 */
app.post('/api/complaints', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      location_address,
      latitude,
      longitude,
      image_url,
      citizen_name,
      citizen_contact,
    } = req.body;

    if (!title || !description || !location_address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: title, description, location_address, latitude, and longitude are required.',
      });
    }

    // Fetch existing active complaints for duplicate detection
    const { complaints: existing } = getComplaints({ limit: 100 });

    // Run Hybrid AI Pipeline (Gemini 3.8 Flash + Rule Engine)
    const aiResult = await processComplaintWithAI(
      {
        title,
        description,
        userCategory: category as ComplaintCategory,
        location_address,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      existing
    );

    const assignedDept = getDepartmentForCategory(aiResult.ai_category);

    // Save in SQLite
    const complaint = createComplaint({
      title,
      description,
      category: (category || aiResult.ai_category) as ComplaintCategory,
      ai_category: aiResult.ai_category,
      priority: aiResult.priority,
      priority_score: aiResult.priority_score,
      priority_reasons: aiResult.priority_reasons,
      priority_factors: aiResult.priority_factors,
      ai_summary: aiResult.ai_summary,
      ai_action_brief: aiResult.ai_action_brief,
      ai_confidence: aiResult.ai_confidence,
      ai_provider: aiResult.ai_provider,
      status: 'Submitted',
      department: assignedDept,
      location_address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      image_url: image_url || undefined,
      citizen_name: citizen_name || 'Anonymous Citizen',
      citizen_contact: citizen_contact || 'Unspecified Contact',
      duplicates: aiResult.duplicates.map((d) => ({
        matchedComplaintId: d.matchedComplaintId,
        similarityScore: d.similarityScore,
        reasons: d.reasons,
      })),
    });

    res.status(201).json({
      success: true,
      complaint,
      aiAnalysis: aiResult,
    });
  } catch (err: any) {
    console.error('Error submitting complaint:', err);
    res.status(500).json({ error: 'Failed to create complaint', details: err.message });
  }
});

/**
 * GET /api/complaints/:id
 * Retrieve complaint details, updates timeline, and duplicate links
 */
app.get('/api/complaints/:id', (req: Request, res: Response) => {
  try {
    const { complaint, updates, duplicates } = getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json({ complaint, updates, duplicates });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve complaint', details: err.message });
  }
});

/**
 * GET /api/complaints/:id/track
 * Citizen tracking portal endpoint
 */
app.get('/api/complaints/:id/track', (req: Request, res: Response) => {
  try {
    const { complaint, updates } = getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint ID not found in municipal registry' });
    }

    res.json({
      complaintId: complaint.id,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
      status: complaint.status,
      department: complaint.department,
      assigned_to: complaint.assigned_to,
      location_address: complaint.location_address,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      image_url: complaint.image_url,
      created_at: complaint.created_at,
      updated_at: complaint.updated_at,
      timeline: updates,
      ai_summary: complaint.ai_summary,
      action_brief: complaint.ai_action_brief,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error tracking complaint', details: err.message });
  }
});

/**
 * PUT /api/complaints/:id
 * Update complaint details
 */
app.put('/api/complaints/:id', (req: Request, res: Response) => {
  try {
    const updated = updateComplaint(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json({ success: true, complaint: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update complaint', details: err.message });
  }
});

/**
 * PATCH /api/complaints/:id/status
 * Update status & log authority remark
 */
app.patch('/api/complaints/:id/status', (req: Request, res: Response) => {
  try {
    const { status, remark, actor_name } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const updated = updateComplaintStatus(
      req.params.id,
      status as ComplaintStatus,
      remark || `Status transitioned to ${status}`,
      actor_name || 'Municipal Control Officer'
    );
    if (!updated) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json({ success: true, complaint: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
});

/**
 * POST /api/complaints/:id/assign
 * Assign complaint to department & personnel
 */
app.post('/api/complaints/:id/assign', (req: Request, res: Response) => {
  try {
    const { department, assigned_to, remark, actor_name } = req.body;
    if (!department || !assigned_to) {
      return res.status(400).json({ error: 'Department and assigned_to are required' });
    }
    const updated = assignComplaint(
      req.params.id,
      department as DepartmentName,
      assigned_to,
      remark,
      actor_name
    );
    if (!updated) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json({ success: true, complaint: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to assign complaint', details: err.message });
  }
});

/**
 * POST /api/complaints/:id/duplicate
 * Confirm or reject duplicate relationship
 */
app.post('/api/complaints/:id/duplicate', (req: Request, res: Response) => {
  try {
    const { duplicate_id, status } = req.body;
    if (!duplicate_id || !status) {
      return res.status(400).json({ error: 'duplicate_id and status (confirmed|rejected) are required' });
    }
    const ok = updateDuplicateStatus(req.params.id, duplicate_id, status);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update duplicate status', details: err.message });
  }
});

/**
 * GET /api/ai/analyze/:id
 * Re-run AI analysis on an existing complaint
 */
app.get('/api/ai/analyze/:id', async (req: Request, res: Response) => {
  try {
    const { complaint } = getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    const { complaints: existing } = getComplaints({ limit: 100 });
    const aiResult = await processComplaintWithAI(
      {
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        userCategory: complaint.category,
        location_address: complaint.location_address,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
      },
      existing
    );
    res.json({ complaintId: complaint.id, aiAnalysis: aiResult });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to run AI analysis', details: err.message });
  }
});

/**
 * GET /api/hotspots
 * Geographic hotspot detection
 */
app.get('/api/hotspots', (_req: Request, res: Response) => {
  try {
    const hotspots = detectHotspots();
    res.json({ hotspots, count: hotspots.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to detect hotspots', details: err.message });
  }
});

/**
 * GET /api/analytics
 * Comprehensive municipal analytics
 */
app.get('/api/analytics', (_req: Request, res: Response) => {
  try {
    const summary = getAnalyticsSummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute analytics', details: err.message });
  }
});

/**
 * GET /api/ai/duplicates
 * Get all detected duplicate pairs for AI review
 */
app.get('/api/ai/duplicates', (_req: Request, res: Response) => {
  try {
    const pairs = getAllDuplicatePairs();
    res.json({ duplicates: pairs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch duplicates', details: err.message });
  }
});

/**
 * POST /api/seed/reset
 * Reseed synthetic complaints dataset
 */
app.post('/api/seed/reset', (_req: Request, res: Response) => {
  try {
    seedDatabase();
    res.json({ success: true, message: 'Database reset and re-seeded with 52 realistic complaints.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset seed data', details: err.message });
  }
});

// ==========================================
// VITE DEV SERVER / STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicPulse AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
