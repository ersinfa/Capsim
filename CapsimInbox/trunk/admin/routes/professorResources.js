const express = require('express')
const router = express.Router()
const File = require('../../resources/file')
const ProfessorResources = require('../../resources/professorResources')
const asyncWrap = require('../../middleware/asyncWrap')
const fileManager = require('../../services/fileManager')

router.get('/', asyncWrap( async ( req, res ) => {
    const allFiles = await ProfessorResources.where({ FK_versionKey: req.query.versionKey }).fetchAll({ withRelated: 'file' })
    res.json(allFiles)
}))

router.get('/:versionKey', asyncWrap( async ( req, res ) => {
    const allFiles = await ProfessorResources.where({ FK_versionKey: req.params.versionKey }).fetchAll({ withRelated: 'file' })
    res.json(allFiles)
}))

router.post('/', asyncWrap( async ( req, res, next ) => {
    const fileFormat = req.body.fileFormat
    const file = {
        displayName: req.body.displayName,
        FK_fileTypeKey: req.body.FK_fileTypeKey,
        FK_versionKey: req.body.FK_versionKey
    }

    const fileName = req.body.fileName || await fileManager.putFile(req.body.file, fileFormat)
    const newFile = await new File(Object.assign(file, { fileName })).save()
    const professorResources = {
        FK_versionKey: req.body.FK_versionKey,
        FK_fileKey: newFile.id
    }
    const newProfessorResources = await new ProfessorResources(Object.assign(professorResources)).save()
    res.json(newFile)
    
})) 

router.put('/:fileKey', asyncWrap( async (req, res) => {
    const file = await new File(req.params).save(req.body, {patch: true})
    res.json(file)
}))

router.delete('/', asyncWrap( async ( req, res, next ) => {
    const file = await File.forge(req.body).fetch()
    if(file.get('FK_fileTypeKey') != 2) await fileManager.deleteFile(`${file.get('fileName')}`)

    const resourceProfessorFile = {
        FK_versionKey: req.body.FK_versionKey,
        FK_fileKey: req.body.fileKey
    }
    const deletedProfessorResource = await ProfessorResources.where(resourceProfessorFile).destroy({ cascadeDelete: false })
    const deletedFile = await file.destroy()

    res.json(deletedProfessorResource)
}))

module.exports = router
