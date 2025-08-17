const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const{expect} = require('chai');
const app = require('../server'); 
const User = require('../models/User');
const Event = require('../models/Event');
const Pass = require('../models/Pass'); 


function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });
}

describe('DEPG Pass + Scan e2e', () => {
  let mongo, admin, staff, user, ADMIN_TOK, STAFF_TOK, USER_TOK, eventId, passId, qrTokenOld, qrTokenNew;

  before(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri, { dbName: 'test' });

    admin = await User.create({ name:'Admin', email:'admin@test.com', password:'Passw0rd!', role:'admin' });
    staff = await User.create({ name:'Staff', email:'staff@test.com', password:'Passw0rd!', role:'staff' });
    user  = await User.create({ name:'User',  email:'user@test.com',  password:'Passw0rd!', role:'user' });

    ADMIN_TOK = `Bearer ${signToken(admin)}`;
    STAFF_TOK = `Bearer ${signToken(staff)}`;
    USER_TOK  = `Bearer ${signToken(user)}`;

    const evRes = await request(app)
      .post('/api/events')
      .set('Authorization', ADMIN_TOK)
      .send({ title:'Seminar A', startAt: new Date().toISOString(), location:'Hall A' })
      .expect(201).catch(()=>request(app).post('/api/events')
        .set('Authorization', ADMIN_TOK)
        .send({ title:'Seminar A', date: new Date().toISOString(), location:'Hall A' }).expect(201)); // ?�드�??��? ???��?

    eventId = (evRes.body._id || evRes.body.id);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('A1: register ??201 + pass & qrToken', async () => {
    const res = await request(app)
      .post('/api/passes/register')
      .set('Authorization', USER_TOK)
      .send({ eventId })
      .expect(201);

    expect(res.body.pass).toBeDefined();
    expect(res.body.qrData).toBeDefined();

    passId = res.body.pass._id;
    qrTokenOld = res.body.qrData;
  });

  it('A2: get mine ??200', async () => {
    const res = await request(app)
      .get(`/api/passes/${passId}`)
      .set('Authorization', USER_TOK)
      .expect(200);

    expect(res.body.pass._id).toBe(passId);
  });

  it('B1: scan granted once ??200 granted, second time denied(409)', async () => {
    
    const ok = await request(app)
      .post('/api/attendance/scan')
      .set('Authorization', STAFF_TOK)
      .send({ qrToken: qrTokenOld })
      .expect(200);
    expect(ok.body.result).toBe('granted');

    
    const denied = await request(app)
      .post('/api/attendance/scan')
      .set('Authorization', STAFF_TOK)
      .send({ qrToken: qrTokenOld })
      .expect(409);
    expect(denied.body.result).toBe('denied');
  });

  it('A3: reissue ??old token invalid, new token works', async () => {
    const re = await request(app)
      .put(`/api/passes/${passId}/reissue`)
      .set('Authorization', STAFF_TOK)
      .expect(200);

    qrTokenNew = re.body.qrData;
    expect(qrTokenNew).toBeDefined();
    expect(qrTokenNew).not.toBe(qrTokenOld);

    await request(app)
      .post('/api/attendance/scan')
      .set('Authorization', STAFF_TOK)
      .send({ qrToken: qrTokenOld })
      .expect(409); 

   
    const ok = await request(app)
      .post('/api/attendance/scan')
      .set('Authorization', STAFF_TOK)
      .send({ qrToken: qrTokenNew })
      .expect(200);
    expect(ok.body.result).toBe('granted');
  });

  it('A4: revoke ??scan denied', async () => {
    await request(app)
      .post(`/api/passes/${passId}/revoke`)
      .set('Authorization', ADMIN_TOK)
      .expect(200);

    const denied = await request(app)
      .post('/api/attendance/scan')
      .set('Authorization', STAFF_TOK)
      .send({ qrToken: qrTokenNew })
      .expect(403);
    expect(denied.body.result).toBe('denied');
  });
});

