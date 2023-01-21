const express = require('express')
const router = express.Router()
const File = require('../../resources/file')
const FileToFileFolder = require('../../resources/fileToFileFolder')
const ProfessorResources = require('../../resources/professorResources')
const FileToQuestion = require('../../resources/fileToQuestion')
const asyncWrap = require('../../middleware/asyncWrap')
const fileManager = require('../../services/fileManager')

router.get('/', asyncWrap( async ( req, res ) => {
    const allFiles = await Folder.where({ FK_versionKey: req.query.versionKey }).fetchAll({ withRelated: 'fileToFileFolder.files' })
    res.json(allFiles)
}))

router.post('/', asyncWrap( async ( req, res, next ) => {

    const fileFormat = req.body.fileFormat

    const file = {
        displayName: req.body.displayName,
        FK_fileTypeKey: req.body.FK_fileTypeKey,
        timer: req.body.timer,
        sequence: req.body.sequence,
        FK_versionKey: req.body.FK_versionKey
    }

    const fileName = req.body.fileName || await fileManager.putFile(req.body.file, fileFormat)
    
    const newFile = await new File(Object.assign(file, { fileName })).save()
    
    // TODO: move this guys out so we could reuse this post method
    const fieToFileFolder = {
        FK_fileFolderKey: req.body.FK_fileFolderKey,
        FK_fileKey: newFile.id
    }
    const newFileToFolder = await new FileToFileFolder(Object.assign(fieToFileFolder)).save()
    res.json(newFile)
}))


router.put('/:fileKey', asyncWrap( async (req, res) => {
    const file = await new File(req.params).save(req.body, {patch: true})
    res.json(file)
}))

router.delete('/:fileKey', asyncWrap( async ( req, res, next ) => {
    const file = await File.forge(req.params).fetch()

    if(file.get('FK_fileTypeKey') != 2) await fileManager.deleteFile(`${file.get('fileName')}`)

    const fileToFolder = await FileToFileFolder.where({FK_fileKey:req.params.fileKey}).destroy()
    let deletedFile = await file.destroy()
    res.json(deletedFile)
}))


router.get('/fileToQuestion/:questionKey', asyncWrap( async ( req, res ) => {
    const allFiles = await FileToQuestion.where({ FK_questionKey: req.params.questionKey }).fetchAll({ withRelated: 'file' })
    res.json(allFiles)
}))



router.post('/fileToQuestion', asyncWrap( async ( req, res, next ) => {
    const fileFormat = req.body.fileFormat
    const file = {
        displayName: req.body.displayName,
        FK_fileTypeKey: req.body.FK_fileTypeKey,
        FK_versionKey: req.body.FK_versionKey
    }

    const fileName = req.body.fileName || await fileManager.putFile(req.body.file, fileFormat)
    const newFile = await new File(Object.assign(file, { fileName })).save()
    const fileToQuestion = {
        FK_questionKey: req.body.FK_questionKey,
        FK_fileKey: newFile.id
    }
    const newProfessorResources = await new FileToQuestion(Object.assign(fileToQuestion)).save()
    res.json(newFile)
    
})) 


router.delete('/fileToQuestion/:fileKey', asyncWrap( async ( req, res, next ) => {
    
    const file = await File.forge(req.params).fetch()

    if(file.get('FK_fileTypeKey') != 2) await fileManager.deleteFile(`${file.get('fileName')}`)

    const fileToFolder = await FileToQuestion.where({FK_fileKey:req.params.fileKey}).destroy()
    let deletedFile = await file.destroy()
    res.json(deletedFile)
}))


module.exports = router
