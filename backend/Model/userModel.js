const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: String,
    userId: String,
    displayName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        validate: {
            validator: function (value) {
              // Validate password only if it's present
              return value != null ? value.length > 6 : true;
            },
            message: 'Password should be longer than 6 characters'
        },
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