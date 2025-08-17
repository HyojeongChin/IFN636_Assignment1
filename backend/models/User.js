
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase:true },
    password: { type: String, required: true, minlength: 6, select: false },
    university: { type: String },
    address: { type: String },
    role: {type: String, enum: ['user', 'staff', 'admin'], default: 'user', index: true },
}, { timestamps: true } );

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = function (entered) {
    return bcrypt.compare(entered,this.password);
};

module.exports = mongoose.model('User', userSchema);