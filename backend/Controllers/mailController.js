const nodemailer = require('nodemailer');
const config = require('../config');
const Subscribers = require('../Model/subscriberModel');
const logger = require('../Logger/logger');
const logFormat = require('../Logger/logFormat');
const { databaseResponseTimeHistogram, counter } = require('../Observability/metrics');


const subscribe = async (req, res) => {
    const timer = databaseResponseTimeHistogram.startTimer();
    const exisitngUser = await Subscribers.findOne({email: req.body.email});
    const logResult = {
        userId: exisitngUser.userId,
        statusCode: res.statusCode,
    }
    if(exisitngUser) {
        timer({operation: "Subscription - you are already registered", success: 'true'})
        counter.inc()
        
        logger.info('User already subscribed to our pomodoro app', logFormat(req, logResult))
        return res.status(200).send('Already regsitered to our newletter :)');
    } else {
        Subscribers.create({email: req.body['email']})
        const logResult = {
            emailId: req.body.email,
            statusCode: res.statusCode
        }
        timer({operation: "Subscription - user subscribed successfully", success: 'true'})
        counter.inc()
        logger.info('User subscribed to our pomodoro app', logFormat(req, logResult))
        return res.status(200).send('Thank you for subscribing to our newsletter!!');
    }

}

const sendMails = async(req, res) => {
    const timer = databaseResponseTimeHistogram.startTimer();
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
            const logResult = {
                emailId: to,
                statusCode: res.statusCode
            }
            logger.error('Failed to sent email subscription', logFormat(req, logResult))
            console.log("Error in sending mail", err)
        }
        else {
            const logResult = {
                emailId: to,
                statusCode: res.statusCode
            }
            logger.info('Subscription Email sent to client', logFormat(req, logResult))
            timer({operation: "Subscription - sent to user", success: 'true'})
            counter.inc()
            return res.status(200).send("Sent mail successfully")
        }
    })
}

module.exports = {
    subscribe: subscribe,
    sendMails: sendMails
}