const session = require('express-session')

const createSessionStore = (session) => {

    const RedisStore = require('connect-redis')(session)
    const redisClient = require('redis').createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    })

    return new RedisStore({
        client: redisClient,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    })
}

const sessionOptions = {
    name: 'CISESSIONID',
    secret: process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false,
    store: createSessionStore(session),
    cookie: { httpOnly: true, maxAge: null, sameSite: false },
    unset: 'destroy'
};

module.exports = session(sessionOptions)
