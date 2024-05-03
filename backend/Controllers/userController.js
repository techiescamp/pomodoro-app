const User = require('../Model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const ObjectId = require('mongodb').ObjectId;

const signup = async (req, res) => {
    const exisitngUser = await User.findOne({ email: req.body.email });
    if (exisitngUser) {
        return res.status(200).json({
            message: "User already registered",
            success: "warning"
        })
    }
    const avt = req.body.displayName[0].toUpperCase()
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    const user = new User({
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
    return res.status(200).json({
        message: "Registered Successfully",
        success: true
    })
}

const login = async (req, res) => {
    const exisitngUser = await User.findOne({ email: req.body.email });
    if (exisitngUser) {
        const comparePassword = bcrypt.compareSync(req.body.password, exisitngUser.password);
        if (comparePassword) {
            const user_token = jwt.sign({ id: exisitngUser._id }, config.secrets.jwt_key, { expiresIn: 84600 });
            return res.status(200).json({
                message: "Logged in successfully",
                token: user_token,
                success: true
            })
        } else {
            return res.status(403).json({
                message: "Password is incorrect",
                success: false
            })
        }
    } else {
        return res.status(403).json({
            message: 'User does not exist. Create new user',
            success: false
        })
    }
}


const userInfo = async (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).json({
            message: "Invalid user credentials",
            auth: false
        })
    }
    jwt.verify(token, config.secrets.jwt_key, (err, result) => {
        if (err) {
            return res.status(403).json({
                message: "Invalid user credentials",
                auth: false
            })
        }
        User.findOne({ _id: new ObjectId(result.id) })
            .then(result => {
                res.status(200).json({ result })
            })
    })
}

const updateUser = async (req, res) => {
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
    return res.status(200).json({ message: "updated your profile", result: user })
}

module.exports = {
    signup: signup,
    login: login,
    userInfo: userInfo,
    updateUser: updateUser
}