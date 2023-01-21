const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const db = require('../../services/db')

passport.use(new LocalStrategy(
  function(username, password, done) {
    return db('Capstone').first(['ProfessorKey', 'NameOnClassPage']).from('Professor').where({ username, Password: password })
    .then( user => {
      if (!user) done(new Error('No such user'))
      else { user.role = 'R&D'; done(null, user); }
      return null;
    }).catch( err => done(err, null) )
  }
))

passport.serializeUser(function(user, done) {
  return done(null, user)
})

passport.deserializeUser(function(user, done) {
  return done(null, user)
})

module.exports = passport
