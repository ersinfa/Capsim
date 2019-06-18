const GameData = require('../services/gameData')

module.exports = async (req, res, next) => {
    if (!req.session.data) return res.redirect('/capsiminbox/student')
    const { stsKey } = req.session
    const { inProgress } = await GameData.getStudentLog(stsKey)
    if (inProgress)  return next() 
    return res.status(444).end()
}
