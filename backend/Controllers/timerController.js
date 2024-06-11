const logger = require('../Logger/logger');
const logFormat = require('../Logger/logFormat');
const TaskTracker = require('../Model/timerModel');
const { tracer } = require('../Observability/jaegerTrace');
const metrics = require('../Observability/metrics');

const checkTodayTasks = async (req, res) => {
    const span = tracer.startSpan('check today tasks', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    metrics.httpRequestCounter.inc();
    
    const presentDate = new Date().toLocaleString('en-US').split(", ")[0]
    if(presentDate === req.body.date) {
        const queryStartTime = process.hrtime();
        let existingUser = await TaskTracker.find({"userTasks.date": req.body.date, "userData.email": req.body.email }, {"userTasks": 1})
        //
        const queryEndTime = process.hrtime(queryStartTime);
        const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
        metrics.databaseQueryDurationHistogram.observe({operation: 'user logged again today - find', success: existingUser ? 'true' : 'false'}, queryDuration / 1e9);    
        
        // Accessing the userTasks array from each document
        const userTasksArrays = existingUser.map(doc => doc.userTasks);
        // Flatten the array of arrays into a single array of userTasks objects
        const allUserTasks = userTasksArrays.flat();
        // Filtering userTasks objects based on the presentDate
        const userTasksForPresentDate = allUserTasks.filter(task => task.date === presentDate);
        span.end();
        res.status(200).send(userTasksForPresentDate[0] ? userTasksForPresentDate[0].tasks : null);
    }
}

const createTask = async (req, res) => {
    metrics.httpRequestCounter.inc()
    const span = tracer.startSpan('create new task', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    try {
        const queryStartTime = process.hrtime();
        let existingUser = await TaskTracker.findOne({ "userData.email": req.body.userData.email })
        //
        const queryEndTime = process.hrtime(queryStartTime);
        const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
        metrics.databaseQueryDurationHistogram.observe({operation: 'create new task - findOne', success: existingUser ? 'true' : 'false'}, queryDuration / 1e9);

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
            const queryStartTime = process.hrtime();
            const doc = await TaskTracker.create(payload);
            doc.save();
            //
            const queryEndTime = process.hrtime(queryStartTime);
            const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
            metrics.databaseQueryDurationHistogram.observe({operation: 'create new task - create', success: 'true'}, queryDuration / 1e9);
            metrics.tasksCompletedCounter.inc();
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
            const queryStartTime = process.hrtime();
            const doc = await TaskTracker.findOneAndUpdate(filter, existingUser, options);
            doc.save();
            //
            const queryEndTime = process.hrtime(queryStartTime);
            const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
            metrics.databaseQueryDurationHistogram.observe({operation: 'create new task - findOneandUpdate', success: doc ? 'true': 'false'}, queryDuration / 1e9);
        }
        //
        const logResult = {
            emailId: req.body.userData.email,
            statusCode: res.statusCode,
        }
        logger.info('Created user-task', logFormat(req, logResult));
        span.end();
        metrics.tasksCompletedCounter.inc();
        return res.status(200).send('Submitted');
    }
    catch (err) {
        span.addEvent('Error during creating tasks', {'error': err.message});
        logger.error('Error exception in user-tasks', err);
        metrics.errorCounter.inc();
        span.end();
        res.status(400).send('User needs to login to save tasks')
    }
}

const tasks = async (req, res) => {
    const span = tracer.startSpan('User task list', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    metrics.httpRequestCounter.inc()
    
    try {
        const queryStartTime = process.hrtime();
        const existingUser = await TaskTracker.findOne({ "userData.email": req.body.email })
        //
        const queryEndTime = process.hrtime(queryStartTime);
        const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
        metrics.databaseQueryDurationHistogram.observe({operation: 'Task list - findOne', success: existingUser ? 'true': 'false'}, queryDuration / 1e9);
        
        const logResult = {
            userId: req.body.useId,
            emailId: req.body.email,
            statusCode: res.statusCode,
        }
        if (existingUser) {
            logger.info('sent task-list to browser', logFormat(req, logResult));
            span.end();
            return res.status(200).send(existingUser)
        } else {
            metrics.errorCounter.inc()
            span.end();
            logger.error('Wrong email-id. Please log again', logFormat(req, req.body.email))
        }
    }
    catch (err) {
        span.addEvent('Error during new task creation', {'error': err.message});
        metrics.errorCounter.inc()
        span.end();
        logger.error('Tasklist did not sent to client', logFormat(req, err))
    }
}


module.exports = {
    checkTodayTasks: checkTodayTasks,
    createTask: createTask,
    tasks: tasks
}