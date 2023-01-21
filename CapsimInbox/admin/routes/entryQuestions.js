const express = require('express')
const router = express.Router()
const EntryQuestion = require('../../resources/entryQuestion')
const asyncWrap = require('../../middleware/asyncWrap')

router.get('/', asyncWrap( async ( req, res, next ) => {
    const questions = await EntryQuestion.where(req.query).fetchAll({ withRelated: 'entryAnswers' })
    res.json(questions)
}))

router.get('/:questionKey', asyncWrap( async(req, res, next ) => {
    const question = await EntryQuestion.where(req.params).fetch({ withRelated: 'entryAnswers' })
    res.json(question)
}))

router.post('/', asyncWrap( async ( req, res, next ) => {
    const question = await new EntryQuestion(req.body).save()
    res.json(question)
}))

router.put('/:questionKey', asyncWrap( async(req, res, next ) => {
    const question = await EntryQuestion.where(req.params).save(req.body, {patch: true})
    res.json(question)
}))

router.delete('/:questionKey', asyncWrap( async ( req, res, next ) => {
    const question = await EntryQuestion.where(req.params).destroy()
    res.json(question)
}))

router.post('/save-order', ( req, res, next ) => {
	let promises = req.body.questionsToUpdate.map( question => EntryQuestion.where({ questionKey: question.questionKey }).save({ sort: question.sort }, { patch: true }) )
	Promise.all(promises).then( data => res.status(200).json(data) ).catch(next)
})

module.exports = router
