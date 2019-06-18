const express = require('express')
const router = express.Router()
const EntryAnswer = require('../../resources/entryAnswer')
const asyncWrap = require('../../middleware/asyncWrap')

router.get('/', asyncWrap( async ( req, res, next ) => {
    const answers = await EntryAnswer.where(req.query).fetchAll()
    res.json(answers)
}))

router.get('/:answerKey', asyncWrap( async(req, res, next ) => {
    const answer = await EntryAnswer.where(req.params).fetch()
    res.json(answer)
}))

router.post('/', asyncWrap( async ( req, res, next ) => {
    const answer = await new EntryAnswer(req.body).save()
    res.json(answer)
}))

router.put('/:answerKey', asyncWrap( async(req, res, next ) => {
    const answer = await EntryAnswer.where(req.params).save(req.body, {patch: true})
    res.json(answer)
}))

router.delete('/:answerKey', asyncWrap( async ( req, res, next ) => {
    const answer = await EntryAnswer.where(req.params).destroy()
    res.json(answer)
}))

router.post('/save-order', ( req, res, next ) => {
	let promises = req.body.answersToUpdate.map( answer => EntryAnswer.where({ answerKey: answer.answerKey }).save({ sort: answer.sort }, { patch: true }) )
	Promise.all(promises).then( data => res.status(200).json(data) ).catch(next)
})

module.exports = router
