// Lightweight decision-tree symptom checker (FR-B1). Runs locally with zero
// external dependency so the demo works offline. To upgrade to a live AI call,
// replace suggestSpecialist() body with a call to the Gemini/Claude API and
// keep the same return shape: { specialist, department, confidence, reason }.

const RULES = [
  { keywords: ['chest pain', 'palpitation', 'breathless', 'heart'], specialist: 'Cardiologist', department: 'Cardiology' },
  { keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness'], specialist: 'Neurologist', department: 'Neurology' },
  { keywords: ['fever', 'cold', 'cough', 'sore throat', 'body ache'], specialist: 'General Physician', department: 'General Medicine' },
  { keywords: ['skin', 'rash', 'itching', 'acne'], specialist: 'Dermatologist', department: 'Dermatology' },
  { keywords: ['joint pain', 'fracture', 'back pain', 'knee', 'sprain'], specialist: 'Orthopedic', department: 'Orthopedics' },
  { keywords: ['stomach', 'abdominal', 'vomiting', 'diarrhea', 'nausea'], specialist: 'Gastroenterologist', department: 'Gastroenterology' },
  { keywords: ['eye', 'vision', 'blurred'], specialist: 'Ophthalmologist', department: 'Ophthalmology' },
  { keywords: ['ear', 'nose', 'throat', 'sinus'], specialist: 'ENT Specialist', department: 'ENT' },
  { keywords: ['child', 'infant', 'baby'], specialist: 'Pediatrician', department: 'Pediatrics' },
  { keywords: ['pregnan', 'menstrual', 'gynec'], specialist: 'Gynecologist', department: 'Gynecology' },
  { keywords: ['anxiety', 'depression', 'stress', 'sleep'], specialist: 'Psychiatrist', department: 'Psychiatry' }
];

function suggestSpecialist(symptomsText, bodyParts = []) {
  const text = `${symptomsText} ${bodyParts.join(' ')}`.toLowerCase();

  // Special combined case from the PRD example: Headache + Nausea -> Neurologist
  if (text.includes('headache') && text.includes('nausea')) {
    return {
      specialist: 'Neurologist',
      department: 'Neurology',
      confidence: 0.86,
      reason: 'Headache combined with nausea can indicate a neurological cause (e.g. migraine).'
    };
  }

  const scores = RULES.map(rule => {
    const hits = rule.keywords.filter(k => text.includes(k)).length;
    return { rule, hits };
  }).filter(s => s.hits > 0).sort((a, b) => b.hits - a.hits);

  if (scores.length === 0) {
    return {
      specialist: 'General Physician',
      department: 'General Medicine',
      confidence: 0.4,
      reason: 'No specific pattern matched; a General Physician can triage further.'
    };
  }

  const top = scores[0];
  return {
    specialist: top.rule.specialist,
    department: top.rule.department,
    confidence: Math.min(0.6 + top.hits * 0.15, 0.95),
    reason: `Matched symptom keywords: ${top.rule.keywords.filter(k => text.includes(k)).join(', ')}`
  };
}

module.exports = { suggestSpecialist };
