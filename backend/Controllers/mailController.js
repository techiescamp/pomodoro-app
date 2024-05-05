const nodemailer = require('nodemailer');
const config = require('../config');

const Subscribers = require('../Model/subscriberModel');

const subscribe = async (req, res) => {
    const exisitngUser = await Subscribers.findOne({email: req.body.email});
    if(exisitngUser) {
        return res.send('Already regsitered to our newletter :)');
    }
    await Subscribers.create({email: req.body['email']})
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
            return res.status(200).send("Sent mail successfully")
        }
    })
}

module.exports = {
    subscribe: subscribe,
    sendMails: sendMails
}