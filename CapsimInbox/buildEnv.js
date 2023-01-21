var fs = require('fs')

var environments = {

    dev: {
        API_WW3_HOSTNAME: 'localhost:3000/capsiminbox',
        API_WW2_HOSTNAME: 'localhost:3000/capsiminbox',
        REDIS_HOST: '10.134.136.132',
        REDIS_PORT: 6379,
        SESSION_SECRET: 'somesessionsecret!?*',
        APP_SECRET: 'secret',
        NODE_ENV: 'development',
        MAIL_TO: 'madit@capsim.com',
        MAIL_FROM: 'error@dev1ww5.capsim.com',
        ASSETS_URL: 'http://devassets.capsim.com/assets',
        ASSETS_HOST: 'devassets.capsim.com',
        ASSETS_USERNAME: 'assets',
        DB_HOST: '10.134.136.202'
    }
}

new Promise( (resolve) => {
    let environment = Object.assign(environments['dev'], { DB_USER: process.argv[2] })
    let fileContent = Object.keys(environment).map( key => { return `${key}=${environment[key]}` })
    resolve( fileContent )
})
.then( fileContent => fs.writeFileSync( '.env', fileContent.join('\n') ) )
.catch( err => console.log( err ) )
