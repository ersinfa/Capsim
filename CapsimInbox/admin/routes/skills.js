const express = require('express')
const router = express.Router()
const Skill = require('../../resources/skill')
const db = require('../../services/db')
const asyncWrap = require('../../middleware/asyncWrap')

router.get('/', asyncWrap( async ( req, res, next ) => {
    let skills = await db('CapsimInbox').table('inbox_skill').where({ FK_versionKey: req.query.FK_versionKey })
    res.status(200).json(skills)
}))

router.get('/:key', asyncWrap( async (req, res, next ) => {
  const skillKey = req.params.key
  const skill = await new Skill({ skillKey }).fetch()
  res.status(200).json(skill)
}))

router.post('/', asyncWrap( async ( req, res, next ) => {
    const skill = await new Skill(req.body).save()
    res.status(200).json(skill)
}))

router.put('/:key', asyncWrap( async( req, res, next ) => {
    const skill = await new Skill({ skillKey: req.params.key }).save(req.body, {patch: true})
    res.status(200).json(skill)
}))

router.delete('/:key', asyncWrap( async( req, res, next ) => {
    const skill = await new Skill({ skillKey: req.params.key }).destroy()
    res.json(skill)
}))

module.exports = router
