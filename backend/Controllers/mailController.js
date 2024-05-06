const nodemailer = require('nodemailer');
const config = require('../config');

const Subscribers = require('../Model/subscriberModel');
const logger = require('../Logger/logger');
const logFormat = require('../Logger/logFormat');

const subscribe = async (req, res) => {
    const exisitngUser = await Subscribers.findOne({email: req.body.email});
    if(exisitngUser) {
        return res.send('Already regsitered to our newletter :)');
    }
    await Subscribers.create({email: req.body['email']})
    //
    const logResult = {
        emailId: req.body.email,
        statusCode: res.statusCode
    }
    logger.info('User subscribed to our pomodoro app', logFormat(req, logResult))
    
    return res.send('Thank you for subscribing to our newsletter!!');
}

const sendMails = async(req, res) => {
    const { to, subject, html } = req.body;
    const transporter = nodemailer.createTransport({
        host: 'smtppro.zoho.in',
        secure: true,
        port: 465,
        auth: {
            user: config.mail.email,
            pass: config.mail.password
        }
    });
    const mailOptions = {
        from: config.mail.email,
        to: to.email,
        subject: subject,
        html: html
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            console.log("Error in sending mail", err)
        }
        else {
            //
            const logResult = {
                emailId: to,
                statusCode: res.statusCode
            }
            logger.info('Subscription Email sent to client', logFormat(req, logResult))

            return res.status(200).send("Sent mail successfully")
        }
    })
}

module.exports = {
    subscribe: subscribe,
    sendMails: sendMails
}