const Version = require('../../resources/version')

exports.versionLock = async(req, res, next) => {

    if( /^(PUT|DELETE)/.test(req.method) && req.session.workingVersionKey ) {
        const version = await Version.where({ versionKey: req.session.workingVersionKey }).fetch()
        if( version.toJSON().isActive ) res.status(400).json({ message: 'Not Authorized!' })
        else next()
    } else next()
}
