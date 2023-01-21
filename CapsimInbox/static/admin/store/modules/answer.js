const base = require('./resource')

module.exports = {

    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/answers',
        resourceName: 'Answer'
    },

    ...base

}
