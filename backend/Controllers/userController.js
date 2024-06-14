const User = require('../Model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const ObjectId = require('mongodb').ObjectId;
const logger = require('../Logger/logger');
const logFormat = require('../Logger/logFormat');
const { tracer } = require('../Observability/jaegerTrace');
const metrics = require('../Observability/metrics');
 
// for dau
let activeUser = new Set();

const storeActiveUsers = (userId) => {
    if(userId) {
        activeUser.add(userId);
        console.log(`No.of users visited: ${activeUser.size}`)
        // set activeuser gauge
        metrics.activeUsersGauge.set(activeUser.size);
    } else {
        res.status(400).send('user ID required')
    }
    const resetActiveUser = () => {
        activeUser = new Set();
        console.log('active user reset');
        metrics.activeUsersGauge.set(0)
    }
    const scheduleDailyReset = () => {
        const now = new Date();
        const midnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0, 0, 0, 0
        );
        const timeLeft = midnight - now;
        setTimeout(() => {
            resetActiveUser();
            scheduleDailyReset();
        }, timeLeft)
    }
    scheduleDailyReset();
    return activeUser
}

// unique user-id
async function generateUserId() {
    const uid = `u${Math.ceil(Math.random()*2000)}`;
    const checkUser = Boolean(await User.findOne({userId: uid}));

    if(uid === checkUser.userId) {
        return generateUserId();
    }
    return uid;
}

const signup = async (req, res) => {
    //
    const span = tracer.startSpan('Signup', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    // start metrics
    metrics.httpRequestCounter.inc();

    try {
        const queryStartTime = process.hrtime();
        const exisitngUser = await User.findOne({ email: req.body.email });
        
        if(exisitngUser) {
            span.addEvent('User already registered');
            return res.status(400).json({
                message: "User already registered",
                success: "warning"
            })
        }
        const avt = req.body.displayName[0].toUpperCase()
        const hashedPassword = bcrypt.hashSync(req.body.password, 8);
        const uid = await generateUserId()

        const user = new User({
            userId: uid,
            displayName: req.body.displayName,
            password: hashedPassword,
            email: req.body.email,
            googleId: '',
            avatar: {
                data: avt,
                imgType: 'text'
            }
        });
        span.addEvent('User registered successfully');
        await user.save();
        //
        const queryEndTime = process.hrtime(queryStartTime);
        const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
        metrics.databaseQueryDurationHistogram.observe({operation: 'new user - findOne', success: exisitngUser ? 'false': 'true'}, queryDuration / 1e9);
        
        //
        const logResult = {
            userId: user.userId,
            statusCode: res.statusCode,
        }
        logger.info('user registered success', logFormat(req, logResult));
        //
        metrics.newUsersCounter.inc();
        return res.status(200).json({
            message: "Registered Successfully",
            xCorrId: req.headers['x-correlation-id'],
            success: true
        })
    } catch(err) {
        span.addEvent('Error during registration', {'error': err.message});
        metrics.errorCounter.inc();
        logger.error('Error in registration')
        span.end();
    }
}

const login = async (req, res) => {
    //
    const span = tracer.startSpan('Login', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    metrics.httpRequestCounter.inc();

    try {
        const queryStartTime = process.hrtime();
        const exisitngUser = await User.findOne({ email: req.body.email });
        //
        const queryEndTime = process.hrtime(queryStartTime);
        const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
        metrics.databaseQueryDurationHistogram.observe({operation: 'user login - findOne', success: exisitngUser ? 'true': 'false'}, queryDuration / 1e9);
        
        if (exisitngUser) {
            // for dau
            storeActiveUsers(exisitngUser.userId);
            const comparePassword = bcrypt.compareSync(req.body.password, exisitngUser.password);
            if (comparePassword) {
                const payload = {
                    id: exisitngUser._id,
                    userId: exisitngUser.userId
                }
                const user_token = jwt.sign(payload, config.secrets.jwt_key, { expiresIn: 84600 });            
                //
                const logResult = {
                    userId: exisitngUser.userId,
                    statusCode: res.statusCode,
                }
                span.addEvent('user logged', { requestBody: JSON.stringify(logResult) })
                logger.info('user logged in info is passed to server', logFormat(req, logResult))
                span.end();
                return res.status(200).json({
                    token: user_token,
                    success: true
                })
            } else {
                const logResult = {
                    userId: exisitngUser.userId,
                    statusCode: res.statusCode,
                }
                span.addEvent('login password incorrect', { requestBody: JSON.stringify(logResult) })
                logger.info('Password is incorrect', logFormat(req, logResult));
                metrics.errorCounter.inc();
                span.end();
                return res.status(401).json({
                    message: "Password is incorrect",
                    success: false
                })
            }
        } else {
            span.addEvent('wrong user email and password', { requestBody: JSON.stringify(req.body) })
            logger.info('User does not exist. Create new user', logFormat(req, res.statusCode))
            metrics.errorCounter.inc();
            span.end();
            return res.status(401).json({
                message: 'User does not exist. Create new user',
                success: false
            })
        }
    } catch(err) {
        span.addEvent('Error during login', {'error': err.message});
        metrics.errorCounter.inc();
        span.end();
    }
}


const verifyUser = async (req, res) => {
    const span = tracer.startSpan('VerifyUser', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    // start metrics
    metrics.httpRequestCounter.inc()

    const token = req.headers['x-access-token'];
    if (!token) {
        //
        span.addEvent('Invalid login token');
        logger.error('Invalid token', logFormat(req, res.statusCode))
        span.end();
        return res.status(403).json({
            message: "Invalid token",
            auth: false
        })
    }
    jwt.verify(token, config.secrets.jwt_key, async (err, result) => {
        if (err) {
            span.addEvent('valid token', {requestBody: JSON.stringify(result)});
            logger.error('Token generated but user is not verified', logFormat(req, res.statusCode))
            metrics.errorCounter.inc();
            span.end()
            return res.status(401).json({
                message: "Invalid user credentials",
                auth: false
            })
        }
        try{
            const queryStartTime = process.hrtime();
            const user = await User.findOne({ _id: new ObjectId(result.id) });
            //
            const queryEndTime = process.hrtime(queryStartTime);
            const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
            metrics.databaseQueryDurationHistogram.observe({operation: 'user login - findOne', success: user ? 'true': 'false'}, queryDuration / 1e9);

            const payload = {
                xCorrId: req.headers['x-correlation-id'],
                message: 'user logged in successfully',
                success: true,
                avatar: user.avatar,
                googleId: user.googleId,
                userId: user.userId,
                email: user.email,
                displayName: user.displayName
            }
            //
            const logResult = {
                userId: user.userId,
                statusCode: res.statusCode,
            }
            span.addEvent('user profile sent to browser', {requestBody: JSON.stringify(logResult)});
            logger.info('user info sent to client', logFormat(req, logResult))
            span.end();
            res.status(200).json(payload)
        }
        catch (err) {
            span.addEvent('Error in authenticating user', { 'error': err.message });
            metrics.errorCounter.inc();
            span.end();
        }
    })
}

const updateUser = async (req, res) => {
    const span = tracer.startSpan('UpdateUser', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    //start metrics
    metrics.httpRequestCounter.inc();

    try {
        const reqEmail = req.body.email;
        const reqData = req.body;
        let hashedPassword, update;
        if (reqData.password) {
            hashedPassword = bcrypt.hashSync(reqData.password, 8);
            update = {
                displayName: reqData.displayName,
                password: hashedPassword
            }
        } else {
            update = {
                displayName: reqData.displayName,
            }
        }
        const queryStartTime = process.hrtime();
        const user = await User.findOneAndUpdate({ email: reqEmail }, update, { new: true })
        //
        const queryEndTime = process.hrtime(queryStartTime);
        const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
        metrics.databaseQueryDurationHistogram.observe({operation: 'update user - findOneAndUpdate', success: user ? 'true': 'false'}, queryDuration / 1e9);
        
        // logg
        const logResult = {
            userId: user.userId,
            statusCode: res.statusCode,
        }
        span.addEvent('upated user profile', {requestBody: JSON.stringify(logResult)});
        logger.info('updated user info', logFormat(req, logResult))
        span.end();
        return res.status(200).json({ message: "updated your profile", result: user })
    } catch(err) {
        span.addEvent('Error in updating user', {'error': err.message});
        logger.error('Error in updating user info')
        metrics.errorCounter.inc();
        span.end();
    }
}


module.exports = {
    signup: signup,
    login: login,
    verifyUser: verifyUser,
    updateUser: updateUser
}