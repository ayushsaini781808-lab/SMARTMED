// Lightweight decision-tree symptom checker (FR-B1). Runs locally with zero
// external dependency so the demo works offline. To upgrade to a live AI call,
// replace suggestSpecialist() body with a call to the Gemini/Claude API and
// keep the same return shape: { specialist, department, confidence, reason }.

const RULES = [
  {
    keywords: ['chest pain', 'palpitation', 'breathless', 'heart', 'cardiac', 'angina', 'arrhythmia', 'blood pressure', 'cholesterol'],
    specialist: 'Cardiologist', department: 'Cardiology'
  },
  {
    keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'epilepsy', 'tremor', 'memory loss', 'stroke', 'vertigo', 'paralysis', 'blackout'],
    specialist: 'Neurologist', department: 'Neurology'
  },
  {
    keywords: ['fever', 'cold', 'cough', 'sore throat', 'body ache', 'fatigue', 'weakness', 'malaise', 'flu', 'viral', 'infection', 'general'],
    specialist: 'General Physician', department: 'General Medicine'
  },
  {
    keywords: ['skin', 'rash', 'itching', 'acne', 'eczema', 'psoriasis', 'hives', 'allergy', 'dermatitis', 'blisters', 'pimple', 'hair loss', 'dandruff'],
    specialist: 'Dermatologist', department: 'Dermatology'
  },
  {
    keywords: ['joint pain', 'fracture', 'back pain', 'knee', 'sprain', 'bone', 'shoulder', 'ankle', 'wrist', 'hip', 'sports injury', 'ligament', 'muscle pain', 'orthopedic'],
    specialist: 'Orthopedist', department: 'Orthopedics'
  },
  {
    keywords: ['stomach', 'abdominal', 'vomiting', 'diarrhea', 'nausea', 'constipation', 'acidity', 'heartburn', 'liver', 'indigestion', 'bloating', 'gastric', 'ibs', 'colitis'],
    specialist: 'Gastroenterologist', department: 'Gastroenterology'
  },
  {
    keywords: ['eye', 'vision', 'blurred', 'cataract', 'glaucoma', 'retina', 'spectacles', 'glasses', 'watering eyes', 'red eye', 'squint'],
    specialist: 'Ophthalmologist', department: 'Ophthalmology'
  },
  {
    keywords: ['ear', 'nose', 'throat', 'sinus', 'sinusitis', 'tonsil', 'hearing loss', 'ear pain', 'nasal', 'sneezing', 'rhinitis', 'hoarse', 'voice', 'ent'],
    specialist: 'ENT Specialist', department: 'ENT'
  },
  {
    keywords: ['child', 'infant', 'baby', 'toddler', 'kids', 'newborn', 'vaccination', 'growth', 'pediatric'],
    specialist: 'Pediatrician', department: 'Pediatrics'
  },
  {
    keywords: ['pregnant', 'pregnancy', 'menstrual', 'period', 'gynec', 'women', 'ovarian', 'uterus', 'discharge', 'pcos', 'fertility', 'menopause', 'vaginal'],
    specialist: 'Gynaecologist', department: 'Gynaecology'
  },
  {
    keywords: ['anxiety', 'depression', 'stress', 'sleep', 'insomnia', 'panic', 'mental', 'mood', 'phobia', 'ocd', 'ptsd', 'suicidal', 'bipolar', 'schizophrenia', 'psychiatric'],
    specialist: 'Psychiatrist', department: 'Psychiatry'
  },
  {
    keywords: ['breathing', 'shortness of breath', 'asthma', 'copd', 'lung', 'respiratory', 'wheezing', 'chest tightness', 'oxygen', 'bronchitis', 'pneumonia', 'tb', 'tuberculosis'],
    specialist: 'Pulmonologist', department: 'Pulmonology'
  },
  {
    keywords: ['diabetes', 'thyroid', 'hormone', 'obesity', 'weight gain', 'sugar', 'insulin', 'adrenal', 'metabolic', 'endocrine', 'pituitary', 'hypothyroid', 'hyperthyroid'],
    specialist: 'Endocrinologist', department: 'Endocrinology'
  },
  {
    keywords: ['urine', 'urinary', 'kidney stone', 'prostate', 'bladder', 'kidney', 'renal', 'uti', 'urination', 'incontinence', 'urology'],
    specialist: 'Urologist', department: 'Urology'
  },
  {
    keywords: ['arthritis', 'autoimmune', 'lupus', 'rheumatoid', 'swollen joints', 'stiffness', 'inflammation', 'gout', 'fibromyalgia', 'rheumatism'],
    specialist: 'Rheumatologist', department: 'Rheumatology'
  }
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
