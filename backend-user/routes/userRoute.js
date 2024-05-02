const express = require('express');
const { signup, login, userInfo, updateUser } = require('../controllers/userController');

const route = express.Router();

route.post('/signup'. signup);
route.post('/login', login);
route.post('/userInfo', userInfo);
route.post('/updateUser', updateUser);

module.exports = route;