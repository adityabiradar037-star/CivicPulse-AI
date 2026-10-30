import { GoogleGenAI, Type } from '@google/genai';
import {
  ComplaintCategory,
  PriorityLevel,
  DepartmentName,
  PriorityFactor,
} from '../types/civic';

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Calculate distance in meters between two coordinates using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Tokenize string into set of lowercase stemmed word roots
 */
function tokenize(text: string): Set<string> {
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'near',
    'by', 'of', 'for', 'to', 'with', 'from', 'as', 'there', 'has', 'have',
    'been', 'this', 'that', 'it', 'very', 'due', 'our', 'my', 'area', 'outside',
  ]);
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .map((w) => {
      // Basic stemming for common civic suffixes
      if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
      if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
      if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
      if (w.endsWith('s') && w.length > 3) return w.slice(0, -1);
      return w;
    });
  return new Set(words);
}

/**
 * Calculate Jaccard similarity score between two texts (0.0 to 1.0)
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const set1 = tokenize(text1);
  const set2 = tokenize(text2);
  if (set1.size === 0 || set2.size === 0) return 0;

  let intersectionCount = 0;
  for (const word of set1) {
    if (set2.has(word)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...set1, ...set2]).size;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
}

/**
 * Determine best municipal department for a category
 */
export function getDepartmentForCategory(category: ComplaintCategory): DepartmentName {
  switch (category) {
    case 'Road Damage':
      return 'Roads & Infrastructure';
    case 'Waterlogging':
    case 'Drainage':
    case 'Water Supply':
      return 'Water & Drainage';
    case 'Garbage':
      return 'Solid Waste Management';
    case 'Streetlight':
      return 'Electrical & Lighting';
    case 'Public Safety':
      return 'Public Health & Safety';
    default:
      return 'General Administration';
  }
}

/**
 * Rule-based category inference (specific categories checked before generic ones)
 */
export function inferCategoryFromText(text: string): ComplaintCategory {
  const lower = text.toLowerCase();
  
  // Specific equipment & lighting first (to avoid generic 'road' keyword overshadowing)
  if (
    lower.includes('streetlight') ||
    lower.includes('street light') ||
    lower.includes('lamp') ||
    lower.includes('dark') ||
    lower.includes('light pole') ||
    lower.includes('lighting') ||
    lower.includes('bulb')
  ) {
    return 'Streetlight';
  }

  // Waterlogging
  if (
    lower.includes('waterlog') ||
    lower.includes('water log') ||
    lower.includes('submerged') ||
    lower.includes('flood') ||
    lower.includes('stagnant water')
  ) {
    return 'Waterlogging';
  }

  // Drainage and sewers
  if (
    lower.includes('drain') ||
    lower.includes('sewage') ||
    lower.includes('gutter') ||
    lower.includes('manhole') ||
    lower.includes('sewer')
  ) {
    return 'Drainage';
  }

  // Garbage
  if (
    lower.includes('garbage') ||
    lower.includes('trash') ||
    lower.includes('waste') ||
    lower.includes('dump') ||
    lower.includes('debris') ||
    lower.includes('litter')
  ) {
    return 'Garbage';
  }

  // Water supply
  if (
    lower.includes('pipe burst') ||
    lower.includes('drinking water') ||
    lower.includes('pipeline') ||
    lower.includes('tap') ||
    lower.includes('no water') ||
    lower.includes('water pressure')
  ) {
    return 'Water Supply';
  }

  // Public safety
  if (
    lower.includes('accident') ||
    lower.includes('danger') ||
    lower.includes('hazard') ||
    lower.includes('electrocution') ||
    lower.includes('live wire') ||
    lower.includes('electric wire') ||
    lower.includes('sparking') ||
    lower.includes('cave-in') ||
    lower.includes('sinkhole') ||
    lower.includes('collaps') ||
    lower.includes('safety')
  ) {
    return 'Public Safety';
  }

  // Road damage (checked after specific components)
  if (
    lower.includes('pothole') ||
    lower.includes('road') ||
    lower.includes('crater') ||
    lower.includes('asphalt') ||
    lower.includes('tar') ||
    lower.includes('footpath') ||
    lower.includes('pavement')
  ) {
    return 'Road Damage';
  }

  return 'Other';
}

export interface RuleScoringResult {
  score: number;
  priority: PriorityLevel;
  reasons: string[];
  factors: PriorityFactor[];
  actionBrief: string;
}

/**
 * Deterministic Explainable Priority Scoring Engine
 */
export function calculateExplainablePriority(
  title: string,
  description: string,
  category: ComplaintCategory,
  location: string,
  nearbyClusterCount: number = 0
): RuleScoringResult {
  const combined = `${title} ${description} ${location}`.toLowerCase();
  const reasons: string[] = [];
  const factors: PriorityFactor[] = [];

  // Factor 1: Public Safety Risk (0 to 35 pts)
  let safetyScore = 5;
  let safetyReason = 'Baseline community concern with standard safety exposure.';
  const highSafetyKeywords = [
    'accident', 'death', 'injury', 'hospital', 'school', 'children',
    'electrocution', 'sparking', 'live wire', 'electric wire', 'deep crater', 'sinkhole', 'cave-in',
    'open manhole', 'fire', 'toxic', 'collapsed', 'danger', 'hazard', 'fatal'
  ];
  const matchedSafety = highSafetyKeywords.filter((k) => combined.includes(k));

  if (matchedSafety.length >= 2 || category === 'Public Safety') {
    safetyScore = matchedSafety.length >= 2 ? 35 : 28;
    safetyReason = `Critical public safety hazard: indicators (${matchedSafety.slice(0, 3).join(', ')}) create direct danger to citizens.`;
    reasons.push(safetyReason);
  } else if (matchedSafety.length === 1) {
    safetyScore = 22;
    safetyReason = `Elevated safety risk detected: mention of ${matchedSafety[0]} requires prompt mitigation.`;
    reasons.push(safetyReason);
  } else if (category === 'Waterlogging' || category === 'Drainage') {
    safetyScore = 15;
    safetyReason = `Category '${category}' inherently involves risk of slipping, contamination, or vehicular impact.`;
    reasons.push(safetyReason);
  }
  factors.push({
    factor: 'Public Safety Risk',
    weight: 35,
    score: safetyScore,
    description: safetyReason,
  });

  // Factor 2: Severity & Physical Magnitude (0 to 25 pts)
  let severityScore = 8;
  let severityReason = 'Moderate localized physical defect reported.';
  const severityKeywords = [
    'massive', 'huge', 'unpassable', 'blocked', 'completely', 'overflowing',
    'deep', 'feet deep', 'inches', 'collapsed', 'gridlock', 'submerged', 'urgent',
    'burst', 'extensive', 'impassable', 'stagnant', 'severe', 'cave-in'
  ];
  const matchedSeverity = severityKeywords.filter((k) => combined.includes(k));

  if (matchedSeverity.length >= 2) {
    severityScore = 25;
    severityReason = `Severe infrastructure disruption: physical scale described as extensive/unpassable (${matchedSeverity.slice(0, 2).join(', ')}).`;
    reasons.push(severityReason);
  } else if (matchedSeverity.length === 1) {
    severityScore = 18;
    severityReason = `Substantial physical impact noted: ${matchedSeverity[0]}.`;
    reasons.push(severityReason);
  } else if (description.length > 100) {
    severityScore = 12;
    severityReason = 'Detailed citizen testimony documents persistent civic deterioration.';
  }
  factors.push({
    factor: 'Severity & Physical Magnitude',
    weight: 25,
    score: severityScore,
    description: severityReason,
  });

  // Factor 3: Population Exposure & Location Impact (0 to 20 pts)
  let locationScore = 6;
  let locationReason = 'Residential or local connector corridor.';
  const transitKeywords = [
    'highway', 'main road', 'junction', 'crossing', 'crossroad', 'market', 'metro', 'station',
    'bus stop', 'commercial', 'downtown', 'artery', 'school zone', 'flyover', 'school'
  ];
  const matchedTransit = transitKeywords.filter((k) => combined.includes(k));

  if (matchedTransit.length > 0) {
    locationScore = 20;
    locationReason = `High-density transit corridor (${matchedTransit[0]}): impacts thousands of daily commuters and pedestrians.`;
    reasons.push(locationReason);
  } else if (location.toLowerCase().includes('sector') || location.toLowerCase().includes('avenue') || location.toLowerCase().includes('blvd')) {
    locationScore = 14;
    locationReason = 'Primary neighborhood thoroughfare with continuous vehicular traffic.';
    reasons.push(locationReason);
  }
  factors.push({
    factor: 'Population & Transit Exposure',
    weight: 20,
    score: locationScore,
    description: locationReason,
  });

  // Factor 4: Recurring Frequency & Cluster Density (0 to 15 pts)
  let clusterScore = 3;
  let clusterReason = 'Isolated report; no historical clustering detected.';
  if (nearbyClusterCount >= 4) {
    clusterScore = 15;
    clusterReason = `Persistent civic hotspot: ${nearbyClusterCount} related complaints logged in this immediate vicinity.`;
    reasons.push(clusterReason);
  } else if (nearbyClusterCount >= 2) {
    clusterScore = 10;
    clusterReason = `Multiple reports (${nearbyClusterCount}) registered nearby, indicating systemic infrastructure breakdown.`;
    reasons.push(clusterReason);
  } else if (nearbyClusterCount === 1) {
    clusterScore = 6;
    clusterReason = 'Corroborated by 1 neighboring complaint in the same ward.';
  }
  factors.push({
    factor: 'Cluster & Frequency Density',
    weight: 15,
    score: clusterScore,
    description: clusterReason,
  });

  // Factor 5: Vulnerability & Environmental Risk (0 to 10 pts)
  let vulnScore = 4;
  let vulnReason = 'Standard urban maintenance priority.';
  if (combined.includes('school') || combined.includes('elderly') || combined.includes('hospital') || combined.includes('drinking water') || combined.includes('live wire')) {
    vulnScore = 10;
    vulnReason = 'Proximity to vulnerable populations or critical public health facilities.';
    reasons.push(vulnReason);
  } else if (combined.includes('rain') || combined.includes('monsoon') || combined.includes('odor') || combined.includes('mosquito')) {
    vulnScore = 7;
    vulnReason = 'Potential secondary disease vector or environmental deterioration.';
    reasons.push(vulnReason);
  }
  factors.push({
    factor: 'Environmental & Health Vulnerability',
    weight: 10,
    score: vulnScore,
    description: vulnReason,
  });
  factors.push({
    factor: 'Environmental & Health Vulnerability',
    weight: 10,
    score: vulnScore,
    description: vulnReason,
  });

  // Total Score Calculation
  let totalScore = safetyScore + severityScore + locationScore + clusterScore + vulnScore;
  totalScore = Math.min(100, Math.max(10, totalScore));

  let priority: PriorityLevel = 'Medium';
  if (totalScore >= 85) priority = 'Critical';
  else if (totalScore >= 65) priority = 'High';
  else if (totalScore >= 40) priority = 'Medium';
  else priority = 'Low';

  // Action brief synthesis
  let actionBrief = '';
  if (priority === 'Critical') {
    actionBrief = `EMERGENCY ACTION REQUIRED: Immediately dispatch an emergency response team from ${getDepartmentForCategory(category)}. Secure the perimeter at ${location} to prevent public accidents, and initiate immediate remediation within 4 hours.`;
  } else if (priority === 'High') {
    actionBrief = `PRIORITY INSPECTION: Assign inspection crew from ${getDepartmentForCategory(category)} to assess ${category.toLowerCase()} at ${location}. Schedule on-site corrective equipment within 24 hours.`;
  } else if (priority === 'Medium') {
    actionBrief = `SCHEDULED WORK ORDER: Log complaint with ${getDepartmentForCategory(category)} for regular route maintenance at ${location}. Track resolution SLA within 48 to 72 hours.`;
  } else {
    actionBrief = `ROUTINE LOG: Register minor defect into municipal maintenance queue for periodic ward review.`;
  }

  return {
    score: totalScore,
    priority,
    reasons: reasons.length > 0 ? reasons : ['General municipal maintenance required.'],
    factors,
    actionBrief,
  };
}

/**
 * Duplicate Detection across existing complaints in database
 */
export interface DuplicateCandidateMatch {
  matchedComplaintId: string;
  matchedTitle: string;
  similarityScore: number; // 0 - 100
  distanceMeters: number;
  reasons: string[];
  isLikelyDuplicate: boolean;
}

export function detectDuplicates(
  newComplaint: {
    title: string;
    description: string;
    category: ComplaintCategory;
    latitude: number;
    longitude: number;
    id?: string;
  },
  existingComplaints: Array<{
    id: string;
    title: string;
    description: string;
    category: ComplaintCategory;
    latitude: number;
    longitude: number;
    status: string;
  }>
): DuplicateCandidateMatch[] {
  const matches: DuplicateCandidateMatch[] = [];

  for (const existing of existingComplaints) {
    if (newComplaint.id && existing.id === newComplaint.id) continue;
    if (existing.status === 'Resolved' || existing.status === 'Rejected') continue;

    const distance = calculateDistanceMeters(
      newComplaint.latitude,
      newComplaint.longitude,
      existing.latitude,
      existing.longitude
    );

    // Text similarity between title + description
    const textSim = calculateTextSimilarity(
      `${newComplaint.title} ${newComplaint.description}`,
      `${existing.title} ${existing.description}`
    );

    const reasons: string[] = [];
    let similarityScore = 0;

    // Check category alignment
    const sameCategory = newComplaint.category === existing.category;
    if (sameCategory) {
      similarityScore += 25;
      reasons.push(`Exact category match (${newComplaint.category})`);
    }

    // Proximity scoring
    if (distance <= 80) {
      similarityScore += 45;
      reasons.push(`Immediate physical proximity (${distance}m apart)`);
    } else if (distance <= 250) {
      similarityScore += 30;
      reasons.push(`Very close geographic radius (${distance}m apart)`);
    } else if (distance <= 600) {
      similarityScore += 15;
      reasons.push(`Within the same neighborhood zone (${distance}m apart)`);
    }

    // Text similarity scoring (0 to 35)
    const textPercent = Math.round(textSim * 100);
    if (textSim >= 0.5) {
      similarityScore += 35;
      reasons.push(`High textual and semantic similarity (${textPercent}%)`);
    } else if (textSim >= 0.3) {
      similarityScore += 25;
      reasons.push(`Significant descriptive overlap (${textPercent}%)`);
    } else if (textSim >= 0.15) {
      similarityScore += 10;
      reasons.push(`Moderate keyword overlap (${textPercent}%)`);
    }

    similarityScore = Math.min(100, similarityScore);

    // If similarity >= 50 and distance <= 500m, or text similarity >= 65%
    if (similarityScore >= 50 || (sameCategory && distance <= 120)) {
      matches.push({
        matchedComplaintId: existing.id,
        matchedTitle: existing.title,
        similarityScore,
        distanceMeters: distance,
        reasons,
        isLikelyDuplicate: similarityScore >= 65,
      });
    }
  }

  // Sort descending by similarity score
  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Full AI Pipeline Execution (Hybrid Gemini 3.8 Flash + Rule Engine Fallback)
 */
export interface AiAnalysisOutput {
  ai_category: ComplaintCategory;
  ai_summary: string;
  priority: PriorityLevel;
  priority_score: number;
  priority_reasons: string[];
  priority_factors?: PriorityFactor[];
  ai_action_brief: string;
  ai_confidence: number;
  ai_provider: 'gemini-3.8-flash' | 'rule-engine-fallback';
  duplicates: DuplicateCandidateMatch[];
}

export async function processComplaintWithAI(
  input: {
    id?: string;
    title: string;
    description: string;
    userCategory?: ComplaintCategory;
    location_address: string;
    latitude: number;
    longitude: number;
  },
  existingComplaints: Array<{
    id: string;
    title: string;
    description: string;
    category: ComplaintCategory;
    latitude: number;
    longitude: number;
    status: string;
  }> = []
): Promise<AiAnalysisOutput> {
  // 1. Detect duplicates and calculate proximity cluster count
  const duplicates = detectDuplicates(
    {
      title: input.title,
      description: input.description,
      category: input.userCategory || inferCategoryFromText(`${input.title} ${input.description}`),
      latitude: input.latitude,
      longitude: input.longitude,
      id: input.id,
    },
    existingComplaints
  );

  const clusterCount = duplicates.filter((d) => d.distanceMeters <= 400).length;

  // 2. Compute deterministic rule scoring as foundation & fallback
  const inferredCategory = input.userCategory && input.userCategory !== 'Other'
    ? input.userCategory
    : inferCategoryFromText(`${input.title} ${input.description}`);

  const ruleResult = calculateExplainablePriority(
    input.title,
    input.description,
    inferredCategory,
    input.location_address,
    clusterCount
  );

  // Default fallback values
  let aiCategory: ComplaintCategory = inferredCategory;
  let aiSummary = input.description.length > 120
    ? `${input.description.substring(0, 117)}...`
    : input.description;
  let priority = ruleResult.priority;
  let priorityScore = ruleResult.score;
  let priorityReasons = ruleResult.reasons;
  let actionBrief = ruleResult.actionBrief;
  let aiConfidence = 0.88;
  let aiProvider: 'gemini-3.8-flash' | 'rule-engine-fallback' = 'rule-engine-fallback';

  // 3. If Gemini is available, attempt Gemini 3.8 Flash with a strict 3.5s timeout
  if (aiClient) {
    try {
      const prompt = `Analyze this civic complaint for a municipal authority dashboard:
Title: "${input.title}"
Citizen Description: "${input.description}"
Location: "${input.location_address}"
User Selected Category: "${input.userCategory || 'Unspecified'}"
Nearby Corroborating Reports: ${clusterCount} within 400 meters.
Rule engine baseline score: ${ruleResult.score}/100 (${ruleResult.priority})

Tasks:
1. Determine the exact civic category from: ['Road Damage', 'Waterlogging', 'Garbage', 'Streetlight', 'Drainage', 'Water Supply', 'Public Safety', 'Other'].
2. Write a concise executive summary (1-2 sentences) capturing the core defect and public impact.
3. Compute an explainable priority score between 0 and 100 based on safety risk, severity, affected commuters, and recurrence.
4. Categorize priority as 'Critical' (85-100), 'High' (65-84), 'Medium' (40-64), or 'Low' (0-39).
5. Provide 3-4 bullet explanations stating exactly why this score was assigned.
6. Generate a 2-sentence actionable brief for the municipal department head specifying urgent steps.
7. Provide a confidence score between 0.70 and 0.99.`;

      const geminiPromise = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are CivicPulse AI, a high-reliability municipal AI governance and civic issue triage intelligence engine. Output only strictly valid JSON matching the requested schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'Best matching civic category',
              },
              summary: {
                type: Type.STRING,
                description: 'Short executive summary',
              },
              priorityScore: {
                type: Type.INTEGER,
                description: 'Score from 0 to 100',
              },
              priorityLevel: {
                type: Type.STRING,
                description: 'Critical, High, Medium, or Low',
              },
              reasons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Explainable reasons for the priority score',
              },
              actionBrief: {
                type: Type.STRING,
                description: 'Clear tactical advice for municipal officers',
              },
              confidence: {
                type: Type.NUMBER,
                description: 'AI confidence from 0.0 to 1.0',
              },
            },
            required: ['category', 'summary', 'priorityScore', 'priorityLevel', 'reasons', 'actionBrief', 'confidence'],
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API request timed out after 3500ms')), 3500)
      );

      const response = await Promise.race([geminiPromise, timeoutPromise]);

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.category) {
        aiCategory = parsed.category as ComplaintCategory;
      }
      if (parsed.summary) {
        aiSummary = parsed.summary;
      }
      if (typeof parsed.priorityScore === 'number') {
        priorityScore = Math.min(100, Math.max(0, parsed.priorityScore));
      }
      if (parsed.priorityLevel) {
        priority = parsed.priorityLevel as PriorityLevel;
      }
      if (Array.isArray(parsed.reasons) && parsed.reasons.length > 0) {
        priorityReasons = parsed.reasons;
      }
      if (parsed.actionBrief) {
        actionBrief = parsed.actionBrief;
      }
      if (typeof parsed.confidence === 'number') {
        aiConfidence = Math.min(0.99, Math.max(0.7, parsed.confidence));
      }
      aiProvider = 'gemini-3.8-flash';
    } catch (err) {
      console.warn('Gemini 3.8 Flash query failed or busy (503), engaged deterministic fallback pipeline:', (err as any)?.message || err);
      aiProvider = 'rule-engine-fallback';
    }
  }

  return {
    ai_category: aiCategory,
    ai_summary: aiSummary,
    priority,
    priority_score: priorityScore,
    priority_reasons: priorityReasons,
    priority_factors: ruleResult.factors,
    ai_action_brief: actionBrief,
    ai_confidence: aiConfidence,
    ai_provider: aiProvider,
    duplicates,
  };
}
