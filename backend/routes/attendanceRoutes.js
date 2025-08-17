const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/attendanceController');

router.post('/scan', protect, authorize( 'staff', 'admin' ), ctrl.scan);
router.get('/summary', protect, ctrl.summary);
router.put('/logs/:id', protect, authorize( 'admin' ), ctrl.editLog);
router.delete('/logs/:id', protect, authorize( 'admin' ), ctrl.softDeleteLog);

router.post('/', protect, ctrl.checkIn);
router.get('/', protect, ctrl.getByEvent)
router.get('/:eventId', protect, ctrl.getByEvent);
router.patch('/:id', protect, ctrl.updateStatus);
router.delete('/:id', protect, ctrl.deleteAttendance);

module.exports = router;

