const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const errorHandler = require('./lib/errorHandler')
const helmet = require('helmet')
const hbs = require('hbs')
const app = express()

process.env.capstoneDb = `${process.env.DB_USER}_capstone.dbo.`
process.env.capsimInboxDb = `${process.env.DB_USER}_CapsimInbox.dbo.`

hbs.registerHelper("inc", (value) => (parseInt(value) + 1))

app.use(helmet())

// Initialize session client
app.use(require('./lib/config/sessionConfig'))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// Express Specific Middlewares
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(cookieParser())
app.use('/capsiminbox', express.static(path.join(__dirname, 'public'), { etag: false }))

// Routes
app.use('/capsiminbox/professor', require('./routes/professor'))
app.use('/capsiminbox/rehearsal', require('./routes/rehearsal'))
app.use('/capsiminbox/student', require('./routes/student'))
app.use('/capsiminbox/webapp', require('./routes/webapp'))
app.use('/capsiminbox/login', require('./routes/login'))
app.use('/capsiminbox/print', require('./routes/print'))
app.use('/capsiminbox/demo', require('./routes/demo'))
app.use('/capsiminbox/admin', require('./admin'))

//Health check to make sure ww5 is up
app.use('/capsiminbox/health-check', (req, res) => res.status(200).send('Inbox is up and running') )

//Send support email
app.get('/capsiminbox/send-support', errorHandler.errorMailer)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use(errorHandler.handleErrors)

module.exports = app
