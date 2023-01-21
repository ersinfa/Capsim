require("babel-polyfill")
window.Vue = require('vue')
window.Vuex = require('vuex')
window.VueRouter = require('vue-router')
window.$ = window.jQuery = require('jquery')

Object.defineProperty( Vue.prototype, '$moment', { value: require('moment') } )
