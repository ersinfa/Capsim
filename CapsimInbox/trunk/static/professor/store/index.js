require("babel-polyfill");
import Vue from 'vue'
import Vuex from 'vuex'
import http from'jquery'
import CONSTS from './constants'

Vue.use(Vuex)

const store = new Vuex.Store({

  state: {
    competencies: [],
    report: [],
    averages: {},
    professorResources: [],
    learningGoals: [],
    learningGoalReport: [],    
    settings: {    
      survey: {},
      time: 0,
      dashboardAccess: {
        accessStartDate : null,
        accessEndDate: null
      }
    },
    skills: [],
    examsCompleted: {},
    classAverage: {},
    localClassEndDate: '',
    localClassStartDate: '',
    startDateTime: '',
    endDateTime: '',
    worldtimeKey: 0,
    reportAvailableDate: '',
    portalUrl: '',
    studentGrades: {}
  },

  actions: {

    GET_REPORT: ({ commit }) => {
      return new Promise( (resolve, reject) => {
        http.ajax({
          url: '/capsiminbox/professor/getSkillScores',
          method: "GET",
          dataType: 'json'
        })
        .done( reportData => resolve(reportData) )
        .fail( err => reject(err) )
      })
      .then( data => {
        const { report, averages, examsCompleted, classAverage  } = data
        commit('UPDATE_STATE', { report, averages, examsCompleted, classAverage })
      })
    },

    GET_GOAL_REPORT: ({ commit }) => {
      return new Promise( (resolve, reject) => {
        http.ajax({
          url: '/capsiminbox/professor/getLearningGoals',
          method: 'GET',
          dataType: 'json'
        })
        .done(goalReport => resolve(goalReport))
        .fail( err => reject(err) )
      })
      .then(data => {
        commit('UPDATE_STATE', data)
      })
    },
   
    GET_PROFESSOR_RESOURCES: ({ commit }) => {
      return new Promise( (resolve, reject) => {
        http.ajax({
          url: '/capsiminbox/professor/getProfessorResources',
          method: "GET",
          dataType: 'json'
        })
        .done( professorResources => resolve( professorResources ) )
        .fail( err => reject(err) )
      })
      .then( professorResources => commit('UPDATE_STATE', { professorResources }) )
    },

    UPDATE_SECTION_RAW:({ commit }, payload) =>
      new Promise(function(resolve, reject) {
          http.ajax({
            url: '/capsiminbox/professor/update-raw-section',
            method: 'PUT',
            data: JSON.stringify(payload),
            contentType: 'application/json'
          })
          .done( data => {
              commit('SET_SECTION_RAW', data)
            resolve()
          })
          .fail( err => reject(err) )
    }),

    UPDATE_SECTION_RESULTS_RAW:({ commit }, payload) =>
      new Promise(function(resolve, reject) {
          http.ajax({
            url: '/capsiminbox/professor/update-results-raw-section',
            method: 'PUT',
            data: JSON.stringify(payload),
            contentType: 'application/json'
          })
          .done( data => {
              commit('UPDATE_STATE', data[0])
            resolve()
          })
          .fail( err => reject(err) )
    }),

    UPDATE_SECTION: ({ commit }, payload) =>
      new Promise(function(resolve, reject) {
          http.ajax({
            url: '/capsiminbox/professor/update-section',
            method: 'PUT',
            data: JSON.stringify(payload),
            contentType: 'application/json'
          })
          .done( data => {
            commit('UPDATE_STATE', data[0])
            resolve()
          })
          .fail( err => reject(err) )
      }),

    GET_SECTION_SETTINGS: ({ commit }, payload) =>
    new Promise(function(resolve, reject) {
        http.ajax({
          url: '/capsiminbox/professor/getSectionSettings',
          method: 'GET',
          contentType: 'application/json'
        })
        .done( data => {
          commit('SET_PROF_SETTINGS', data)
          resolve()
        })
        .fail( err => reject(err) )
    }),

    UPDATE_SIM: ({ commit }, payload) =>
      new Promise(function(resolve, reject) {
          http.ajax({
            url: '/capsiminbox/professor/update-sim',
            method: 'PUT',
            data: JSON.stringify(payload),
            contentType: 'application/json'
          })
          .done( data => {
            commit('UPDATE_STATE', data[0])
            resolve()
          })
          .fail( err => reject(err) )
      }),

    UPDATE_PROFESSOR_SETTING: ({ commit }, { key, value, configName}) => {
      return new Promise( (resolve, reject) => {
          http.ajax({
              url: '/capsiminbox/professor/update-professor-settings',
              method: 'PUT',
              data: JSON.stringify({
                  key,
                  value,
                  configName
              }),
              contentType: 'application/json'
          })
          .done( () => {
            resolve() 
          })
          .fail( err => reject(err) )
      })
      //.then( (data)=> commit('SET_PROF_SETTINGS',  data)) 
    },

    GET_PROFESSOR_SETTINGS: ({ commit }) => {
      return new Promise( (resolve, reject) => {
          http.ajax({
              url: '/capsiminbox/professor/getProfessorSettings',
              method: 'GET',
              contentType: 'application/json'
          })
          .done( (data) => {
            resolve(data) 
          })
          .fail( err => reject(err) )
      })
      .then( (data) => commit('SET_PROF_SETTINGS',  data ) )
    },

    UPDATE_LOCAL_STATE: ({ commit }, data) => {
      //  Object.assign is not being reactive 
      // commit('UPDATE_STATE', data)
      commit('UPDATE_World_Time', data)
    }
},

  mutations: {

    SET_STATE: ( state ) => {
        let skills = window.data.skills.concat(CONSTS.descriptions)
        Object.assign(state, window.data, { skills })
    },
    SET_PROF_SETTINGS: ( state, data ) => {
      state.settings = Object.assign({}, state.settings, data)
    },
    SET_SECTION_RAW: ( state, data ) => {
      const {  courseTitle, endDateTime, startDateTime  } = data
      // state.courseTitle = courseTitle
      state.localClassEndDate = endDateTime
      state.localClassStartDate = startDateTime
      // state.endDateTime = endDateTime
      // state.startDateTime = startDateTime
    },
    // Fix, Refactor later the object assign wasn't working
    UPDATE_World_Time: (state, data) => {
      const { worldtimeKey } = data
      state.worldtimeKey = worldtimeKey
    },
    UPDATE_STATE: ( state, data ) => Object.assign( state, data )
  },

  getters: {
    report: state => state.report,
    averages: state => state.averages,
    examsCompleted: state => state.examsCompleted,
    numberOfStudents: state => state.report.length,
    learningGoalKeys: state => state.learningGoals.map(x => x.name),
    skills: state => state.skills,
    hasWrittenResponse: state => state.report && state.report.some(reportObj => reportObj.writtenResponses && reportObj.writtenResponses.length > 0 ),
    skillsObj: state => {
      let retVal = {}
      state.skills.forEach(skill => retVal[skill.skillKey] = skill)
      return retVal
    }
  }
})

module.exports = store
