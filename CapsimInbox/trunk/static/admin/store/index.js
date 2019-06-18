import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({

  state: {
      assetsPath: null,
      versionKeyActive: 0,
      alert: {
        message: '',
        isActive: false,
        isWarning: false
      },
      user: {
          authenticated: false,
          isAdmin: false
      }
  },

  modules: {
    answer: require('./modules/answer'),
    skill: require('./modules/skill'),
    competency: require('./modules/competency'),
    learningGoal: require('./modules/learningGoal'),
    question: require('./modules/question'),
    questionGroup: require('./modules/questionGroup'),
    author: require('./modules/author'),
    folder: require('./modules/folder'),
    version: require('./modules/version'),
    role: require('./modules/role'),
    questionnaire: require('./modules/questionnaire'),
    professorResources: require('./modules/professorResources'),
    dependsOn: require('./modules/dependsOn'),
    construct: require('./modules/construct'),
    postAssessmentQuestion: require('./modules/postAssessmentQuestion')
  },

  actions: {

      LOGIN({ commit }, payload) {
          return new Promise( (resolve, reject) => {
              $.ajax({
                  url: '/capsiminbox/admin/login',
                  method: 'post',
                  data: JSON.stringify({
                      username: payload.username,
                      password: payload.password
                  }),
                  contentType: 'application/json'
              })
              .done( data => {
                  commit('SET_USER', data)
                  resolve()
              })
              .catch( err => reject(err) )
          })
      },

      NOTIFY: ({ commit }, { message, isWarning }) => {
          let alert = {alert: { message, isWarning, isActive: true } }
          commit('SET_ALERT', alert)
          setTimeout( () => commit('SET_ALERT', { message: '', isWarning: false, isActive: false }), 5000 )
      }
  },

  mutations: {

      SET_STATE: ( state ) => {
          Object.assign(state, window.data)
          delete window.data
          document.getElementById('init-data').remove()
      },

      SET_EDIT_VERSION( state, versionKeyActive ) {
        state.versionKeyActive = versionKeyActive
          $.ajaxSetup({
              headers: {
                  'Version-Key': versionKeyActive
              }
          })
      },

      SET_USER: (state, data) => Object.assign(state, data),

      SET_ALERT: (state, alert) => {
          Object.assign(state, alert)
      }
  },

  getters: {
      authenticated: state => state.user.authenticated,
      isAdmin: state => state.user.isAdmin,
      alert: state => state.alert,
      versionKeyActive: state => state.versionKeyActive
  }
})

module.exports = store
