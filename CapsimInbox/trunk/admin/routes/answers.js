const express = require('express')
const router = express.Router()
const Answer = require('../../resources/answer')
const asyncWrap = require('../../middleware/asyncWrap')
const Ats = require('../../resources/answerToSkill')
const Atc = require('../../resources/answerToCompetency')
const Atl = require('../../resources/answerToLearningGoal')
const db = require('../../services/db')

router.get('/', asyncWrap( async ( req, res, next ) => {
    let questions = await Question.buildQuestions(req.query.FK_versionKey)
    res.status(200).json(questions)
}))

router.get('/:key', asyncWrap( async(req, res, next ) => {
    let answer = await Answer.where({ answerKey: req.params.key }).fetch({ withRelated: ['question.questionToVersion', 'answerToSkill', 'answerToCompetency', 'answerToLearningGoal'] })
    res.status(200).json(answer)
}))

router.post('/', asyncWrap( async ( req, res, next ) => {
	let answerToSkill = req.body.answerToSkill || []
    let answerToCompetency = req.body.answerToCompetency || []
    let answerToLearningGoal = req.body.answerToLearningGoal || []
	let answer = await new Answer(req.body.answer).save()

	answerToSkill.forEach( async ( ats ) => await new Ats(Object.assign(ats, { FK_answerKey: answer.get('answerKey') })).save() )
	answerToCompetency.forEach( async ( atc ) => await new Atc(Object.assign(atc, { FK_answerKey: answer.get('answerKey') })).save() )
	answerToLearningGoal.forEach( async ( atl ) => await new Atl(Object.assign(atl, { FK_answerKey: answer.get('answerKey') })).save() )

	res.status(200).json(answer)
}))

router.put('/:key', asyncWrap( async(req, res, next ) => {

    let answerToSkill = req.body.answerToSkill
    let answerToCompetency = req.body.answerToCompetency
    let answerToLearningGoal = req.body.answerToLearningGoal


    answerToSkill.forEach( async ( ats ) => {
        if( ats.isNew ) {
            delete ats.isNew
            await new Ats(ats).save()
        } else {
            await new Ats().where({ FK_answerKey: ats.FK_answerKey, FK_skillKey: ats.FK_skillKey }).save(ats, { patch: true })
        }
    })

    answerToCompetency.forEach( async ( atc ) => {
        if( atc.isNew ) {
            delete atc.isNew
            await new Atc(atc).save()
        } else {
            await new Atc().where({ FK_answerKey: atc.FK_answerKey, FK_competencyKey: atc.FK_competencyKey }).save(atc, { patch: true })
        }
    })

    answerToLearningGoal.forEach( async ( atl ) => {
        try {
            if( atl.isNew ) {
                delete atl.isNew
                await new Atl(atl).save()
            } else {
                await new Atl().where({ FK_answerKey: atl.FK_answerKey, FK_learningGoalKey: atl.FK_learningGoalKey }).save(atl, { patch: true })
            }
        } catch (error) {
            console.log(error)
        }

    })

    let answer = await new Answer({ answerKey: req.params.key }).save(req.body.answer, {patch: true})
    res.status(200).json(answer)
}))

router.delete('/ats', asyncWrap( async ( req, res, next ) => {
    let deletedAts = await db('CapsimInbox').table('inbox_answerToSkill').where({ FK_answerKey: req.body.FK_answerKey, FK_skillKey: req.body.FK_skillKey }).del()
    res.json(deletedAts)
}))

router.delete('/atc', asyncWrap( async ( req, res, next ) => {
    let deletedAtc = await db('CapsimInbox').table('inbox_answerToCompetency').where({ FK_answerKey: req.body.FK_answerKey, FK_competencyKey: req.body.FK_competencyKey }).del()
    res.json(deletedAtc)
}))

router.delete('/atl', asyncWrap( async ( req, res, next ) => {
    let deletedAtc = await db('CapsimInbox').table('inbox_answerToLearningGoal').where({ FK_answerKey: req.body.FK_answerKey, FK_learningGoalKey: req.body.FK_learningGoalKey }).del()
    res.json(deletedAtc)
}))

router.delete('/:key', asyncWrap( async ( req, res, next ) => {
    let deletedAnswer = await new Answer({ answerKey: req.params.key }).destroy()
    res.json(deletedAnswer)
}))

module.exports = router
