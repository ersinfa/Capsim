require("babel-polyfill");

Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import safeGet from 'lodash/get'
import moment from 'moment'
import datePicker from 'vue-bootstrap-datetimepicker'
import IDPBuilder from './components/IDP/index.vue'

window.EventBus = new Vue()

Object.defineProperty(Vue.prototype, '$safeGet', { value: safeGet })
Object.defineProperty(Vue.prototype, '$moment', { value: moment })

window.Highcharts = require('highcharts')
require('highcharts/highcharts-more')(window.Highcharts);
require('highcharts/modules/solid-gauge')(window.Highcharts);
require('highcharts/modules/heatmap')(window.Highcharts);

window.jQuery = window.$ = require('jquery')
require('bootstrap-sass')

Vue.use(VueRouter)
Vue.use(datePicker)
Vue.component('circle-icon', {
	props: ['radius', 'color'],
	render(createElem) {
		return createElem('svg', {
			attrs: {
				height: (this.radius*2),
				width: (this.radius*2)
			}
		}, [
			createElem('circle', {
				attrs: {
					cx: this.radius,
					cy: this.radius,
					r: this.radius,
					fill: this.color
				}
			})
		])
	}
})
Vue.component('rect-icon', {
	props: ['size', 'color'],
	render(createElem) {
		return createElem('svg', {
			attrs: {
				height: this.size,
				width: this.size
			}
		}, [
			createElem('rect', {
				attrs: {
					width: this.size,
					height: this.size,
					fill: this.color
				}
			})
		])
	}
})

const store = require('./store')

const routes = [
  { name: 'Walkthrough',
    component: require('./components/Walkthrough.vue'),
    path: '/student/walkthrough',
    children: [
      { name: 'Welcome', meta: { displayName: 'Welcome' },  path: 'welcome', component: require('./components/Welcome.vue') },
      { name: 'Self Assessment', meta: { displayName: 'Self Assessment' },  path: 'assessment', component: require('./components/SelfAssessment.vue') },
      { name: 'Onboarding', meta: { displayName: 'Your Role + Rehearsal' },  path: 'interface', component: require('./components/InterfaceBreakdown.vue') },
      { name: 'Inbox', meta: { displayName: 'Inbox' },  path: 'inbox', component: require('./components/Inbox.vue') },
      { name: 'Report', meta: { displayName:  'Report' },  path: 'report', component: require('./components/Report/index.vue') },
      { name: 'IDP Builder', meta: { displayName: 'IDP Builder' },  path: 'idpbuilder', component: IDPBuilder}
    ]
  },
  { name: 'Account', path: '/student/account', component: require('./components/myAccount.vue')},
  { name: 'Dashboard', path: '/student/dashboard', component: require('./components/Dashboard/dashboard.component.vue') },
	{ name: 'Files',  path: '/student/files', component: require('./components/Files/Dashboard.vue') },
	{ name: 'Tutorials', path: '/student/tutorials', component:  require('./components/tutorials/tutorials.component.vue') },
	{ name: 'HelpResources', path: '/student/help-resources', component: require('./components/support/support.component.vue') },
	{ name: 'PostAssessment', path: '/student/post-assessment', component: require('./components/PostAssessment.vue') },
  { name: 'IDP Builder', path: '/student/dashboard/idpbuilder', component: IDPBuilder },
  { path: '*', redirect: '/student/dashboard' }
]

const router = new VueRouter({
  routes,
  mode: 'history',
  base: '/CapsimInbox/',
  fallback: true
})

new Vue({ // eslint-disable-line no-new
  router,
  store,
  el: '#app',
  render: (h) => h(App)
})
