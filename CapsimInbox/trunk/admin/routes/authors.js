const express = require('express')
const router = express.Router()
const Author = require('../../resources/author')
const asyncWrap = require('../../middleware/asyncWrap')

router.get('/', asyncWrap( async(req, res, next ) => {
  let authors = await Author.where(req.query).fetchAll()
  res.status(200).json(authors)
}))

router.get('/:key', asyncWrap( async(req, res, next ) => {
  let author = await Author.where({ authorKey: req.params.key }).fetch()
  res.status(200).json(author)
}))

router.post('/', asyncWrap( async (req, res, next ) => {
  let author = await new Author().save(req.body)
  res.status(200).json(author)
}))

router.put('/:key', asyncWrap( async(req, res, next ) => {
  let author = await new Author({ authorKey: req.params.key }).save({ nameTagKey: req.body.nameTagKey, title: req.body.title }, {patch: true})
  res.status(200).json(author)
}))

router.delete('/:key', asyncWrap( async ( req, res, next ) => {
    let success = await new Author({ authorKey: req.params.key }).destroy()
    res.json(success)
}))

module.exports = router
