const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/users', requireAuth, requireRole('admin'), ctrl.listUsers);
router.get('/departments', ctrl.listDepartments);
router.get('/reports/daily', requireAuth, requireRole('admin'), ctrl.dailyReport);
router.get('/notifications/log', requireAuth, requireRole('admin'), ctrl.notificationLog);
router.post('/patients/walk-in', requireAuth, requireRole('admin'), ctrl.createWalkInPatient);

module.exports = router;
