const Tesseract = require('tesseract.js');
const { Prescription, Appointment } = require('../models');

// Very small heuristic parser that pulls "Name Dosage Frequency"-style lines out
// of raw OCR text. Real-world prescriptions vary hugely in format; this covers
// the common "Paracetamol 500mg 1-0-1" style pattern used in the PRD demo.
function parseMedicines(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const medicines = [];
  const dosageRegex = /(\d+\s?(mg|ml|g|mcg))/i;
  const freqRegex = /(\d-\d-\d|once daily|twice daily|thrice daily|\d+\s?times?\/?\s?day)/i;

  for (const line of lines) {
    const dosageMatch = line.match(dosageRegex);
    const freqMatch = line.match(freqRegex);
    if (dosageMatch || freqMatch) {
      medicines.push({
        name: line.replace(dosageRegex, '').replace(freqRegex, '').trim() || line,
        dosage: dosageMatch ? dosageMatch[0] : null,
        frequency: freqMatch ? freqMatch[0] : null
      });
    }
  }
  return medicines;
}

// FR-D1: Doctor uploads a prescription image; Tesseract.js extracts text and
// we parse out medicine/dosage/frequency, then store in the patient's vault.
async function uploadPrescription(req, res, next) {
  try {
    const { appointmentId, patientId, doctorId, notes } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image file is required (field name: image)' });

    const { data } = await Tesseract.recognize(req.file.path, 'eng');
    const rawOcrText = data.text || '';
    const medicines = parseMedicines(rawOcrText);

    const prescription = await Prescription.create({
      appointmentId, patientId, doctorId,
      imagePath: req.file.path,
      rawOcrText,
      medicines: JSON.stringify(medicines),
      notes
    });

    res.status(201).json({ ...prescription.toJSON(), medicines });
  } catch (err) { next(err); }
}

// Doctors/patients can also submit medicines directly (typed) without OCR.
async function createPrescriptionManual(req, res, next) {
  try {
    const { appointmentId, patientId, doctorId, medicines, notes } = req.body;
    const prescription = await Prescription.create({
      appointmentId, patientId, doctorId,
      medicines: JSON.stringify(medicines || []),
      notes
    });
    res.status(201).json({ ...prescription.toJSON(), medicines: medicines || [] });
  } catch (err) { next(err); }
}

// FR-D2: Patient's chronological medical vault.
async function getMyPrescriptions(req, res, next) {
  try {
    const prescriptions = await Prescription.findAll({
      where: { patientId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    const withParsed = prescriptions.map(p => ({ ...p.toJSON(), medicines: JSON.parse(p.medicines || '[]') }));
    res.json(withParsed);
  } catch (err) { next(err); }
}

module.exports = { uploadPrescription, createPrescriptionManual, getMyPrescriptions };
