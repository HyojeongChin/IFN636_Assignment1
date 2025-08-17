//EventController Test

const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const Event = require('../models/Event'); // Import Event model
const { createEvent } = require('../controllers/eventController'); // Import function
const { expect } = chai;

describe('Event Controller - registerEvent', () => {
    afterEach(() => sinon.restore());

    it('should create a event registration successfully', async () => {
        const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { 
            title: 'Career Expo',
            date: '2025-08-30',
            location: 'GP-G Block',
            qrCode: 'qr-data'
            },
        };

        const created = Object.assign(
            { _id: new mongoose.Types.ObjectId() },
            req.body
        );
        const createStub = sinon.stub(Event, 'create').resolves(created);

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await createEvent(req, res);

        const arg0 = createStub.firstCall.args[0] || {};
        expect(arg0).to.include({
            title: req.body.title,
            location: req.body.location,
            qrCode: req.body.qrCode,
        });
        expect(arg0).to.have.property('date');

        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith(created)).to.be.true;
    });

    it('should return 500 if an error occurs', async () => {
        sinon.stub( Event, 'create').rejects(new Error('DB Error'));
    
        const req = {
            user: { id: new mongoose.Types.ObjectId() },
            body: { 
                title: 'Career Expo',
                date: '2025-08-30',
                location: 'GP-G Block',
                qrCode: 'qr-data'
            },
        };

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await createEvent( req, res );

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'Server Error', error: 'DB Error' })).to.be.true;
    });
});
