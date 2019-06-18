const express = require('express')
const router = express.Router()
const asyncWrap = require('../../middleware/asyncWrap')
const Student = require('../../resources/student')

router.get('/', asyncWrap( async (req, res, next) => {
    const students = await Student.getStudent(req.query.q)
    res.json(students)
}))

router.post('/reset', asyncWrap( async (req, res, next) => {
    const studentReset = await Student.resetStudent(req.body.stsKey)
    res.json(studentReset)
}))

router.post('/reprocess', asyncWrap( async (req, res, next) => {
    const studentReprocess = await Student.reprocessStudent(req.body.stsKey,req.body.versionKey)
    res.json(studentReprocess)
}))

router.post('/process', asyncWrap( async (req, res, next) => {
    const studentReprocess = await Student.processStudent(req.body.stsKey,req.body.versionKey)
    res.json(studentReprocess)
}))

module.exports = router;
