const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/passController');

router.post('/register', protect, ctrl.register);                          
router.get('/me', protect, ctrl.getMine);                               

router.get('/:id/', protect, authorize('staff', 'admin'), ctrl.getById)
router.put('/:id/reissue', protect, authorize('staff','admin'), ctrl.reissue); 
router.post('/:id/revoke', protect, authorize('admin'), ctrl.revoke);      

module.exports = router;