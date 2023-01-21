const express = require('express')
const app  = express()
const path = require('path')
const helmet = require('helmet')
const passport = require('../lib/config/passport')
const authMiddleware = require('./middlewares/auth')
const versionLock = require('./middlewares/version').versionLock

app.use(helmet())

app.set('views', path.join(__dirname, '../views/admin'))
app.use('/capsiminbox', express.static(path.join(__dirname, 'public/admin')))
app.use(passport.initialize())

app.post('/login', passport.authenticate('local'), (req, res, next) => {
    const user = {
        name: req.user.name,
        authenticated: true,
		    isAdmin: (req.session.passport.user.role == 'R&D') ? true : false
    }
    res.json({ assetsPath: process.env.ASSETS_URL, user })
})

app.post('/authenticate', (req, res, next) => {
    passport.authenticate('local', { session: false }, function(err, user, info) {
        if(err) return next(err)
        if(!user) return res.status(401).end()
        return res.status(200).end()
    })(req, res, next)
})

app.use('/reports', require('./routes/reports'))
app.use('/api/remote', require('./routes/remote'))
app.use('/api/students', authMiddleware, require('./routes/students'))
app.use('/api/versions', authMiddleware, require('./routes/versions'))

//Routes that need version lock check
app.use('/api/professor-resources', authMiddleware, versionLock, require('./routes/professorResources'))
app.use('/api/entry-questions', authMiddleware, versionLock, require('./routes/entryQuestions'))
app.use('/api/entry-answers', authMiddleware, versionLock, require('./routes/entryAnswers'))
app.use('/api/competencies', authMiddleware, versionLock, require('./routes/competencies'))
app.use('/api/learningGoals', authMiddleware, versionLock, require('./routes/learningGoals'))
app.use('/api/questions', authMiddleware, versionLock, require('./routes/questions'))
app.use('/api/questionGroup', authMiddleware, versionLock, require('./routes/questionGroup'))
app.use('/api/authors', authMiddleware, versionLock, require('./routes/authors'))
app.use('/api/folders', authMiddleware, versionLock, require('./routes/folders'))
app.use('/api/answers', authMiddleware, versionLock, require('./routes/answers'))
app.use('/api/skills', authMiddleware, versionLock, require('./routes/skills'))
app.use('/api/files', authMiddleware, versionLock, require('./routes/files'))
app.use('/api/roles', authMiddleware, versionLock, require('./routes/roles'))
app.use('/api/dependsOn', authMiddleware, versionLock, require('./routes/dependsOn'))
app.use('/api/construct', authMiddleware, versionLock, require('./routes/construct'))
app.use('/api/postAssessmentQuestions', authMiddleware, versionLock, require('./routes/postAssessmentQuestions'))

app.get('/logout', ( req, res, next ) =>
    req.session.destroy((err) => (err) ? next(err) : res.redirect(`/capsiminbox/admin/home`) ))

app.get(/^\/(?!api).*/, authMiddleware, ( req, res ) => {

    const user = {
        name: req.session.passport.user.NameOnClassPage,
        authenticated: true,
        isAdmin: (req.session.passport.user.role == 'R&D') ? true : false
    }
    const assetsPath = process.env.ASSETS_URL
    res.render('index', { layout: false, title: 'Admin Dashboard', data: JSON.stringify({ assetsPath, user }) })
})

module.exports = app
