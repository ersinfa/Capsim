const router = require('express').Router()
const asyncWrap = require('../middleware/asyncWrap')

router.get('*', asyncWrap( async (req, res, next ) => {
    req.json({message: 'Hello World'});
}))

module.exports = router; 
