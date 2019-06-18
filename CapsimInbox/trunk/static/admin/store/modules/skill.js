const base = require('./resource')

module.exports = {

    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/skills',
        resourceName: 'Skill'
    },

    ...base

}
