const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema({
    userData: {
        userId: String,
        displayName: String,
        email: String
    },
    userTasks: []
});

const Timer = mongoose.model('Task_Tracker', timerSchema);

module.exports = Timer;