const express = require('express')
const router = express.Router()
const Dependency = require('../../resources/dependsOn')
const asyncWrap = require('../../middleware/asyncWrap')

router.get('/:questionKey', asyncWrap( async(req, res, next ) => {
  let answerDependecies = await Dependency.where({ FK_questionKey: req.params.questionKey }).fetchAll()
  res.status(200).json(answerDependecies)
}))

router.post('/', asyncWrap( async (req, res, next ) => {
  let dependency = await new Dependency().save(req.body)
  res.status(200).json(dependency)
}))

router.delete('/', asyncWrap( async ( req, res, next ) => {
    let success = await new Dependency({ FK_questionKey: req.body.FK_questionKey, FK_answerKey: req.body.FK_answerKey}).where({ FK_questionKey: req.body.FK_questionKey, FK_answerKey: req.body.FK_answerKey}).destroy({ cascadeDelete: false })
    res.json(success)
}))

module.exports = router
