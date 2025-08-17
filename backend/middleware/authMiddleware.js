
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
   const hdr = req.headers.authorization || '';
   if(!hdr.startsWith('Bearer')) {
        return res.status(401).json({ message: 'Not authorized, no token '});
    }
    const token = hdr.split(' ')[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user= await User.findById(decoded.id).select('-password');
        if(!user) return res.status(401).json({ message: 'Not authorized, user not found' });
        req.user = user;
        next();
    } catch(err) { 
        return res.status(401).json({ message: 'Not authorized, token failed'});
   }
};

const authorize = (...roles) => (req, res, next) => {
    if(!req.user) return res.status(401).json({ message: 'Not authorized' });
    const role = (req.user.role || '').toLowerCase();
    const allowed = roles.map(r => (r||'').toLowerCase());
    if(allowed.length > 0 && !allowed.includes(role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

module.exports = { protect, authorize };
