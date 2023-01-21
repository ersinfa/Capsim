import VueRouter from 'vue-router';

// Components 
import Home from './components/Home.vue'; 

const routes = [
    { path: '/', name: 'HomePage', component: Home},
    // Make better route matching once i have time. 
    { path: '*', redirect: '/modularexam/' }
]; 
const Router = new VueRouter({
    routes,
    mode: 'history',
    base: '/modularexam/',
    linkActiveClass: 'active',
    linkExactActiveClass: "active" // active class for *exact* links.    
});
export default Router; 