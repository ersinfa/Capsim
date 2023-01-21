const base = require('./resource')

module.exports = {

    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/questionGroup',
        resourceName: 'Question Group'
    },

    ...base

}
