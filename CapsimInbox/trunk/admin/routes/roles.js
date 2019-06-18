const express = require('express')
const router = express.Router()
const Role = require('../../resources/role');
const asyncWrap = require('../../middleware/asyncWrap')
const fileManager = require('../../services/fileManager')

router.get('/:FK_versionKey', asyncWrap( async ( req, res ) => {
	const role = await Role.forge(req.params).fetch()
	if(role) return res.json(Object.assign(role.toJSON(), { isNew: false }))
	res.status(200).json({ scenario: '', pdfFile: '', role: '', isNew: true })
}))

router.post('/', asyncWrap( async (req, res, next) => {

	const newRole = {
		scenario: req.body.scenario,
		role: req.body.role,
		FK_versionKey: req.body.FK_versionKey
	}

	const fileName = await fileManager.putFile(req.body.newFile, '.pdf')
 	const retVal = await new Role(Object.assign(newRole, { pdfFile: `${fileName}` })).save()

	res.json(retVal)

}))

router.put('/:roleKey', asyncWrap( async (req, res, next) => {

	let updatedRole = { scenario: req.body.scenario, role: req.body.role }

	if( !req.body.newFile ) {
		const role = await new Role(req.params).save(updatedRole, {patch: true})
		const roleUpdated = await role.fetch()
		res.json(roleUpdated)
	} else {
		await fileManager.putFile( req.body.newFile, '.pdf', req.body.pdfFile)
		const retVal = await new Role({ roleKey: req.body.roleKey }).save(updatedRole, {patch: true})
		res.json(retVal)
	}
}))

router.delete('/:FK_versionKey', asyncWrap( async (req, res, next) => {
	let deleted = null
	const role = await Role.forge(req.params).fetch()
	fs.unlink(`${filesPath}/${role.get('pdfFile')}`, async(err) => {
		if (err) return next(err)
		try { deleted = await role.destroy() }
		catch (e) { return next(e) }
		res.json(deleted)
	})
}))

module.exports = router
