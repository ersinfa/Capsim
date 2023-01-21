import Vue from 'vue'
import Vuex from 'vuex'
import http from 'jquery'

Vue.use(Vuex)

const store = new Vuex.Store({

    state: {
        skills: [],
        settings: {},
        session: {},
        allAssessments: {},
        selectedStsKey: null,
        questions: [],
        goals: [],
        idpScore: [],
        skillsInfo: {},
        report: {},
        isPrint: false,
        logo: '',
        assetsPath: '',
        surveyLink: '',
        allFiles: [],
        studentSettings: {},
        postAssessmentAnswers: []
    },

    actions: {

        SET_SETTING: ({ commit }, { key, value, configName = 'pages' }) => {
            return new Promise( (resolve, reject) => {
                http.ajax({
                    url: '/capsiminbox/student/setSettings',
                    method: 'POST',
                    data: JSON.stringify({
                        key,
                        value,
                        configName
                    }),
                    contentType: 'application/json'
                })
                .done( () => resolve() )
                .fail( err => reject(err) )
            })
            .then( () => commit('SET_PAGE', { key, value, configName }) )
        },

        GET_SETTINGS: ({ commit }) => {
            return new Promise( (resolve, reject) => {
                http.ajax({
                    url: '/capsiminbox/student/getSettings',
                    method: 'GET',
                    contentType: 'application/json'
                })
                .done( (data) => {
                    commit('SET_STUDENT_SETTINGS', data)
                    resolve()
                } )
                .fail( err => {
                    console.log(err)
                    reject(err) 
                })
            })
        },

        SET_ASSESSMENT: ({ commit }, skills) => {
            return new Promise( ( resolve, reject ) => {
                http.ajax({
                    url: '/capsiminbox/student/self-assessment',
                    method: 'POST',
                    data: {
                        skills: JSON.stringify(skills)
                    }
                })
                .done( () => resolve() )
                .fail( err => reject(err) )
            })
        },

        UPDATE_SESSION: ({commit}, {stsKey, toRoute}) =>{
            return new Promise( ( resolve, reject ) => {
                http.ajax({
                    url: '/capsiminbox/student/update-session',
                    method: 'PUT',
                    data: JSON.stringify({stsKey, toRoute}),
                    //req.bosydataType: 'json',
                    contentType: 'application/json'
                })
                .done( (data) => {
                    commit('UPDATE_STATE', data)
                    resolve()
                } )
                .fail( err => reject(err) )
            })
          
        },

        GET_ASSESSMENT_ANSWERS: ({ commit }) => {
            return new Promise( ( resolve, reject ) => {
                http.ajax({
                    url: '/capsiminbox/student/self-assessment',
                    method: 'GET',
                })
                .done( data => resolve(data) )
                .fail( err => reject(err) )
            })
        },

        GET_QUESTIONS_ANSWERS: ({ commit }) => {
            return new Promise( (resolve, reject) => {
                http.ajax({
                    url: '/capsiminbox/student/getQuestionnaireAnswers',
                    method: "GET",
                    dataType: 'json'
                })
                .done( data => resolve(data) )
                .fail( err => reject(err) )
            })
        },

        POST_ANSWERS: ({ commit }, questions) => {
            return new Promise( (resolve, reject) => {
                http.ajax({
                    url: '/capsiminbox/student/setQuestionnaire',
                    method: "POST",
                    data: {
                        answers: JSON.stringify( questions )
                    }
                })
                .done( () => resolve(questions) )
                .fail( err => reject(err) )
            })
            .then( questions => commit('UPDATE_STATE', { questions }) )
        },

        POST_POST_ASSESSMENT: ({ commit, state }, {answers, stsKey}) => {
            return new Promise( (resolve, reject) => {
                http.ajax({
                    url: '/capsiminbox/student/setPostAssessmentAnswers',
                    method: "POST",
                    data: {
                        answers: JSON.stringify( answers )
                    }
                })
                .done( (data) => resolve(data))
                // .fail( err => reject(err) )
            })
            .then( ()=> {
                let allAssessments = {}
                allAssessments[stsKey] = Object.assign({}, state.allAssessments[stsKey])
                allAssessments[stsKey].settings.postAssessment = {completed: true}
                commit('UPDATE_STATE', { allAssessments }) 
            })
        },

        GET_IDP_GOALS: ({ commit }) => {
            return new Promise( (resolve, reject) => {
                http.ajax({
                    url: `/CapsimInbox/student/getStudentGoals`,
                    method: "POST",
                    dataType: 'json'
                })
                .done( goals => {
                    goals.forEach( goal => {
                        let innerGoal = JSON.parse(goal.goal)
                        Object.assign(goal, {
                            ...innerGoal,
                            selectedSkill: ( innerGoal.selectedSkill < 1 ) ? 1 : innerGoal.selectedSkill
                        })
                    })
                    resolve( goals )
                })
                .fail( err => reject(err) )
            })
            .then( goals => commit('UPDATE_STATE', { goals }) )
        },

        GET_IDP_SCORE: ({ commit }, params) => {
            return new Promise( (resolve, reject) => {
                http.ajax({
                    url: '/CapsimInbox/student/getIDPData',
                    method: "GET",
                    data: params
                })
                .done( data => resolve( data ) )
                .fail( err => reject(err) )
            })
            .then( idpScore => commit('UPDATE_STATE', { idpScore }) )
        },

        GET_SKILLS_INFO: ({ commit }, params) => {
            return new Promise( (resolve, reject) => {
                http.ajax({
                    url: '/CapsimInbox/student/getSkillsInfo',
                    method: "GET",
                    dataType: 'json'
                })
                .done( data => resolve( data ) )
                .fail( err => reject(err) )
            })
            .then( skillsInfo => commit('UPDATE_STATE', { skillsInfo }) )
        },

        SET_IDP_GOAL: ({ commit }, goal) => {
            return new Promise( ( resolve, reject ) => {
                http.ajax({
                    url: '/capsiminbox/student/setStudentGoal',
                    method: 'POST',
                    data: {data: JSON.stringify(goal)}
                })
                .done( data => resolve(data) )
                .fail( err => reject(err) )
            })
        },

        UPDATE_IDP_GOAL: ({ commit }, data) => new Promise( (resolve, reject) => {
            let goal = {
                goal: data.goal,
                selectedSkill: data.selectedSkill,
                reflect: data.reflect,
                plan: data.plan
            }
            http.ajax({
                url: '/capsiminbox/student/update-goal',
                method: 'PUT',
                data: {
                    goal: JSON.stringify(goal),
                    studentGoalKey: data.studentGoalKey
                },
                dataType: 'json'
            })
            .done( () => resolve() )
            .fail( () => reject() )
        }),

        GET_ASSESSMENTS: ({ commit }, data ) => {
          return new Promise((resolve, reject) => {
            http.ajax({
                    url: `/capsiminbox/student/get-assessments`,
                    method: 'GET'
                })
                .done( (data) => { resolve(data) })
                .fail( err => reject(err) )
            })
            .then( (allAssessments) => {commit('UPDATE_STATE', {allAssessments})
          })
        },

        GET_FILES: ({ commit }, data ) => {
            return new Promise((resolve, reject) => {
              http.ajax({
                      url: `/capsiminbox/student/all-files`,
                      method: 'GET'
                  })
                  .done( (data) => { resolve(data[0].files) })
                  .fail( err => reject(err) )
              })
              .then( (allFiles) => {commit('UPDATE_STATE', {allFiles})
            })
        },

        SET_STUDENT_CYCLE:({ commit }, stsKey ) => {
            return new Promise((resolve, reject) => {
                http.ajax({
                        url: `/capsiminbox/student/set-cycle`,
                        method: 'POST',
                        data: {
                            FK_studentToSimKey: JSON.stringify(stsKey)
                        },
                        dataType: 'json'
                    })
                    .done( () => resolve() )
                    .fail( err => reject(err) )
                })
                .then( (allFiles) => {commit('UPDATE_STATE', {allFiles})
            })
        },

        ADVANCE_STUDENT_CYCLE:({ commit }, stsKey ) => {
            return new Promise((resolve, reject) => {
                http.ajax({
                        url: `/capsiminbox/student/advance-cycle`,
                        method: 'PUT',
                        data: {
                            FK_studentToSimKey: JSON.stringify(stsKey)
                        },
                        dataType: 'json'
                    })
                    .done( () => resolve() )
                    .fail( err => reject(err) )
                })
                .then( (allFiles) => {commit('UPDATE_STATE', {allFiles})
            })
        },
    },   

    mutations: {

        SET_STATE: ( state ) => {
            Object.assign(state, window.data)
            delete window.data
        },

        SET_PAGE: ( state, { key, value, configName } ) => {
            if( state.allAssessments[state.selectedStsKey].settings[configName] !== undefined ) return state.allAssessments[state.selectedStsKey].settings[configName][key] = value
            Object.assign(state.allAssessments[state.selectedStsKey].settings, { [configName]: { [key]: value } })
        },

        UPDATE_STATE: ( state, data ) => Object.assign( state, data ),

        SET_STUDENT_SETTINGS: ( state, action ) => {
            state.studentSettings = action 
         },

    },

    getters: {
        goals: state => state.goals,
        idpScore: state => state.idpScore,
        skillsInfo: state => state.skillsInfo,
        reportComponents: state => state.report.reportComponents,
        reportCompetencies: state => state.report.competencies,
        selectedAssessment: state => state.allAssessments[state.selectedStsKey]
    }
})

module.exports = store
