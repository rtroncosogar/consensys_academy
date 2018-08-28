const mongoose = require('mongoose');
const { Schema } = mongoose;

const AuthorizationSchema = new Schema({
    authToken: {type: String, required: true, unique: true},
    emissionTime: {type: Date, default: Date.now},
    duration: {type: Number, default: 900}
});

module.exports = mongoose.model('Authorization', AuthorizationSchema);
