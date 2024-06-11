const express = require('express');

const { checkTodayTasks, createTask, tasks } = require('../Controllers/timerController');
const { signup, login, verifyUser, updateUser } = require('../Controllers/userController');
const { failedRoute, successRoute, getGoogleAuth, googleLogout, getGoogleCallback } = require('../Controllers/authController');
const { sendMails, subscribe } = require('../Controllers/mailController');


const route = express.Router();

// timer route
route.post('/checkTodayTasks', checkTodayTasks)
route.post('/createTask', createTask);
route.post('/tasks', tasks);


// user routes
route.post('/user/signup', signup);
route.post('/user/login', login);
route.post('/user/verifyUser', verifyUser);
route.post('/user/updateUser', updateUser);
// for dau
// route.get('/visits', visits);

// google routes
route.get('/auth/login/failed', failedRoute);
route.get('/auth/login/success', successRoute);
route.get('/auth/google', getGoogleAuth);
route.get('/auth/google/callback', getGoogleCallback);
route.get('/auth/logout', googleLogout);

// mail routes for subscriptions
route.post('/subscribe', subscribe);
route.post('/send-mail', sendMails);


module.exports = route;