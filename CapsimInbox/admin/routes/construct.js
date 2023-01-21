const express = require('express')
const router = express.Router()
const Construct = require('../../resources/construct')
const asyncWrap = require('../../middleware/asyncWrap')

router.post('/', asyncWrap( async ( req, res, next ) => {
    const construct = await new Construct(req.body).save()
    res.status(200).json(construct)
}))

router.delete('/:key', asyncWrap( async( req, res, next ) => {
    const construct = await new Construct({ constructKey: req.params.key }).destroy()
    res.json(construct)
}))

module.exports = router
