const express = require('express');
const mongoose = require('mongoose');
const cors  =require('cors');
const config = require('./config');
const TaskTracker = require('./Model/timerModel');
const PORT = config.server.port;

const app = express();

// connect to database
const mongoUrl = config.database.mongoUrl;
const db = mongoose.connect(mongoUrl);

// middlewares
app.use(express.json());
app.use(cors({
    method: "GET, POST, PUT, PATCH, DELETE"
}));


app.post('/user-tasks', async(req, res) => {
    const existingUser = await TaskTracker.findOne({"userData.email": req.body.userData.email})
    var payload = {
        userData: req.body.userData,
        userTasks: [{
            date: req.body.date,
            isFinished: req.body.isFinished,
            tasks: [...req.body.userTasks]
        }]
    }

    const filter = {'userData.email': {$in: [req.body.userData.email]}}
    const options = {new: true, upsert: true}

    // to add new user
    if(!existingUser) {
        const doc = await TaskTracker.create(payload)
        doc.save()
    }
    else {
        // if it is old-date?
        const oldT = existingUser.userTasks.findIndex(t => t.date === req.body.date)
        // if new date
        if(oldT === -1) {
            const oldTask = existingUser.userTasks.map(t => t)
            const newTask = {
                date: req.body.date,
                isFinished: req.body.isFinished,
                tasks: [...req.body.userTasks]
            }
            payload = {
                userTasks: [...oldTask, newTask]
            }
            // retain old task and add new task
            const doc = await TaskTracker.findOneAndUpdate(filter, payload, options)
            doc.save()
        } else {
            // if same date or date is found
            const targetDate = req.body.date.split(' ')[0]
            // replace old date tasks...
            const doc = await TaskTracker.findByIdAndUpdate(
                {'userTasks.date': targetDate},
                {$set: {'userTasks.$.tasks': req.body.userTasks}},
                {new: true}
            )
            doc.save()
        }
    }

    return res.send('Submitted');
})

app.post('/tasks', async(req, res) => {
    const existingUser = await TaskTracker.findOne({"userData.email": req.body.email})
    if(existingUser) {
        return res.send(existingUser) 
    } else {
        // logger.error('Tasklist did not sent to client')
    }
})

if(db) {
    app.listen(PORT, (err, client) => {
        if(err) {
            console.error('Server is not connected', err)
            // logger.error('Server is not connected', err)
        }
        // logger.info('server and database are connected')
        console.log('server connected at PORT: ', PORT)
        console.log('MongoDB database is connected.')        
    })
}

