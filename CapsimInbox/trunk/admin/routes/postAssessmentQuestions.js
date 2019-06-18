const express = require('express')
const router = express.Router()
const PostAssessmentQuestion = require('../../resources/postAssessmentQuestion')
const asyncWrap = require('../../middleware/asyncWrap')

router.post('/', asyncWrap( async ( req, res, next ) => {
    const postAssessmentQuestion = await new PostAssessmentQuestion(req.body).save()
    res.status(200).json(postAssessmentQuestion)
}))

router.delete('/:key', asyncWrap( async( req, res, next ) => {
    const postAssessmentQuestion = await new PostAssessmentQuestion({ questionKey: req.params.key }).destroy()
    res.json(postAssessmentQuestion)
}))

module.exports = router
