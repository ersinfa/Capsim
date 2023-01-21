const express = require('express')
const router = express.Router()
const LearningGoal = require('../../resources/learningGoal')
const db = require('../../services/db')
const asyncWrap = require('../../middleware/asyncWrap')

router.get('/', asyncWrap( async ( req, res, next ) => {
    let learningGoals = await db('CapsimInbox').table('inbox_learningGoal').where({ FK_versionKey: req.query.FK_versionKey })
    res.status(200).json(learningGoals)
}))

router.get('/:key', asyncWrap( async (req, res, next ) => {
  const learningGoalKey = req.params.key
  const learningGoal = await new LearningGoal({ learningGoalKey }).fetch()
  res.status(200).json(learningGoal)
}))

router.post('/', asyncWrap( async ( req, res, next ) => {
    const learningGoal = await new LearningGoal(req.body).save()
    res.status(200).json(learningGoal)
}))

router.put('/:key', asyncWrap( async( req, res, next ) => {
    const learningGoal = await new LearningGoal({ learningGoalKey: req.params.key }).save(req.body, {patch: true})
    res.status(200).json(learningGoal)
}))

router.delete('/:key', asyncWrap( async( req, res, next ) => {
    const learningGoal = await new LearningGoal({ learningGoalKey: req.params.key }).destroy()
    res.json(learningGoal)
}))

module.exports = router