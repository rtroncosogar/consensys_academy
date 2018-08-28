const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    authToken: {type: String, unique: true},
    creationTime: {type: Date, default: Date.now},
    wallet: {type: String, required: true, unique: true},
    accountType: {type: String, required: true}
});

module.exports = mongoose.model('User', UserSchema);
