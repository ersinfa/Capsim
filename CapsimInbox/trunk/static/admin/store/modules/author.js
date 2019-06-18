const base = require('./resource')

module.exports = {

    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/authors',
        resourceName: 'Author'
    },

    ...base

}
