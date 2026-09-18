const router = require('express').Router();
const ctrl = require('../controllers/prescriptionController');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../config/upload');

router.post('/upload', requireAuth, requireRole('doctor', 'admin'), upload.single('image'), ctrl.uploadPrescription);
router.post('/manual', requireAuth, requireRole('doctor', 'admin'), ctrl.createPrescriptionManual);
router.get('/mine', requireAuth, ctrl.getMyPrescriptions);

module.exports = router;
