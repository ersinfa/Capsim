require('../bootConfig')
import App from './App.vue'
import store from './store'
import Home from './components/Home.vue'
import ReportWindow from './components/ReportWindow.vue'


// import Home from './components/Home2.vue'
import Welcome from './components/Welcome.vue'
import Feedback from './components/Feedback.vue'
import { 
  AnnualReport, ProductionInformation, 
  StatisticsReport, StockBondSummary,
  SalaryReport, Images
} from './components/reports'


window.EventBus = new Vue()
window.store = store
window.tinymce = require('tinymce')

window.Highcharts = require('highcharts')
require('highcharts/highcharts-more')(window.Highcharts);
require('highcharts/modules/solid-gauge')(window.Highcharts);
require('highcharts/modules/heatmap')(window.Highcharts);

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
require('bootstrap-sass')

Vue.use(VueRouter)
Vue.component('wysiwyg', require('../shared_components/TinyMce.vue'))

const routes = [
  { path: '/capsiminbox/webapp', meta: { showTopNav: true }, component: Home }, 
  { path: '/capsiminbox/webapp/reports', name: 'report-window',  component: ReportWindow,
      children: [
        { path: 'annual-report', name: 'annual-report',  component: AnnualReport, meta: {title: 'Annual Report'} }, 
        { path: 'production-information-report', name: 'production-information-report',  component: ProductionInformation, meta: {title: 'Production Information'} },
        { path: 'salary-report', name: 'salary-report',  component: SalaryReport, meta: {title: 'Salary Report'} }, 
        { path: 'statistics-report', name: 'statistics-report',  component: StatisticsReport, meta: {title: 'Statistics Report'} }, 
        { path: 'stock-bond-report', name: 'stock-bond-report',  component: StockBondSummary, meta: {title: 'Stock & Bond Summary'} },
        { path: 'images/:id', name: 'images',  component: Images, meta: {title: 'images'} },
        { path: '', redirect: 'annual-report'}
    ]
  },
  { path: '/capsiminbox/demo/assessment', meta: { showTopNav: true }, name: 'assessment', component: Home },
  { path: '/capsiminbox/demo/feedback', name: 'feedback', component: Feedback },
  { path: '/capsiminbox/demo/welcome', component: Welcome },

  { path: '/capsiminbox/rehearsal', meta: { showTopNav: true }, component: Home }, 
  { path: '/capsiminbox/rehearsal/annual-report', name: 'annual-report',  component: AnnualReport, meta: {title: 'Annual Report'} }, 
  { path: '/capsiminbox/rehearsal/production-information-report', name: 'production-information-report',  component: ProductionInformation, meta: {title: 'Production Information'} },
  { path: '/capsiminbox/rehearsal/statistics-report', name: 'statistics-report',  component: StatisticsReport, meta: {title: 'Statistics Report'} }, 
  { path: '/capsiminbox/rehearsal/stock-bond-report', name: 'stock-bond-report',  component: StockBondSummary, meta: {title: 'Stock & Bond Summary'} },

  { path: '*', redirect: '/capsiminbox/demo/welcome' }
]

const router = new VueRouter({
  routes,
  mode: 'history',
  base: '/'
})

new Vue({ // eslint-disable-line no-new
  router,
  el: '#app',
  store,
  render: (h) => h(App)
})
