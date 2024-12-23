const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, required: true, default: false },
    registrationCode: { type: String, default: null },
    isRegistered: { type: Boolean, required: true, default: false },
});

const Verification = mongoose.model('Verification', verificationSchema);

module.exports = { Verification };
