const base = require('./resource')

module.exports = {

    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/folders',
        resourceName: 'Drive folder'
    },

    ...base

}
