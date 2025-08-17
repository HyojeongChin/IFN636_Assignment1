// Pass Controller
const { v4: uuidv4 }= require( 'uuid' );
const Pass = require('../models/Pass');

exports.register = async( req, res ) =>{
    const { eventId } = req.body;
    if(!eventId) return res.status(400).json({ message: 'eventId requried '});

    const dup = await Pass.findOne({ 
        eventId, userId: req.user._id, 
        status: { $ne: 'revoked' } 
    });
    if (dup) return req.status(409).json({ message: 'Already registered', passId: dup._id });

    const pass = await Pass.create({ 
        eventId, userId: req.user._id,
        qrToken: uuidv4()
    });
    return res.status(201).json({ pass, qrData: pass.qrToken });
};

exports.getMine = async( req, res ) => {
  try {
    const uid = req.user?._id;
    const email = (req.user?.email || '').toLowerCase();
  
    const pass = await Pass.findOne({
      $or:[
        { user: uid},
        { email },
        { holderEmail: email },
      ],
      }).lean();
    if (!pass) return res.status(404).json({ message: 'No passes for current user' });
    res.json(pass);
  } catch (err) {
    console.error('[PASS] getMine error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id).lean();
    if (!pass) return res.status(404).json({ message: 'Pass not found' });
    res.json(pass);
  } catch (err) {
    console.error('[PASS] getById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.reissue = async (req, res) => {
  const pass = await Pass.findById(req.params.id);
  if (!pass) return res.status(404).json({ message: 'Not found' });

  pass.qrToken = uuidv4();
  pass.version += 1;
  pass.checkedInAt = undefined;
  pass.status = 'active';
  await pass.save();
  return res.json({ pass, qrData: pass.qrToken });
};

exports.revoke = async (req, res) => {
  const pass = await Pass.findByIdAndUpdate(req.params.id, { status: 'revoked' }, { new: true });
  if (!pass) return res.status(404).json({ message: 'Not found' });
  return res.json({ pass });
};