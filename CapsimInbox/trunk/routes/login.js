const router = require('express').Router()
const asyncWrap = require('../middleware/asyncWrap')
const db = require('../services/db')
const crypto = require('crypto')
const querystring = require('querystring')

router.get('/', (req, res, next) => res.render('login') )

router.post('/', asyncWrap( async (req, res, next) => {
  const { username, type, simId, password } = req.body, pKey = `${type}Key`
  const sim = await db('Capstone').first(['simKey', 'sectionKey']).from('Sim').where({'simID': simId})
  const user = await db('Capstone').first([pKey, 'Password']).from(type).where({ username })

  if(
    (sim === undefined || user === undefined) ||
    password.toLowerCase() !== user.Password.toLowerCase()
  ) return res.render('login', { error: 'Invalid Login' })

  const token = crypto.createHash('md5').update(`${user[pKey]}${sim.sectionKey}secret`).digest("hex").toUpperCase()
  const urlQuery = querystring.stringify({
    [pKey.toLowerCase()]: user[pKey],
    key: sim.sectionKey,
    simkey: sim.simKey,
    simid: simId,
    attrSec: token
  })

  res.redirect(`/capsiminbox/${type}/login?${urlQuery}`)
}))

module.exports = router
