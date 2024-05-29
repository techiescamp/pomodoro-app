const User = require('../Model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const ObjectId = require('mongodb').ObjectId;
const logger = require('../Logger/logger');
const logFormat =require('../Logger/logFormat');
const { databaseResponseTimeHistogram, counter } = require('../Observability/metrics');

// for dau
let activeUser = new Set();

const storeActiveUsers = (req, res, next) => {
    if(userId) {
        activeUser.add(userId);
        console.log(`No.of users visited: ${activeUser.size}`)
    } else {
        res.status(400).send('user ID required')
    }
    const resetActiveUser = () => {
        activeUser = new Set();
        console.log('active user reset')
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
    // start metrics
    const timer = databaseResponseTimeHistogram.startTimer();

    const exisitngUser = await User.findOne({ email: req.body.email });
    if(exisitngUser) {
        timer({operation: "New Registration", success: "false"});
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
    await user.save();
    
    //
    const logResult = {
        userId: user.userId,
        statusCode: res.statusCode,
    }
    logger.info('user registered success', logFormat(req, logResult))
    timer({operation: "New Registration", success: "true"});
    counter.inc();
    return res.status(200).json({
        message: "Registered Successfully",
        xCorrId: req.headers['x-correlation-id'],
        success: true
    })
}

const login = async (req, res) => {
    //start metrics
    const timer = databaseResponseTimeHistogram.startTimer();
    const exisitngUser = await User.findOne({ email: req.body.email });

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
            logger.info('user logged in', logFormat(req, logResult))
            timer({operation: "User verification", success: "true"})
            counter.inc()
            return res.status(200).json({
                token: user_token,
                success: true
            })
        } else {
            const logResult = {
                userId: exisitngUser.userId,
                statusCode: res.statusCode,
            }
            logger.info('Password is incorrect', logFormat(req, logResult))
            timer({operation: "User verification - incorrect password", success: "false"})
            counter.inc()
            return res.status(401).json({
                message: "Password is incorrect",
                success: false
            })
        }
    } else {
        logger.info('User does not exist. Create new user', logFormat(req, res.statusCode))
        timer({operation: "User verification - user existed", success: "false"})
        counter.inc()
        return res.status(401).json({
            message: 'User does not exist. Create new user',
            success: false
        })
    }
}


const verifyUser = async (req, res) => {
    // start metrics
    const timer = databaseResponseTimeHistogram.startTimer();
    const token = req.headers['X-Access-Token'];
    if (!token) {
        //
        logger.error('Invalid token', logFormat(req, res.statusCode))
        timer({operation: "User login - invalid token", success: "false"});
        counter.inc()
        return res.status(403).json({
            message: "Invalid token",
            auth: false
        })
    }
    jwt.verify(token, config.secrets.jwt_key, (err, result) => {
        if (err) {
            logger.error('Invalid token', logFormat(req, res.statusCode))
            timer({operation: "User login - invalid token", success: "false"});
            counter.inc();
            return res.status(401).json({
                message: "Invalid user credentials",
                auth: false
            })
        }

        User.findOne({ _id: new ObjectId(result.id) })
            .then(result => {
                const payload = {
                    xCorrId: req.headers['X-Correlation-ID'],
                    message:'userlogged in successfully',
                    success: true,
                    avatar: result.avatar,
                    googleId: result.googleId,
                    userId: result.userId,
                    email: result.email,
                    displayName: result.displayName 
                }
                //
                const logResult = {
                    userId: result.userId,
                    statusCode: res.statusCode,
                }
                logger.info('user info sent to client', logFormat(req, logResult))
                timer({operation: "User logged in success", success: "true"});
                counter.inc()
                res.status(200).json(payload)
            })
    })
}

const updateUser = async (req, res) => {
    //start metrics
    const timer = databaseResponseTimeHistogram.startTimer();
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
    const user = await User.findOneAndUpdate({ email: reqEmail }, update, { new: true })
    
    // logg
    const logResult = {
        userId: user.userId,
        statusCode: res.statusCode,
    }
    logger.info('updated user info', logFormat(req, logResult))
    timer({operation: "User update profile", success: "true"});
    counter();
    return res.status(200).json({ message: "updated your profile", result: user })
}

module.exports = {
    signup: signup,
    login: login,
    verifyUser: verifyUser,
    updateUser: updateUser
}