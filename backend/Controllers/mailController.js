const nodemailer = require('nodemailer');
const config = require('../config');
const Subscribers = require('../Model/subscriberModel');
const logger = require('../Logger/logger');
const logFormat = require('../Logger/logFormat');
const metrics = require('../Observability/metrics');
const { tracer} = require('../Observability/jaegerTrace');

const subscribe = async (req, res) => {
    const span = tracer.startSpan('Subscription', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    metrics.httpRequestCounter.inc()
    
    const queryStartTime = process.hrtime();
    const existingUser = await Subscribers.findOne({email: req.body.email});
    //
    const queryEndTime = process.hrtime(queryStartTime);
    const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
    metrics.databaseQueryDurationHistogram.observe({operation: 'Subscribers - findOne', success: existingUser ? 'true': 'false'}, queryDuration / 1e9);
    
    const logResult = {
        userId: existingUser.userId,
        statusCode: res.statusCode,
    }
    if(existingUser) {
        span.addEvent('user already subscrbed!');
        logger.info('User already subscribed to our pomodoro app', logFormat(req, logResult))
        span.end();
        return res.status(200).send('Already regsitered to our newletter :)');
    } else {
        Subscribers.create({email: req.body['email']})
        const logResult = {
            emailId: req.body.email,
            statusCode: res.statusCode
        }
        span.addEvent('user subscribed to our pomodoro-app :)')
        logger.info('User subscribed to our pomodoro app', logFormat(req, logResult))
        span.end();
        return res.status(200).send('Thank you for subscribing to our newsletter!!');
    }

}

const sendMails = async(req, res) => {
    const span = tracer.startSpan('Subscription Mail', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    metrics.httpRequestCounter.inc()

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
            span.addEvent('subscription mail failed to sent')
            logger.error('Failed to sent email subscription', logFormat(req, logResult))
            span.end();
            console.log("Error in sending mail", err)
        }
        else {
            const logResult = {
                emailId: to,
                statusCode: res.statusCode
            }
            span.addEvent('subscription mail sent success :)')
            logger.info('Subscription Email sent to client', logFormat(req, logResult))
            span.end();
            return res.status(200).send("Sent mail successfully")
        }
    })
}

module.exports = {
    subscribe: subscribe,
    sendMails: sendMails
}