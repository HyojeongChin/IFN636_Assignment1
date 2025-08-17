const Event = require('../models/Event');
const crypto = require('crypto');

async function generateUniqueQr() {
    const makeToken = () => crypto.randomBytes(16).toString('base64url');
    let token = makeToken();
    while(await Event.findOne({ qrCode: token})) {
        token=makeToken();
    }
    return token;
}

//Event Create POST /api/events
exports.createEvent = async(req, res) => {
    try {
        const { title, date, location, qrCode } = req.body;
        if(!title || !date ||  !location) {
            return res.status(400).json({ message: 'title, date, location required'});
    }

    const payload = {
        title,
        date,
        location,
        qrCode: qrCode || (await generateUniqueQr()),
    };

    const event = await Event.create(payload);
    return res.status(201).json(event);
    } catch(err) {
        if (err && err.code === 11000){
            return res.status(409).json({ message: 'This is an existing QR code.', keyValue: err.keyValue});
        }
        return res.status(500).json({message: 'Server Error', error: err.message });
    }
};

//Read Event List GET /api/events
exports.getEvents = async(req, res) => {
    try{
        const{
            q,
            from,
            to,
            location,
            page = 1,
            limit =10,
            sort = 'date',
            order = 'asc',
        } = req.query;

        const filter = {};
        if (q) {
            filter.title = { $regex: q, $options: 'i' };
        }
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to) ;
        }
        if (location) {
            filter.location = location;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sortSpec = { [sort]: order === 'desc' ? -1 : 1 };
        
        const [items, total] = await Promise.all([
            Event.find(filter).sort(sortSpec).skip(skip).limit(Number(limit)),
            Event.countDocuments(filter),
        ]);

        return res.status(200).json({
            items,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit)),
                limit: Number(limit),
            },
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server Error', error:err.message});
    }
};

//Read GET /api/events/:id
exports.getEventById = async (req, res) => {
    try{
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({message: 'We cannot find the Event.' });
        return res.status(200).json(event);
    } catch(err) {
        return res.status(500).json({ message: 'Server Error', err: err.message});
    }
};

//Update Event Put /api/events/:id
exports.updateEvent = async (req, res) => {
    try {
        const update = {};
        ['title', 'date', 'location', 'qrCode'].forEach((k) => {
            if (k in req.body && req.body[k] !== undefined) update[k] = req.body[k];
        });

        const event = await Event.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        });

        if (!event) return res.status(404).json({ message: 'We cannot find the Event.'});
        return res.status(200).json(event);
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({ message: 'This is an existing QR code.', keyValue: err.keyValue});
        }
        return res.status(500).json({ message: 'Server Error', error: err.message});
    }
};

//Delete Event DELET /api/events/:id
exports.deleteEvent = async (req,res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'We cannot find the Event.' });
        return res.status(200).json({ message: 'Deleted' });
    } catch (err) {
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Validation QRcode GET /api/events/verify/:qrCode
exports.verifyByQr = async (req, res) => {
    try{
        const {qrCode} = req.params;
        const event = await Event.findOne({ qrCode});
        if (!event) return res.status(404).json({ valid: false, message: 'The QR code is invalid.' });
        return res.status(200).json({ valid: true, event });
    } catch (err) {
        return res.status(500).json({ message: 'Server Error', error: err.message});
    }
};

exports.registerEvent = exports.createEvent;