const logger = require('../Logger/logger');
const TaskTracker = require('../Model/timerModel');

const userTasks = async (req, res) => {
    try {
        console.log('user-tasks', req.headers['x-correlation-id'])

        let existingUser = await TaskTracker.findOne({ "userData.email": req.body.userData.email })
        var payload = {
            userData: req.body.userData,
            userTasks: [{
                date: req.body.date,
                isFinished: req.body.isFinished,
                tasks: [...req.body.userTasks]
            }]
        }
        const filter = { 'userData.email': { $in: [req.body.userData.email] } }
        const options = { new: true, upsert: true }

        // to add new user
        if (!existingUser) {
            const doc = await TaskTracker.create(payload)
            doc.save()
        }
        else {
            // if it is old-date?
            const oldT = existingUser.userTasks.findIndex(t => t.date === req.body.date)
            // if new date
            if (oldT === -1) {
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
                    { 'userTasks.date': targetDate },
                    { $set: { 'userTasks.$.tasks': req.body.userTasks } },
                    { new: true }
                )
                doc.save()
            }
        }
        logger.info('Created user-task');
        return res.send('Submitted');
    }
    catch (err) {
        res.send('User needs to login to save tasks')
    }

}

const tasks = async (req, res) => {
    try {
        console.log('tasks', req.headers['x-correlation-id'])

        if(req.body.email) {
            const existingUser = await TaskTracker.findOne({ "userData.email": req.body.email })
            if(existingUser) {
                logger.info('sent task-list to browser')
                return res.send(existingUser)
            } else {
                // logger.error('Tasklist did not sent to client')
            }
        }
    }
    catch(err) {
        console.log(err)
    }
}



module.exports = {
    userTasks: userTasks,
    tasks: tasks
}