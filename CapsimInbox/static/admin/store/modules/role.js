const base = require('./resource')

module.exports = {

    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/roles',
        resourceName: 'Company Info'
    },

    ...base

}
