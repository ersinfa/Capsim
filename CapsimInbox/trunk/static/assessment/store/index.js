require("babel-polyfill")
import Vue from 'vue'
import Vuex from 'vuex'
import { parseData } from './helpers'
import Reports from './reports';
import Errors from './errors';

Vue.use(Vuex)

const store = new Vuex.Store({

  state: {
    user: {},
    emails: [],
    messages: [],
    files: [],
    folders: [],
    userData: {},
    cycle: null,
    assessmentComplete: false,
    assetsPath: '',
    selectedQuestionID: 1,
    recentlySelectedAnswerKey: null,
    selectedSmartThreadingAnswers: [],
    deliveredEmailsLog: [],
    assessmentTypeKey: null,
    dashboardAccess: {
      accessStartDate: null,
      accessEndDate: null
    }
  },

  modules: {
    time: require('./timer'),
    chat: require('./chat'),
    email: require('./email'),
    Reports, 
    Errors
  },

  actions: {

    SET_USER: ({ commit }, user) => {
      return new Promise( (resolve, reject) => {
          $.ajax({
              url: '/capsiminbox/demo/set-user',
              method: 'post',
              data: JSON.stringify(user),
              contentType: 'application/json',
          })
          .done( () => {
              commit('SET_USER', user)
              resolve()
          })
          .fail( err => reject(err) )
      })
  },

    LOAD_STATE: ({ commit, state }) => {
      if(state.assessmentTypeKey == 1){
         return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/capsiminbox/webapp/data',
                method: 'get',
                dataType: 'json'
            })
            .done( rawData => {
                const data = parseData(rawData, state.userData)
                commit('SET_STATE', { data })
                commit('chat/SET_MESSAGES', data.messages)
                commit('email/SET_EMAILS', data.emails)
                resolve()
            })
            .fail( err => reject(err) )
        })
      }else if(state.assessmentTypeKey == 2){
       
        return new Promise(function(resolve, reject) {
          $.ajax({
              url: '/capsiminbox/rehearsal/data',
              method: 'get',
              dataType: 'json'
          })
          .done( rawData => {
              const data = parseData(rawData, state.userData)
              commit('SET_STATE', { data })
              commit('chat/SET_MESSAGES', data.messages)
              commit('email/SET_EMAILS', data.emails)
              resolve()
          })
          .fail( err => reject(err) )
      })
      } else {
        // parseData(state, state.userData)
        // commit('chat/SET_MESSAGES', state.messages)
        // commit('email/SET_EMAILS', state.emails)
        
        return new Promise(function(resolve, reject) {
          $.ajax({
              url: '/capsiminbox/demo/data',
              method: 'get',
              dataType: 'json'
          })
          .done( rawData => {
              const data = parseData(rawData, state.userData)
              commit('SET_STATE', { data })
              commit('chat/SET_MESSAGES', data.messages)
              commit('email/SET_EMAILS', data.emails)
              resolve()
          })
          .fail( err => reject(err) )
        })

      }
       
    },

    GET_ACCESS: ({ commit, state }) => {
      return new Promise(function(resolve, reject) {
          $.ajax({
              url: '/capsiminbox/student/getStudentAccess',
              method: 'get',
              dataType: 'json'
          })
          .done( rawData => {
            const { dashboardAccess } = rawData
            commit('SET_ACCESS', dashboardAccess)
          })
          .fail( err => reject(err) )
      })
  },

    START_SIM: () => $.post({ url: '/capsiminbox/webapp/log-activity', dataType: 'json', data: { actionKey: 1 } })

  },

  mutations: {

    SET_USER: (state, userData) => Object.assign(state.userData, userData),

    SET_STATE: (state, { data }) => Object.assign(state, data),

    // SET_STATE not being reactive 
    SET_ACCESS: (state, data ) => {
      state.dashboardAccess = data
    },

    SET_APP: (state) => Object.assign(state, window.data)
    
  },

  getters: {

    // Original Data
    files: state => state.files,

    folders: state => state.folders,

    userData: state => state.userData,

    // Modified Data
    assessmentComplete: (state, getters) => {
        return (getters['email/emailsCompleted'] && getters['chat/messagesCompleted']) && getters['time/elapsed'] > 5000
    },

    unreadMessages: state => state.messages.filter( message => message.isRead === true ).length,

    timer: state => state.timer,

    // Constants
    constants: () => (
      {
        'chat-width': 280,
        "ASSESSMENT_TYPE_KEY":{
          "WEBAPP"              : 1
          ,"REHEARSAL"          : 2
          ,"DEMO"               : 3
      },
      }
    ),

  }

})

export default store
