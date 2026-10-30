import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceMeters,
  calculateTextSimilarity,
  inferCategoryFromText,
  calculateExplainablePriority,
  detectDuplicates,
  getDepartmentForCategory,
} from './ai-engine';

test('calculateDistanceMeters calculates accurate distance between two GPS coordinates', () => {
  // Distance between two points ~100m apart
  const d1 = calculateDistanceMeters(28.6139, 77.209, 28.6139, 77.2099);
  assert.ok(d1 > 70 && d1 < 120, `Expected ~88m, got ${d1}`);

  // Distance to itself is 0
  const dSelf = calculateDistanceMeters(28.6139, 77.209, 28.6139, 77.209);
  assert.equal(dSelf, 0);
});

test('calculateTextSimilarity computes word overlap with stop word filtering', () => {
  const text1 = 'Severe waterlogging and flooding near the metro station';
  const text2 = 'Major waterlogging and flood outside metro station bus stop';
  const sim = calculateTextSimilarity(text1, text2);
  assert.ok(sim >= 0.4, `Expected similarity >= 0.4, got ${sim}`);

  const disjoint = 'Garbage overflow with stinking trash bins';
  const sim2 = calculateTextSimilarity(text1, disjoint);
  assert.ok(sim2 < 0.2, `Expected similarity < 0.2, got ${sim2}`);
});

test('inferCategoryFromText identifies appropriate civic categories', () => {
  assert.equal(inferCategoryFromText('Deep pothole and broken road tar'), 'Road Damage');
  assert.equal(inferCategoryFromText('Submerged street waterlogging after rain'), 'Waterlogging');
  assert.equal(inferCategoryFromText('Overflowing garbage dump and rotting trash'), 'Garbage');
  assert.equal(inferCategoryFromText('Broken streetlight dark road lamp pole'), 'Streetlight');
  assert.equal(inferCategoryFromText('Choked sewer line and open manhole gutter'), 'Drainage');
  assert.equal(inferCategoryFromText('Drinking water pipeline burst and leaking tap'), 'WaterSupply'.replace('Supply', ' Supply'));
  assert.equal(inferCategoryFromText('Live electric wire sparking accident risk'), 'Public Safety');
});

test('calculateExplainablePriority calculates high score and critical priority for hazardous cases', () => {
  const res = calculateExplainablePriority(
    'Deep sinkhole and open live electric wire near school crossing',
    'Major road cave-in and sparking wire causing severe pedestrian accident hazard right outside government high school.',
    'Public Safety',
    'Main Arterial Road Junction',
    4
  );

  assert.ok(res.score >= 85, `Hazardous issue should be critical, got ${res.score}`);
  assert.equal(res.priority, 'Critical');
  assert.ok(res.reasons.length >= 3, 'Must have at least 3 explainable reason bullets');
  assert.ok(res.factors.length >= 4, 'Must have detailed factor breakdown');
  assert.ok(res.actionBrief.includes('EMERGENCY ACTION REQUIRED'), 'Critical priority should trigger emergency action brief');
});

test('calculateExplainablePriority assigns low or medium priority for routine issues', () => {
  const res = calculateExplainablePriority(
    'Flickering streetlight bulb',
    'The lamp flickers intermittently late at night in lane 4.',
    'Streetlight',
    'Quiet Residential Lane',
    0
  );

  assert.ok(res.score <= 64, `Minor issue should be <= 64, got ${res.score}`);
  assert.ok(res.priority === 'Medium' || res.priority === 'Low');
});

test('detectDuplicates flags nearby complaints with matching categories and text', () => {
  const existing = [
    {
      id: 'CP-2026-0001',
      title: 'Severe waterlogging at Main Road underpass',
      description: 'Underpass completely flooded with 2 feet of water. Cars are stalling.',
      category: 'Waterlogging' as const,
      latitude: 28.6139,
      longitude: 77.209,
      status: 'Submitted',
    },
    {
      id: 'CP-2026-0002',
      title: 'Broken bench in community park',
      description: 'Wooden bench is broken in sector 5 park.',
      category: 'Other' as const,
      latitude: 28.65,
      longitude: 77.25,
      status: 'Submitted',
    },
  ];

  const candidate = {
    title: 'Waterlogging under main road bridge',
    description: 'Flooding and deep water under the main road underpass.',
    category: 'Waterlogging' as const,
    latitude: 28.6142, // ~35 meters away
    longitude: 77.2091,
  };

  const dupes = detectDuplicates(candidate, existing);
  assert.ok(dupes.length > 0, 'Should find at least 1 duplicate');
  assert.equal(dupes[0].matchedComplaintId, 'CP-2026-0001');
  assert.ok(dupes[0].similarityScore >= 60, `Expected score >= 60, got ${dupes[0].similarityScore}`);
  assert.ok(dupes[0].distanceMeters < 100, `Expected distance < 100m, got ${dupes[0].distanceMeters}`);
});

test('getDepartmentForCategory routes categories to correct municipal departments', () => {
  assert.equal(getDepartmentForCategory('Road Damage'), 'Roads & Infrastructure');
  assert.equal(getDepartmentForCategory('Waterlogging'), 'Water & Drainage');
  assert.equal(getDepartmentForCategory('Drainage'), 'Water & Drainage');
  assert.equal(getDepartmentForCategory('Garbage'), 'Solid Waste Management');
  assert.equal(getDepartmentForCategory('Streetlight'), 'Electrical & Lighting');
  assert.equal(getDepartmentForCategory('Public Safety'), 'Public Health & Safety');
});
