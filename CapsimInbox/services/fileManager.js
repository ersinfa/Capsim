const path = require('path'),
    fs = require('fs'),
    Mod = function( data ) { return Object.assign( this, data ).init() }

Object.assign(Mod.prototype, {

    init() {
        this.ssh = new (require('node-ssh'))()
        return this
    },

    localPath: `${path.join(__dirname, '../tempFiles')}`,

    credentials: {
        host: process.env.ASSETS_HOST,
        username: process.env.ASSETS_USERNAME,
        privateKey: 'C:/MSI/putty/web.ppk'
    },

    uuid: require('uuid'),

    connect() {
        return this.ssh.connect(this.credentials)
    },

    deleteFile( fileName ) {
        const fileTypeFolder = this.getFileType(fileName)

        return new Promise( (resolve, reject) => {
            this.connect()
            .then( () => this.ssh.execCommand(`rm ${fileName}`, { cwd: `assets/capsiminbox/${fileTypeFolder}` }) )
            .then( () => this.ssh.dispose() )
            .then( () => resolve() )
            .catch( err => reject(err) )
        })

    },

    getFileType( format ) {

        let fileTypeFolder = ''

        if( /\.png|\.jpeg|\.jpg/.test( format ) ) fileTypeFolder = 'images'
        else if( /\.pdf/.test( format ) ) fileTypeFolder = 'pdfs'
        else fileTypeFolder = 'documents'

        return fileTypeFolder
    },

    putFile( file, format, name = this.uuid.v4() ) {
        const fileName = ( new RegExp(format).test(name) ) ? name : `${name}${format}`
        const fileLocalPath = `${this.localPath}\\${fileName}`
        const fileTypeFolder = this.getFileType(format)

        return new Promise( ( resolve, reject ) => {

            this.writeTempFile(fileLocalPath, file)
            .then( () => this.connect() )
            .then( () => this.ssh.putFile(fileLocalPath, `assets/capsiminbox/${fileTypeFolder}/${fileName}`) )
            .then( () => this.ssh.dispose() )
            .then( () => this.unlinkTempFile(fileLocalPath) )
            .then( () => resolve(fileName) )
            .catch( err => reject(err) )
        })
    },

    writeTempFile( path, file ) {
        return new Promise( (resolve, reject) => fs.writeFile( path, file, 'base64', (err) => (err) ? reject(err) : resolve() ) )
    },

    unlinkTempFile( path ) {
        return new Promise( (resolve, reject) => fs.unlink(path, (err) => (err) ? reject(err) : resolve() ) )
    }
})

 module.exports = new Mod()
