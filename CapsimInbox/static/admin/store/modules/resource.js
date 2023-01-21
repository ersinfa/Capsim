module.exports = {

    actions: {

        CREATE_RESOURCE: ({ state, dispatch }, payload ) => {

          let successMessage = `${state.resourceName} has been successfully created.`
          let errorMessage = `There was a problem while creating the ${state.resourceName}.`

            return new Promise( (resolve, reject) => {

                $.ajax({
                    url: state.resourceUrl,
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

        DELETE_RESOURCE: ({ state, dispatch }, resourceKey ) => {

            let successMessage = `${state.resourceName} has been successfully deleted.`
            let errorMessage = `There was a problem while deleting the ${state.resourceName}.`

            return new Promise( (resolve, reject) => {

                $.ajax({
                    url: `${state.resourceUrl}/${resourceKey}`,
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

        GET_RESOURCE: ({ state }, resourceKey ) => {

            return new Promise( (resolve, reject) => {

                $.ajax({
                    url: `${state.resourceUrl}/${resourceKey}`,
                    method: 'get',
                    dataType: 'json'
                })
                .done( resource => resolve(resource) )
                .fail( err => reject( err ) )
            })
        },

        SAVE_RESOURCE: ({ state, dispatch }, { payload, resourceKey }) => {

            let successMessage = `${state.resourceName} has been successfully updated.`
            let errorMessage = `There was a problem while updating the ${state.resourceName}.`

            return new Promise( (resolve, reject) => {

                $.ajax({
                    url: `${state.resourceUrl}/${resourceKey}`,
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

    }
}
