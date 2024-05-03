const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: String,
    displayName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        trquired: true
    },
    avatar: {
        data: String,
        imgType: String
    },
    email: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;