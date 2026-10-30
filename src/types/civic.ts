export type ComplaintCategory =
  | 'Road Damage'
  | 'Waterlogging'
  | 'Garbage'
  | 'Streetlight'
  | 'Drainage'
  | 'Water Supply'
  | 'Public Safety'
  | 'Other';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type DepartmentName =
  | 'Roads & Infrastructure'
  | 'Water & Drainage'
  | 'Solid Waste Management'
  | 'Electrical & Lighting'
  | 'Public Health & Safety'
  | 'General Administration';

export interface PriorityFactor {
  factor: string;
  weight: number;
  score: number;
  description: string;
}

export interface Complaint {
  id: string; // e.g. "CP-2026-1042"
  title: string;
  description: string;
  category: ComplaintCategory;
  ai_category: ComplaintCategory;
  priority: PriorityLevel;
  priority_score: number; // 0 - 100
  priority_reasons: string[]; // List of bullet points
  priority_factors?: PriorityFactor[];
  ai_summary: string;
  ai_action_brief: string;
  ai_confidence: number; // 0.0 - 1.0
  ai_provider: 'gemini-3.8-flash' | 'rule-engine-fallback';
  status: ComplaintStatus;
  department: DepartmentName;
  assigned_to?: string;
  location_address: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  citizen_name: string;
  citizen_contact: string;
  is_duplicate?: boolean;
  duplicate_of_id?: string;
  duplicate_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ComplaintUpdate {
  id: number;
  complaint_id: string;
  status: ComplaintStatus;
  remark: string;
  actor_type: 'citizen' | 'authority' | 'system';
  actor_name: string;
  created_at: string;
}

export interface DuplicateRelationship {
  id: number;
  original_complaint_id: string;
  duplicate_complaint_id: string;
  similarity_score: number; // 0 - 100
  match_reasons: string[];
  status: 'suggested' | 'confirmed' | 'rejected';
  created_at: string;
  original_complaint?: Complaint;
  duplicate_complaint?: Complaint;
}

export interface Hotspot {
  id: string;
  name: string;
  area_name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  complaint_count: number;
  main_issue: ComplaintCategory;
  risk_level: PriorityLevel;
  complaint_ids: string[];
  ai_area_insight: string;
  recommended_action: string;
}

export interface AnalyticsSummary {
  totalComplaints: number;
  pendingComplaints: number;
  criticalComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  resolutionRate: number; // percentage
  avgResolutionHours: number;
  categoryBreakdown: { category: string; count: number; percentage: number }[];
  priorityBreakdown: { priority: string; count: number; percentage: number }[];
  statusBreakdown: { status: string; count: number }[];
  areaBreakdown: { area: string; total: number; critical: number }[];
  trendData: { date: string; submitted: number; resolved: number }[];
  topRecurringIssues: { category: string; count: number; avgPriority: number }[];
}
