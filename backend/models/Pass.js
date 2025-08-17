const mongoose = require('mongoose');
const{ Schema } = mongoose;

const passSchema = new Schema({
    eventId: {type: Schema.Types.ObjectId, ref: 'Event', requried: true},
    userId: {type: Schema.Types.ObjectId, ref: 'Event', requried: true},
    qrToken: { type: String, requried: true, unique: true },
    status:{ type: String, enum: [ 'active', 'revoked'], default: 'active' },
    checkedInAt: {type: Date },
    version: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Pass', passSchema)