var Request = function( data ) { return Object.assign( this, data ) },
http = require('http'),
querystring = require('querystring')

module.exports = Object.assign( Request.prototype, {
	
	buildQueryString( data ) {
        // if ( data === undefined ) return `?${querystring.stringify({ dataSourceConnection: process.env.API_WW3_HOSTNAME })}`
        if ( data === undefined ) return ''; 
		return `?${querystring.stringify( Object.assign( data, { dataSourceConnection: process.env.API_WW3_HOSTNAME }) )}`; 
	},

	_handleResponse( response ) {
    /*
      return new Promise( ( resolve, reject ) => {
        if( response.statusCode !== 200 ) {
          response.resume()
          //return reject( new Error( `Request failed with status code: ${ response.statusCode }` ) )
          let status = response.statusCode;
          let message = response.statusMessage;
          return reject({message, status});
      }

      let body = []
      response.on( 'data', chunk => body.push( chunk ) )
      response.on( 'end', () => { resolve( JSON.parse( body.join('') ) ) } )
    })
    */
		return new Promise( ( resolve, reject ) => {
      let body = []
      let status = response.statusCode

			if( status !== 200 ) {
        response.on( 'data', chunk => body.push( chunk ) )
        response.on("end", () => {
          let data = body.join("")  
          try {
            return reject({ status, message: JSON.parse(data).message })
          } catch(e) {
            console.log(e)
            let error = new Error( `Request failed with status code: ${ status }`)
            return reject({ error, status })
          }

        })
				
			} else {
        response.on( 'data', chunk => body.push( chunk ) )
        response.on( 'end', () => {
             response.req.path.indexOf("login") !== -1
             ? resolve(response.headers.authorization)
             : resolve(JSON.parse(body.join("")))
          })
      }
		})
	},
	
	GET( path, data = undefined) {
    return new Promise( (resolve, reject) => {
      const options = {
        hostname: process.env.ENV_API_HOSTNAME,
        path: `${process.env.API_PREFIX}${path}${this.buildQueryString(data)}`,
        port: process.env.ENV_API_PORT,
        method: 'GET'
      };
      http.get( options, response => {
        this._handleResponse( response )
        .then( data => resolve( data ) )
        .catch( err => {
          err.failedCall = {
            host: response.client._httpMessage._headers.host,
            path: response.client._httpMessage.path,
            method: response.client._httpMessage.method
          }
          reject( err )
        })
      })
      .on('error', err => reject( err ) )
    })
  },

  GETSession( path, data = undefined ) {

    return new Promise( (resolve, reject) => {

      let options = {
        hostname: process.env.ENV_API_WW4_HOSTNAME,
        path: `${path}${this.buildQueryString(data)}`,
        method: 'GET'
      };

      http.get( options, response => {
        this._handleResponse( response )
        .then( data => resolve( data ) )
        .catch( err => reject( err ) )
      })
      .on('error', err => reject( err ) )
    })
  },

  POST( path, data = undefined ) {

    var postData = querystring.stringify(data)

    return new Promise( (resolve, reject) => {

      let options = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
        hostname: process.env.ENV_API_HOSTNAME,
        port: process.env.ENV_API_PORT,
        path: `${path}`,//${this.buildQueryString(data)}`,
        method: 'POST'
      };

      let req = http.request( options, ( response ) => {
        this._handleResponse( response )
        .then( data => resolve( data ) )
        .catch( err => reject( err ) )
      })
      req.write(postData)
      req.on('error', err => reject( err ) )
      req.end();

    })
},
 PUT( path, data = undefined ) {

    var putData = querystring.stringify(data)

    return new Promise( (resolve, reject) => {
      let options = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          //'Content-Length': Buffer.byteLength(putData),
        },
        hostname: process.env.ENV_API_HOSTNAME,
        port: process.env.ENV_API_PORT,
        path: `${path}${this.buildQueryString(data)}`,
        method: 'PUT'
      };      
      let req = http.request( options, ( response ) => {
        this._handleResponse( response )
        .then( data => resolve( data ) )
        .catch( err => reject( err ) )
      })
        req.on('error', err => reject( err ) )
        req.end();
      });
  },
  DELETE( path, data = undefined ) {
    var deleteData = querystring.stringify(data)

    return new Promise( (resolve, reject) => {
      let options = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          //'Content-Length': Buffer.byteLength(putData),
        },
        hostname: process.env.ENV_API_HOSTNAME,
        port: process.env.ENV_API_PORT,
        path: `${path}${this.buildQueryString(data)}`,
        method: 'DELETE'
      };

      let req = http.request( options, ( response ) => {
        this._handleResponse( response )
        .then( data => resolve( data ) )
        .catch( err => reject( err ) )
      })
        req.on('error', err => reject( err ) )
        req.end();
      });

  },
  GETlanguage( path, data = undefined ) {

    return new Promise( (resolve, reject) => {
      let options = {
        hostname: process.env.ENV_API_WW4_HOSTNAME,
        path: `${path}${this.buildQueryString(data)}`,
        method: 'GET'
      };

      http.get( options, response => {
        this._handleResponse( response )
        .then( data => resolve( data ) )
        .catch( err => reject( err ) )
      })
      .on('error', err => reject( err ) )
    })
  }
})