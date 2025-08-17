const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    verifyByQr,
} = require('../controllers/eventController');

const { registerAndGeneratePass } =
    require('../controllers/passController');

router.post('/', /*Protect,*/ createEvent);
router.get('/', /*Protect,*/ getEvents);

router.get('/scan/:qrCode', /*Protect,*/ verifyByQr);
router.get('/:id', /*Protect,*/ getEventById);
router.put('/:id', /*Protect,*/ updateEvent);
router.patch('/:id', /*Protect,*/ updateEvent);
router.delete('/:id', /*Protect,*/ deleteEvent);

module.exports = router;