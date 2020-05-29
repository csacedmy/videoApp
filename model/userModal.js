const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, lowercase: true },
    email: {
        type: String,  
        required: true,
        lowercase: true
    },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    phoneNo: { type: Number, required: true },
    userToken: {type: String},
    subscribe: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    deviceId: { type: String }
})

module.exports = mongoose.model('ClassUser', userSchema);
