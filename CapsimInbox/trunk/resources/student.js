const db = require('../services/db')
const gameScore = require('../services/gameScore')

module.exports = {
    getStudent(q) {
        const fields = [
            'Student.LastName', 'Student.FirstName', 'Student.username', 'Student.email',
            'Professor.FirstName AS professorFirstName', 'Professor.LastName AS professorLastName',
            'School.schoolname', 'sim.simID', 'sts.studentToSimKey AS stsKey','vts.versionKey'
        ]

        return db('Capstone').select(fields).from('Student AS student')
                .join(process.env.capsimInboxDb + 'inbox_studentToSim AS sts', 'student.StudentKey', 'sts.FK_studentKey')
                .join(process.env.capsimInboxDb + 'inbox_versionToSim AS vts', 'sts.FK_simKey', 'vts.simKey')
                .join(process.env.capstoneDb + 'Sim AS sim', 'sim.simKey', 'vts.simKey')
                .join(process.env.capstoneDb + 'Section AS section', 'section.sectionKey', 'sim.sectionKey')
                .join(process.env.capstoneDb + 'Professor AS Professor', 'section.professorKey', 'Professor.professorKey')
                .join(process.env.capstoneDb + 'Schoollocation AS School', 'section.schoolnameKey', 'School.Schoolnamekey')
                .where('student.LastName', 'like', `%${q}%`)
    },

    resetStudent(FK_studentToSimKey) {

        return db('CapsimInbox').table('entry_studentToAnswer').where({ FK_studentToSimKey }).del()
                .then( () => db('CapsimInbox').table('inbox_selfAssessment').where({ FK_studentToSimKey }).del() )
                .then( () => db('CapsimInbox').table('studentSetting').where({ FK_studentToSimKey }).del() )
                .then( () => db('CapsimInbox').table('inbox_score').where({ FK_studentToSimKey }).del() )
                .then( () => db('CapsimInbox').table('inbox_studentToAnswer').where({ FK_studentToSimKey }).del() )
                .then( () => db('CapsimInbox').table('inbox_studentLog').where({ FK_studentToSimKey }).del() )
                .then( () => db('CapsimInbox').table('studentGoal').where({ FK_studentToSimKey }).del() )
                .then( () => db('CapsimInbox').table('inbox_studentToSim').where({ 'studentToSimKey': FK_studentToSimKey }).del() )

    },

    async reprocessStudent(FK_studentToSimKey, versionKey) {
        const hasScore = await db('CapsimInbox').table('inbox_score').where({ FK_studentToSimKey, historyKey:0 }).del()
        if(hasScore == 1) await gameScore.setScore( FK_studentToSimKey, versionKey)

        return hasScore
    },

    async processStudent(FK_studentToSimKey, versionKey) {
        await gameScore.setScore( FK_studentToSimKey, versionKey)
        return true
    }
}
