const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Pass = require('../models/Pass');


//Scan Pass POST /api/attendance/scan
const scanPass = async (req, res) => {
    try{
        const { qrPayload } = req.body;
        if(!qrPayload) {
            return res.status(400).json({ message: 'qrPayload is required' });
        }
        
        const eventDoc = await Event.findOne({ qrCode: qrPayload });
        if (!eventDoc) {
            return res.status(403).json({ result: 'denied', reason: 'invalid' });
        }
        if (eventDoc.usedAt) {
            return res.status(400).json({ result: 'denied', reason: 'already_used' });
        }

        eventDoc.usedAt = new Date();
        await eventDoc.save();

        await Attendance.create({
            eventId: eventDoc._id,
            scannedBy: req.user?.id || null,
            result: 'granted',
            reason: null,
            createdAt: new Date(),
            status: 'checked-in',  
        });

        return res.status(200).json({ result: 'granted' });
    } catch (err) {
        return res.status(500).json({ message: 'DB Error'});
    }
};

//Create check-in POST /api/attendance
const checkIn = async (req, res) => {
    try {
        const { eventId, status = 'checked-in' } = req.body;
        if (!eventId) return res.status(400).json({ message: 'eventId is required' });

        const exists = await Event.findById(eventId);
        if (!exists) return res.status(404).json({ message: 'Event not found' });

        const doc= await Attendance.create({ eventId, status, scannedAt: new Date() });
        return res.status(201).json(doc);
    } catch (err) {
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

//Read attendace list GET /api/attendance/event/:eventId
const getByEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId || req.query.eventId;
        if(!eventId) return res.status(400).json({ message: 'eventId required' });

        const items = await Attendance.find({ eventId }).sort({ createdAt: -1 });
        return res.status(200).json({ items, count: items.length });
    } catch (err){
        return res.status(500).json({ message: 'Server Error', error: err.message});
    }
};

//Update the status PATCH/ api/attendace/:id
const updateStatus = async (req, res) => {
    try{
        const { status } = req.body;
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'id param required' });

        const updated = await Attendance.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(400).json({ message: 'Attendance not found' });
        return res.status(200).json(updated);
    } catch (err) {
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

//Delete attendance DELETE /api/attendance/:id
const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const removed = await Attendance.findByIdAndDelete(id);
        if (!removed) return res.status(404).json({ message: 'Attendance not found'});
        return res.status(200).json({ message: 'Deleted' });
    } catch (err) {
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Scan Checkein
const scan = async (req, res, next) => {
  try {
    const qr = req.body.qrToken || req.body.qrData || req.body.qrPayload;
    if (!qr) return res.status(400).json({ result: 'denied', reason: 'qrToken required' });

    const pass = await Pass.findOne({ $or: [{ qrToken: qr }, { qrData: qr }] });
    if (!pass) {
      //await Attendance.create({ eventId: null, status: 'denied', scannedAt: new Date() });
      return res.status(404).json({ result: 'denied', reason: 'invalid_qr' });
    }

    if (pass.status === 'revoked') {
      await Attendance.create({ eventId: pass.eventId, userId: pass.userId, status: 'denied', scannedAt: new Date() });
      return res.status(403).json({ result: 'denied', reason: 'revoked' });
    }

    if (pass.checkedInAt) {
      await Attendance.create({ eventId: pass.eventId, userId: pass.userId, status: 'denied', scannedAt: new Date() });
      return res.status(409).json({ result: 'denied', reason: 'already_used' });
    }

    pass.checkedInAt = new Date();
    await pass.save();

    await Attendance.create({ eventId: pass.eventId, userId: pass.userId, status: 'checked-in', scannedAt: new Date() });
    return res.json({ result: 'granted' });
  } catch (e) {
    next(e);
  }
};

const summary = async (req, res, next) => {
  try {
    const eventId = req.query.eventId || req.params.eventId; 
    if (!eventId) return res.status(400).json({ message: 'eventId required' });

    const [totalRegistrations, checkIns, revoked, denials] = await Promise.all([
      Pass.countDocuments({ eventId }),
      Pass.countDocuments({ eventId, checkedInAt: {$ne: null } }),
      Pass.countDocuments({ eventId, status: 'revoked' }),
      Attendance.countDocuments({ eventId, status: 'denied' }),
    ]);

    return res.json({ totalRegistrations, checkIns, revoked, denials });
  } catch (e) {
    next(e);
  }
};

const editLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Attendance.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Log not found' });
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};

const softDeleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if ('deleted' in Attendance.schema.paths) {
      const updated = await Attendance.findByIdAndUpdate(id, { deleted: true }, { new: true });
      if (!updated) return res.status(404).json({ message: 'Log not found' });
      return res.json({ id: updated._id, deleted: true });
    } else {
      const removed = await Attendance.findByIdAndDelete(id);
      if (!removed) return res.status(404).json({ message: 'Log not found' });
      return res.json({ id: removed._id, deleted: true });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = { 
    checkIn, getByEvent, updateStatus, deleteAttendance, scan, summary, editLog, softDeleteLog
};

