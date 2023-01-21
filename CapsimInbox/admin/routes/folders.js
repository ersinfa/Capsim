const express = require('express')
const router = express.Router()
const Folder = require('../../resources/folder')
const FileToFileFolder = require('../../resources/fileToFileFolder')
const FileType = require('../../resources/fileType')
const asyncWrap = require('../../middleware/asyncWrap')

router.get('/', asyncWrap( async ( req, res, next ) => {
    const allFiles = await Folder.where({ FK_versionKey: req.query.versionKey }).fetchAll({ withRelated: 'fileToFileFolder.file' })
    res.json(allFiles)
}))

router.get('/:fileFolderKey', asyncWrap( async ( req, res, next ) => {
    const folder = await Folder.where(req.params).fetch({ withRelated: 'fileToFileFolder.file.fileType' })
    res.json(folder)
}))

router.post('/', asyncWrap( async ( req, res, next ) => {
    const newFolder = await new Folder(req.body).save()
    res.json(newFolder)
}))

router.put('/:fileFolderKey', asyncWrap( async ( req, res, next ) => {
    const newFolder = await new Folder(req.params).save(req.body, { patch: true })
    res.json(newFolder)
}))

router.get('/get/file-types', asyncWrap( async ( req, res, next ) => {
    const fileTypes = await FileType.forge().fetchAll()
    res.json(fileTypes)
}))

router.delete('/:fileFolderKey', asyncWrap( async (req, res, next) => {
    const folder = await Folder.where(req.params).fetch({ withRelated: ['fileToFileFolder.files'] })
    const success = await folder.destroy({ cascadeDelete: false })
    res.json(success)
}))

module.exports = router
