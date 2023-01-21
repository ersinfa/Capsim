require("babel-polyfill");
import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import moment from 'moment'
import store from './store'
import datePicker from 'vue-bootstrap-datetimepicker'
import datatableExport from './components/tableExport.vue'
Vue.component('downloadExcel', datatableExport);

window.jQuery = window.$ = require('jquery')

require('bootstrap-sass')

Object.defineProperty(Vue.prototype, '$moment', { value: moment })

Vue.use(VueRouter)
Vue.use(datePicker)
 
const routes = [
  { name: 'AssuranceOfLearning', path: '/professor/assurance-of-learning', component: require('./components/assurance-of-learning/learning-report.component.vue') },
  { name: 'AllAttemptsReport', path: '/professor/all-attempts-report', component: require('./components/all-attempts-report/all-attempts-report.component.vue') },
  { name: 'CourseSettings', path: '/professor/course-settings', component: require('./components/CourseSettings.vue') },
  { name: 'Dashboard', path: '/professor/dashboard', component: require('./components/Dashboard.vue') },
  { name: 'ExamReports', path: '/professor/exam-reports', component: require('./components/exam-reports/exam-reports.component.vue') },
  { name: 'ExamEdit', path: '/professor/exam-edit', component: require('./components/exam-edit/exam-edit.component.vue') },
  { name: 'HelpResources', path: '/professor/help-resources', component: require('./components/HelpResources.vue') },
  { name: 'LearningObjectiveScores', path: '/professor/learning-objective-scores', component: require('./components/learning-objectives/learning-objectives.component.vue') },
  { name: 'StudentSettings', path: '/professor/student-settings/:stsKey', component: require('./components/StudentSettings.vue') },
  { name: 'SkillScores', path: '/professor/skill-scores', component: require('./components/SkillScores.vue') },
  { name: 'ParticipantDetails', path: '/professor/participant-details/:stsKey', component: require('./components/ParticipantDetails.vue') },
  { name: 'WrittenResponses', path: '/professor/written-responses/:stsKey', component: require('./components/WrittenResponses.vue') },
  { name: 'StudentFiles', path: '/professor/student-files/:stsKey', component: require('./components/StudentFiles.vue') },
  { path: '*', redirect: '/professor/dashboard' }
]
const router = new VueRouter({
  routes,
  mode: 'history',
  base: '/CapsimInbox/',
  linkActiveClass: 'active'
})

if( document.getElementById("app") ) {

    new Vue({ // eslint-disable-line no-new
        router,
        store,
        el: '#app',
        render: (h) => h(App)
    })
}
