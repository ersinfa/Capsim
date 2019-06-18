const express = require('express')
const router = express.Router()
const Sim = require('../../resources/sim')
const Version = require('../../resources/version')
const asyncWrap = require('../../middleware/asyncWrap')
const authMiddleware = require('../middlewares/auth')
const Student = require('../../resources/student')

router.post('/change-version', authMiddleware, asyncWrap( async( req, res, next ) => {

    //Check if Sim is CapsimInbox simulation
    let sim = await Sim.getSim(req.body.simId)
    if( !sim ) return res.status(401).json({ message: 'That is not a CapsimInbox simulation' })

    //Check if Sim has any students who have started
    let hasStudentsStarted = await Sim.hasStudentsStarted(sim.simKey)
    //let hasScores = await Sim.hasCompletedStudents(sim.simKey)
    if( hasStudentsStarted ) return res.status(401).json({ success: false, message: 'This sim has students that have started the assessment' })

    let hasStudentsPaid = await Sim.hasStudentsPaid(sim.simKey)
    if( hasStudentsPaid ) return res.status(401).json({ success: false, message: 'This sim has students that already paid for assessment' })


    //Change version
    let success = await Sim.changeVersion( sim.simKey, req.body.versionKey )
    res.status(200).json({ success })
}))

router.post('/set-version', asyncWrap( async( req, res, next ) => {
    let success = await Sim.setVersion( req.body.simKey, req.body.versionKey )
    res.status(200).json({ success })
}))

router.get('/get-sellable', asyncWrap( async (req, res, next) => {
    let versions = await Version.where({ isSellable: 1 }).fetchAll()
    res.json(versions)
}))

router.post('/reset-student', asyncWrap( async (req, res, next) => {
    const studentReset = await Student.resetStudent(req.body.stsKey)
    res.json(studentReset)
}))

module.exports = router
