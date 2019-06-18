import InitialState from './InitialState'; 
const Reports = {
    namespaced: true,
    state: InitialState.reports,
    actions: {
        featchReports: ({ state, commit }) => new Promise( (resolve, reject) => {
            $.get('/capsiminbox/webapp/getReports')
            .done( response => {
                commit('SET_DATA', response); 
                setTimeout( () => resolve(), 500 ); 
            })
            .fail( err => reject( err ) )
        }),
        featchReportsRehearsal: ({ state, commit }) => new Promise( (resolve, reject) => {
            $.get('/capsiminbox/webapp/getRehearsalReports')
            .done( response => {
                commit('SET_DATA', response); 
                setTimeout( () => resolve(), 500 ); 
            })
            .fail( err => reject( err ) )
        }),
    }, 
    mutations: {
        SET_DATA: (state, data) => Object.assign(state, data),
        LOAD_REPORTS: (state, action) => (state.reports = action),
    }
};
export default Reports; 
    