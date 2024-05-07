const User = require('../Model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const ObjectId = require('mongodb').ObjectId;
const logger = require('../Logger/logger');
const logFormat =require('../Logger/logFormat');

async function generateUserId() {
    const uid = `u${Math.ceil(Math.random()*2000)}`;
    const checkUser = Boolean(await User.findOne({userId: uid}));

    if(uid === checkUser.userId) {
        return generateUserId();
    }
    return uid;
}

const signup = async (req, res) => {
    console.log('signup', req.headers['x-correlation-id']);

    const exisitngUser = await User.findOne({ email: req.body.email });
    if (exisitngUser) {
        return res.status(200).json({
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

    return res.status(200).json({
        message: "Registered Successfully",
        success: true
    })
}

const login = async (req, res) => {
    console.log('login', req.headers['x-correlation-id']);

    const exisitngUser = await User.findOne({ email: req.body.email });
    if (exisitngUser) {
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
            return res.status(401).json({
                message: "Password is incorrect",
                success: false
            })
        }
    } else {
        logger.info('User does not exist. Create new user', logFormat(req, res.statusCode))
        return res.status(401).json({
            message: 'User does not exist. Create new user',
            success: false
        })
    }
}


const verifyUser = async (req, res) => {
    console.log('userinfo', req.headers['x-correlation-id']);

    const token = req.headers['x-access-token'];
    if (!token) {
        //
        logger.error('Invalid token', logFormat(req, res.statusCode))
        
        return res.status(403).json({
            message: "Invalid token",
            auth: false
        })
    }
    jwt.verify(token, config.secrets.jwt_key, (err, result) => {
        if (err) {
            logger.error('Invalid token', logFormat(req, res.statusCode))

            return res.status(401).json({
                message: "Invalid user credentials",
                auth: false
            })
        }

        User.findOne({ _id: new ObjectId(result.id) })
            .then(result => {
                const payload = {
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
                
                res.status(200).json(payload)
            })
    })
}

const updateUser = async (req, res) => {
    console.log('updateuser', req.headers['x-correlation-id']);

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
    
    //
    const logResult = {
        userId: user.userId,
        statusCode: res.statusCode,
    }
    logger.info('updated user info', logFormat(req, logResult))

    return res.status(200).json({ message: "updated your profile", result: user })
}

module.exports = {
    signup: signup,
    login: login,
    verifyUser: verifyUser,
    updateUser: updateUser
}