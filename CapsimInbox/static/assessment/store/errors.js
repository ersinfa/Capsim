import InitialState from './InitialState'; 
const Errors = {
    namespaced: true,
    state: InitialState.errors,
    actions: {
        toggle: ({ state, commit }) => {
            commit('TOGGLE_DEVELOPER', !state.developer)
        },
        errorMessage: ({ state, commit }, error) => {
            console.log('errorerror',error)
            commit('SET_ERROR_MESSAGE','error')
        },
        responseError: ({ state, commit }, error) => {
            const response = JSON.parse(error.responseText);
            const hardCodededResponse = error.hardCodededResponse;
           
            commit('SET_ERROR_ADDITIONAL_MESSAGE',hardCodededResponse)
            commit('SET_ERROR_MESSAGE',response)
            
        },
    }, 
    mutations: {
        SET_DATA: (state, data) => Object.assign(state, data),
        SET_ERROR_MESSAGE: (state, data) => {
            state.message = data;
            window.onbeforeunload = undefined;
            $('#error-response-modal').modal('toggle');            
        },
        SET_ERROR_ADDITIONAL_MESSAGE: (state, data) => {
            state.hardCodededResponse = data;
        },
        TOGGLE_DEVELOPER: (state, data) => {
            state.developer = data; 
        },
    }
};
export default Errors; 

    