const logger = require('../Logger/logger');
const logFormat = require('../Logger/logFormat');
const TaskTracker = require('../Model/timerModel');
const { databaseResponseTimeHistogram, counter } = require('../Observability/metrics');
const { tracer } = require('../Observability/jaegerTrace');

const checkTodayTasks = async (req, res) => {
    const span = tracer.startSpan('check today tasks', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    const timer = databaseResponseTimeHistogram.startTimer();
    const presentDate = new Date().toLocaleString('en-US').split(", ")[0]
    if(presentDate === req.body.date) {
        let existingUser = await TaskTracker.find({"userTasks.date": req.body.date, "userData.email": req.body.email }, {"userTasks": 1})
        // Accessing the userTasks array from each document
        const userTasksArrays = existingUser.map(doc => doc.userTasks);
        // Flatten the array of arrays into a single array of userTasks objects
        const allUserTasks = userTasksArrays.flat();
        // Filtering userTasks objects based on the presentDate
        const userTasksForPresentDate = allUserTasks.filter(task => task.date === presentDate);
        timer({operation: 'Checking todays tasks', success: 'true'});
        counter.inc();
        span.end();
        res.status(200).send(userTasksForPresentDate[0] ? userTasksForPresentDate[0].tasks : null);
    }
}

const userTasks = async (req, res) => {
    const span = tracer.startSpan('create new task', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    const timer = databaseResponseTimeHistogram.startTimer();
    try {
        let existingUser = await TaskTracker.findOne({ "userData.email": req.body.userData.email })
        var payload = {
            userData: req.body.userData,
            userTasks: [{
                date: req.body.date,
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
            // check whether its an old-date or new date?
            const oldT = existingUser.userTasks.findIndex(t => t.date === req.body.date)
            // if new date
            if (oldT === -1) {
                // const oldTask = existingUser.userTasks.map(t => t)
                const newTask = {
                    date: req.body.date,
                    tasks: [...req.body.userTasks]
                }
                existingUser.userTasks.push(newTask)
            } else {
                // if same date or date is found
                const task = existingUser.userTasks[oldT].tasks;
                task.push(...payload.userTasks[0].tasks);
                const uniqueTasks = task.filter((obj, index) => index === task.findIndex(o => o.id === obj.id))
                existingUser.userTasks[oldT].tasks = uniqueTasks;
            }
            const doc = await TaskTracker.findOneAndUpdate(filter, existingUser, options);
            doc.save();
        }
        //
        const logResult = {
            emailId: req.body.userData.email,
            statusCode: res.statusCode,
        }
        logger.info('Created user-task', logFormat(req, logResult));
        timer({operation: "Tasks are saved in database", success: 'true'})
        counter.inc()
        span.end();
        return res.status(200).send('Submitted');
    }
    catch (err) {
        span.addEvent('Error during creating tasks', {'error': err.message});
        logger.error('Error exception in user-tasks', err);
        timer({operation: 'Exception error', success: 'false'})
        counter.inc();
        span.end();
        res.status(400).send('User needs to login to save tasks')
    }
}

const tasks = async (req, res) => {
    const span = tracer.startSpan('User task list', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    try {
        const timer = databaseResponseTimeHistogram.startTimer();
        const existingUser = await TaskTracker.findOne({ "userData.email": req.body.email })
        const logResult = {
            userId: req.body.useId,
            emailId: req.body.email,
            statusCode: res.statusCode,
        }
        if (existingUser) {
            logger.info('sent task-list to browser', logFormat(req, logResult));
            timer({operation: 'Tasks are sent to client', success: 'true'})
            counter.inc()
            span.end();
            return res.status(200).send(existingUser)
        } else {
            timer({operation: 'Failed to sent Tasks to the client', success: 'false'})
            counter.inc()
            span.end();
            logger.error('Wrong email-id. Please log again', logFormat(req, req.body.email))
        }
    }
    catch (err) {
        span.addEvent('Error during new task creation', {'error': err.message});
        timer({operation: 'Exception error', success: 'false'})
        counter.inc()
        span.end();
        logger.error('Tasklist did not sent to client', logFormat(req, err))
    }
}



module.exports = {
    checkTodayTasks: checkTodayTasks,
    userTasks: userTasks,
    tasks: tasks
}