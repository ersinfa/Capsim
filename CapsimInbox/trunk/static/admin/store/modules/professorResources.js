const base = require('./resource')

module.exports = {

    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/professor-resources',
        resourceName: 'ProfessorResources'
    },

    ...base

}
