const base = require('./resource')

module.exports = {

    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/competencies',
        resourceName: 'Competency'
    },

    ...base

}
