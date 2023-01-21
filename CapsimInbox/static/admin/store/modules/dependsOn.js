const base = require('./resource')

module.exports = {
 
    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/dependsOn',
        resourceName: 'Answer Dependency'
    },

    ...base

} 
