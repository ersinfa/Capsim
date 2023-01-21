const express = require('express')
const router = express.Router()
const Question = require('../../resources/questions')
const Qtv = require('../../resources/questionToVersion')
const asyncWrap = require('../../middleware/asyncWrap')

router.get('/', asyncWrap( async ( req, res, next ) => {
    let questions = await Question.buildQuestions(req.query.FK_versionKey)
    res.status(200).json(questions)
}))

router.get('/:key', asyncWrap( async(req, res, next ) => {
    let question = await Question.where({ questionKey: req.params.key }).fetch({ withRelated: ['answers.answerToSkill', 'author', 'questionType', 'questionToVersion'] })
    res.status(200).json(question)
}))

router.post('/', asyncWrap( async( req, res, next ) => {
    try {
        let FK_versionKey = req.body.versionKey
        delete req.body.versionKey
    
        req.body.isImportant = req.body.isImportant === "true" ? 1 : 0
        let newQuestion = await new Question(req.body).save()
        let questionToVersion = await new Qtv({ FK_versionKey, FK_questionKey: newQuestion.id }).save()
        res.status(200).json(newQuestion)
    } catch (error) {
        console.log(error); 
    }
}))

router.post('/save-order', ( req, res, next ) => {
	let promises = req.body.questionsToUpdate.map( question => Question.where({ questionKey: question.questionKey }).save({ sequence: question.sequence }, { patch: true }) )
	Promise.all(promises).then( data => res.status(200).json(data) ).catch(next)
})

router.put('/:key', asyncWrap( async( req, res, next ) => {

    let updatedQuestion = await new Question({ questionKey: req.params.key }).save(req.body, {patch: true})

    res.status(200).json(updatedQuestion)
}))

router.delete('/:key', asyncWrap( async ( req, res, next ) => {

    const deleted = await new Question({ questionKey: req.params.key }).destroy()

    res.json(deleted)
}))

module.exports = router
