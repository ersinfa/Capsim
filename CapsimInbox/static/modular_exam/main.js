import Vue from 'vue';
import VueRouter from 'vue-router';
import jquery from 'jquery'; 

import App from './App.vue';
import Routes from './router';
import store from './store/index'; 
import 'bootstrap';

Vue.use(VueRouter);
window.jQuery = window.$ = jquery; 

new Vue({
  el: '#app',
  router: Routes,
  render: (h) => h(App),
  store
});
