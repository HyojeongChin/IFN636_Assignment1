const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditSchema = new Schema(
    {
        at: { type: Date, default: Date.now},
        by: { type: Schema.Types.ObjectId, ref: 'User' },
        note: { type: String }
    },
    { _id: false }
);

const attendanceSchema = new mongoose.Schema(
    {
        eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        status: { type: String, enum: ['checked-in', 'denied'], default: 'checked-in', index: true},
        reason: { type: String },
        note: { type: String},
        scannedAt: { type: Date, default: Date.now, index: true },
        deleted: { type: Boolean, default: false, index: true },
        audit: {type: [auditSchema], default: [] } 
    },
    { timestamps: true}
);


module.exports = mongoose.model('Attendance', attendanceSchema);