const express = require('express')
const router = express.Router()
const mailer = require('../../lib/mailer')
const dd = require('../../services/debugData')
const json2csv = require('json2csv')
const asyncWrap = require('../../middleware/asyncWrap')
const Version = require('../../resources/version')
const sendMail = (err, file, req, next) => {
    let mailOptions = {
        from: 'inbox.reports@capsim.com',
        to: req.body.email,
        subject: 'CapsimInbox Report',
        html: '<h1>Report Attached</h1>',
        attachments: [
            {
                filename: 'Report.csv',
                content: file
            }
        ]
    }

    mailer.sendMail(mailOptions, (error, info) => {
        if (error) return next(error)
    })
}

router.get('/', asyncWrap( async( req, res, next ) => {
    let versions = await Version.fetchAll()
    res.render('report', { layout: false, versions: versions.toJSON() })
}))

router.post('/send-report', asyncWrap( async (req, res, next ) => {

    // If not @capsim email
    let viewOptions = { layout: false, errorMessage: 'This is not a valid Capsim email' }

    if( req.body.email.indexOf('@capsim.com') == -1 ) return res.render('report', viewOptions)

    let versions = await Version.fetchAll()
    dd[req.body.report](req.body.version)
    .then( ({ data, fields }) => json2csv({ data, fields }, (err, csvString) => sendMail(err, csvString, req, next)) )
    .catch( err => console.log(err) )

    res.render('report', { layout: false, successMessage: 'You will be receving an email shortly with the requested data', versions: versions.toJSON() })
}))

module.exports = router
