import Vue from 'vue'
import App from './App.vue'
import moment from 'moment'
import VueRouter from 'vue-router'
import store from './store'

window.tinymce = require('tinymce')
window.jQuery = window.$ = require('jquery')

Vue.use(VueRouter)
Vue.component('back-button', require('./components/backButton.vue'))
Vue.component('modal', require('../shared_components/Modal.vue'))
Vue.component('wysiwyg', require('../shared_components/TinyMce.vue'))
Vue.component('custom-input', require('../shared_components/inputs/Input.vue'))
Vue.component('loader', require('../shared_components/loader.vue'))
Vue.component('notify', require('../shared_components/Notification.vue'))
Vue.component('switcher', require('../shared_components/switch.vue'))
Vue.mixin({
	computed: {
		isAdmin() {
			return store.state.user.isAdmin
		}
	}
})

require('bootstrap-sass')

Object.defineProperty(Vue.prototype, '$moment', { value: moment })

new Vue({ // eslint-disable-line no-new
    router: require('./router'),
    el: '#app',
    store: require('./store/index'),
    render: (h) => h(App)
})
