const express = require('express')
const router = express.Router()
const Competency = require('../../resources/competency')
const db = require('../../services/db')
const asyncWrap = require('../../middleware/asyncWrap')

router.get('/', asyncWrap( async ( req, res, next ) => {
    let competencies = await db('CapsimInbox').table('inbox_competency').where({ FK_versionKey: req.query.FK_versionKey })
    res.status(200).json(competencies)
}))

router.get('/:key', asyncWrap( async (req, res, next ) => {
  const competencyKey = req.params.key
  const competency = await new Competency({ competencyKey }).fetch()
  res.status(200).json(competency)
}))

router.post('/', asyncWrap( async ( req, res, next ) => {
    const competency = await new Competency(req.body).save()
    res.status(200).json(competency)
}))

router.put('/:key', asyncWrap( async( req, res, next ) => {
    const competency = await new Competency({ competencyKey: req.params.key }).save(req.body, {patch: true})
    res.status(200).json(competency)
}))

router.delete('/:key', asyncWrap( async( req, res, next ) => {
    const competency = await new Competency({ competencyKey: req.params.key }).destroy()
    res.json(competency)
}))

module.exports = router
