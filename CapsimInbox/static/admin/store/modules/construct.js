const base = require('./resource')

module.exports = {

    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/construct',
        resourceName: 'Construct'
    },

    ...base

}