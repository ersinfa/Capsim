const nodemailer = require('nodemailer').createTransport({
    host: '192.168.17.5',
    // BUG-2400, nodemailer is throwing self signed certificate error. 
    // Going to tell the mailer that we dont have valid certificate.
    tls: {
        rejectUnauthorized: false
    },
    port: 25
})

module.exports = nodemailer
