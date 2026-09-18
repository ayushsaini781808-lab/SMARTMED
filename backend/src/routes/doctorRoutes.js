const router = require('express').Router();
const ctrl = require('../controllers/doctorController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', ctrl.listDoctors);
router.get('/:id', ctrl.getDoctor);
router.post('/', requireAuth, requireRole('admin'), ctrl.createDoctor);
router.post('/:doctorId/slots/generate', requireAuth, requireRole('doctor', 'admin'), ctrl.generateSlots);
router.get('/:doctorId/slots', ctrl.listSlots);
router.patch('/:doctorId/leave', requireAuth, requireRole('doctor', 'admin'), ctrl.toggleLeave);

module.exports = router;
