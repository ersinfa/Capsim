const base = require('./resource')

module.exports = {

    namespaced: true,

    state: {
        resourceUrl: '/capsiminbox/admin/api/entry-questions',
        answersUrl: '/capsiminbox/admin/api/entry-answers',
        resourceName: 'Question'
    },

    actions: {

      FETCH_ALL: ({ state }, query) => {
        return new Promise( (resolve, reject) => {
          $.get(state.resourceUrl, query)
          .done( questions => resolve(questions) )
          .fail( err => reject(err) )
        })
      },

      CREATE_ANSWER: ({ state, dispatch }, payload) => {

          let successMessage = 'Answer has been successfully created'
          let errorMessage = 'There was a problem while creating the answer.'

          return new Promise( (resolve, reject) => {

              $.ajax({
                  url: state.answersUrl,
                  method: 'post',
                  data: JSON.stringify(payload),
                  contentType: 'application/json',
                  dataType: 'json'
              })
              .done( resource => {
                  dispatch('NOTIFY', { message: successMessage, isWarning: false }, { root: true })
                  resolve(resource)
              })
              .fail( err => {
                dispatch('NOTIFY', { message: errorMessage, isWarning: true }, { root: true })
                reject( err )
              })
          })
      },

      DELETE_ANSWER: ({ state, dispatch }, resourceKey ) => {

          let successMessage = `Answer has been successfully deleted.`
          let errorMessage = `There was a problem while deleting the answer.`

          return new Promise( (resolve, reject) => {

              $.ajax({
                  url: `${state.answersUrl}/${resourceKey}`,
                  method: 'delete'
              })
              .done( () => {
                  dispatch('NOTIFY', { message: successMessage, isWarning: false }, { root: true })
                  resolve()
              })
              .fail( err => {
                dispatch('NOTIFY', { message: errorMessage, isWarning: true }, { root: true })
                reject( err )
              })
          })
      },

      GET_ANSWER: ({ state }, resourceKey ) => {

          return new Promise( (resolve, reject) => {

              $.ajax({
                  url: `${state.answersUrl}/${resourceKey}`,
                  method: 'get',
                  dataType: 'json'
              })
              .done( resource => resolve(resource) )
              .fail( err => reject( err ) )
          })
      },

      SAVE_ANSWER: ({ state, dispatch }, { payload, resourceKey }) => {

          let successMessage = `Answer has been successfully updated.`
          let errorMessage = `There was a problem while updating the answer.`

          return new Promise( (resolve, reject) => {

              $.ajax({
                  url: `${state.answersUrl}/${resourceKey}`,
                  method: 'put',
                  data: JSON.stringify(payload),
                  contentType: 'application/json',
                  dataType: 'json'
              })
              .done( resource => {
                  dispatch('NOTIFY', { message: successMessage, isWarning: false }, { root: true })
                  resolve(resource)
              })
              .fail( err => {
                dispatch('NOTIFY', { message: errorMessage, isWarning: true }, { root: true })
                reject( err )
              })
          })
      },

      ...base.actions
    }

}
