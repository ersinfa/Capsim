const nodemailer = require('./mailer');

//Handle not found errors
const handleNotFound = (err, req, res) => {
    if( req.xhr ) return res.status(404).end()
    else return res.redirect(`http://${process.env.API_WW3_HOSTNAME}/login/?logout=1`)
}

//Handle all other errors
const handleCommonErrors = (err, req, res) => {

    const errorDetails = {
        host: req.headers.host,
        message: err.message,
        referer: `${req.headers.host}${req.originalUrl}`,
        browser: req.headers['user-agent'],
        timestamp: new Date().toLocaleString(),
        stack: err.stack,
        showSend: false,
        title: 'Error'
    }


    if( req.xhr ) {
        return res.status(400).send(err)
    }

    req.session.error = errorDetails

    let error = {
        data: errorDetails,
        layout: 'errorLayout'
    }

    res.render('error', error);

}

const errorMailer = ( req, res ) => {

    let error = req.session.error
    delete req.session.error

    res.render('error', { layout: false, data: Object.assign({}, error, { showSend: false }) }, ( err, html ) => {
        let mailOptions = {
            from: process.env.MAIL_FROM,
            to: process.env.MAIL_TO,
            subject: 'Inbox/Modx Error - user received error screen',
            html: html
        };

        nodemailer.sendMail(mailOptions, (error, info) => {
            if (error) return console.log(error);
            res.send('Support has been contacted regarding this error')
        })
    })
}

const handleErrors = (err, req, res, next) => {
    if( err.status === 404 ) return handleNotFound( err, req, res )
    return handleCommonErrors(err, req, res)
}

module.exports = { handleErrors, errorMailer }
