const router = require('express').Router();
const ctrl = require('../controllers/appointmentController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/symptom-check', ctrl.checkSymptoms);
router.post('/book', requireAuth, ctrl.bookAppointment);
router.post('/waitlist', requireAuth, ctrl.joinWaitlist);
router.get('/mine', requireAuth, ctrl.myAppointments);
router.get('/queue/:doctorId', ctrl.getDoctorQueue);
router.get('/queue-position/:appointmentId', requireAuth, ctrl.getMyQueuePosition);
router.patch('/:appointmentId/start', requireAuth, requireRole('doctor', 'admin'), ctrl.startConsultation);
router.patch('/:appointmentId/complete', requireAuth, requireRole('doctor', 'admin'), ctrl.completeConsultation);
router.patch('/:appointmentId/cancel', requireAuth, ctrl.cancelAppointment);

module.exports = router;
