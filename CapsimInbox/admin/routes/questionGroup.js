const express = require('express')
const router = express.Router()
const Folder = require('../../resources/folder')
const FileToFileFolder = require('../../resources/fileToFileFolder')
const Question = require('../../resources/questions')
const QuestionGroup = require('../../resources/questionGroup')
const QuestionGroupToSkill = require('../../resources/questionGroupToSkill')
const QuestionGroupToCompetency = require('../../resources/questionGroupToCompetency')
const asyncWrap = require('../../middleware/asyncWrap')
const db = require('../../services/db')

router.get('/:questionGroupKey', asyncWrap( async ( req, res, next ) => {
    const questionGroup = await QuestionGroup.where(req.params).fetch({ withRelated: ['questionGroupToSkill', 'questionGroupToCompetency'] })
    res.json(questionGroup)
}))

router.post('/', asyncWrap( async ( req, res, next ) => {
    const newQuestionGroup = await new QuestionGroup(req.body).save()
    res.json(newQuestionGroup)
}))

router.put('/:questionGroupKey', asyncWrap( async ( req, res, next ) => {

    let name = req.body.name
    let questionGroupToSkillData = req.body.questionGroupToSkill
    let questionGroupToCompetencyData = req.body.questionGroupToCompetency

    questionGroupToSkillData.forEach( async ( qgts ) => {
        if( qgts.isNew ) {
            delete qgts.isNew
            await new QuestionGroupToSkill(qgts).save()
        } else {
            await new QuestionGroupToSkill().where({ FK_questionGroupKey: qgts.FK_questionGroupKey, FK_skillKey: qgts.FK_skillKey }).save(qgts, { patch: true })
        }
    })

    questionGroupToCompetencyData.forEach( async ( qgtc ) => {
        if( qgtc.isNew ) {
            delete qgtc.isNew
            await new QuestionGroupToCompetency(qgtc).save()
        } else {
            await new QuestionGroupToCompetency().where({ FK_questionGroupKey: qgtc.FK_questionGroupKey, FK_competencyKey: qgtc.FK_competencyKey }).save(qgtc, { patch: true })
        }
    })

    const newQuestionGroup = await new QuestionGroup(req.params).save({'name':name}, { patch: true })
    res.json(newQuestionGroup)
}))


router.delete('/questionGroupToSkill', asyncWrap( async ( req, res, next ) => {
    let deletedAts = await db('CapsimInbox').table('inbox_questionGroupToSkill').where({ FK_questionGroupKey: req.body.FK_questionGroupKey, FK_skillKey: req.body.FK_skillKey }).del()
    res.json(deletedAts)
}))

router.delete('/questionGroupToCompetency', asyncWrap( async ( req, res, next ) => {
    let deletedAtc = await db('CapsimInbox').table('inbox_questionGroupToCompetency').where({ FK_questionGroupKey: req.body.FK_questionGroupKey, FK_competencyKey: req.body.FK_competencyKey }).del()
    res.json(deletedAtc)
}))


router.delete('/:questionGroupKey', asyncWrap( async (req, res, next) => {
    const questionGroup = await  QuestionGroup.where(req.params).fetch()
    const success = await questionGroup.destroy({ cascadeDelete: false })
    res.json(success)
}))


router.get('/questions/:FK_questionGroupKey', asyncWrap( async ( req, res, next ) => {
    const questions = await Question.where(req.params).fetchAll()
    res.json(questions)
}))


module.exports = router
