const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: {type: Date, required: true},
    location: {type: String, required: true},
    qrCode: {type: String, required: true, unique: true, index: true},
    createdAt: {type: Date, default: Date.now}
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt'}
}
);

module.exports = mongoose.model('Event', eventSchema);