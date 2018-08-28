const mongoose = require('mongoose');
const { Schema } = mongoose;

const TokenSchema = new Schema({
    token: {type: String, required: true, unique: true},
    creationTime: {type: Date, default: Date.now},
    duration: {type: Number, default: 900},
    associatedIP: {type: String, required: true},
    isActive: {type: Boolean, required: true},
    sessionType: {type: String, required: true},
    associatedAddress: {type: String, default: "0x0"}
});

module.exports = mongoose.model('Token', TokenSchema);
