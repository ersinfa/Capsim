const db = require('../services/db');

module.exports = {

    // async hasCompletedStudents( simKey ) {
    //     const scoresCount = await db('CapsimInbox').table('inbox_score AS is').count('FK_studentToSimKey AS count')
    //                         .join('inbox_studentToSim AS sts', 'sts.studentToSimKey', 'is.FK_studentToSimKey')
    //                         .where({ 'sts.FK_simKey': simKey }).first()
    //     return scoresCount.count > 0
    // },

    async hasStudentsStarted ( simKey ) {
        const stsCount = await db('CapsimInbox').table('inbox_studentToSim AS sts').count('studentToSimKey AS count')
            .where({ 'sts.FK_simKey': simKey }).first()
        return stsCount.count > 0
    },

    async hasStudentsPaid ( simKey ) {
        const SectionShoppingCart = await db('Capstone').first('SectionShoppingCartKey').from(process.env.capstoneDb + 'SectionShoppingCart').where({ simKey })
        const commerce_student_purchases = await db('Capstone').select().from('commerce_student_purchases').where({ fk_SectionShoppingCartKey:SectionShoppingCart.SectionShoppingCartKey, payment_made: 1 })
        return commerce_student_purchases.length > 0
    },

    getSim( simID ) {
        return db('Capstone').select('*').from('Sim').where({simID: simID}).first()
    },

    async changeVersion( simKey, versionKey ) {
        await this.updateSectionShoppingCart( simKey, versionKey )
        return db('CapsimInbox').table('inbox_versionToSim').update({ versionKey }).where({ simKey })
    },

    setVersion( simKey, versionKey ) {
        return db('CapsimInbox').insert({ simKey, versionKey }).into('inbox_versionToSim')
    },

    async updateSectionShoppingCart( simKey, versionKey ) {
        const productKey = await db('CapsimInbox').table('inboxVersionToProductIdentification').where({ 'fk_versionKey':versionKey }).first()
        if(typeof productKey != 'undefined' && typeof productKey.FK_productKey != 'undefined'){
            const sectionlevelkey = await db('Capstone')
            .first('section.sectionlevelkey')
            .from(process.env.capstoneDb + 'section')
            .innerJoin('sim', 'section.Sectionkey', 'sim.Sectionkey')
            .where({'sim.simkey':simKey})

            const newInboxPrice = await db('Capstone')
                .first('Price')
                .from(process.env.capstoneDb + 'ProductPricing')
                .where({'sectionlevelkey':sectionlevelkey.sectionlevelkey,'ProductKey':productKey.FK_productKey})

            const SectionShoppingCart = await db('Capstone')
                .first('SectionShoppingCartKey')
                .from(process.env.capstoneDb + 'SectionShoppingCart')
                .where({ simKey })

            const commerce_student_purchases = await db('Capstone')
                .select()
                .from('commerce_student_purchases')
                .where({ fk_SectionShoppingCartKey:SectionShoppingCart.SectionShoppingCartKey })
                
            if(commerce_student_purchases.length > 0 ){
                await db('Capstone').table('commerce_student_purchases')
                .update({ wholesale_price: newInboxPrice.Price })
                .where({ 'fk_SectionShoppingCartKey':SectionShoppingCart.SectionShoppingCartKey , payment_made: 0 })
            }

            await db('Capstone').table('SectionShoppingCart').update({ price: newInboxPrice.Price }).where({ simKey })
        }
    },

}
