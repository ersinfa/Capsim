const db = require('./db.js');
const database = db('CapsimInbox');

module.exports.courseSettings = (simKey, sectionKey) => {
    // Base cte for the inbox_courseSettings table
    return database.with('inboxSettings', (query) => {
        query
        .select('startDateTime', 'endDateTime', 'sim.sectionKey')
        .from('inbox_courseSettings')
        .innerJoin(process.env.capstoneDb + 'sim', 'simKey', 'FK_simKey')
        .where('FK_simKey', simKey)
    })
    // Chained cte for grabbing default values when not in the database.
    .with('courseSettings', (query) => {
        query
        .select('startDateTime', 'endDateTime', 'sectionKey')
        .from('inboxSettings')
        .unionAll((union) => {
            union
            .select('startDateTime', 'endDateTime', 'sectionKey')
            .from(process.env.capstoneDb + 'section')
            .where('sectionKey', sectionKey)
            .whereNotExists((exists) => {
                exists
                .select('startDateTime', 'endDateTime')
                .from('inboxSettings')
            })
        })
    })
}
 /** **********************************************************************************************************
 * cte.js - returns mssql cte's for needed database operations
 * @author andrew.kralovec
 */
