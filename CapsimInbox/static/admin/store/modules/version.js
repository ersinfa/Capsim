const base = require('./resource')

module.exports = {

    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/versions',
        resourceName: 'Version'
    },

    ...base

}
