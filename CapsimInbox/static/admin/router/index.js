import VueRouter from 'vue-router'
import safeGet from 'lodash/get'
import store from '../store'

const routes = [
    { path: '/admin/home', name: 'home', component: require('../components/Home.vue'), meta: { needsAuth: false } },
    {
        path: '/admin/versions',
        component: require('../components/version/index.vue'),
        children: [
            { path: '', name: 'list-versions', component: require('../components/version/list.vue') },
            { path: 'create', name: 'create-version', component: require('../components/version/create.vue') },
            { path: 'edit/:resourceKey', name: 'edit-version', component: require('../components/version/edit.vue'), props: true },
            { path: 'role/:resourceKey/edit', name: 'edit-role-version', component: require('../components/version/role.vue'), props: true },
            { path: 'role/:resourceKey', name: 'show-role-version', component: require('../components/version/view-role.vue'), props: true },
            { path: ':resourceKey', name: 'show-version', component: require('../components/version/show.vue'), props: true }
        ]
    },
    {
        path: '/admin/questions',
        component: require('../components/question/index.vue'),
        children: [
            { path: ':resourceKey', name: 'show-question', component: require('../components/question/show.vue'), props: true },
            { path: ':versionKey/create', name: 'create-question', component: require('../components/question/create.vue'), props: true },
            { path: ':resourceKey/edit', name: 'edit-question', component: require('../components/question/edit.vue'), props: true },
        ]
    },
    {
        path: '/admin/questionGroup',
        component: require('../components/questionGroup/index.vue'),
        children: [
            { path: ':resourceKey', name: 'show-question-group', component: require('../components/questionGroup/show.vue'), props: true },
            { path: ':versionKey/create', name: 'create-question-group', component: require('../components/questionGroup/create.vue'), props: true },
            { path: ':resourceKey/edit', name: 'edit-question-group', component: require('../components/questionGroup/edit.vue'), props: true },
        ]
    },
    {
        path: '/admin/questionnaire',
        component: require('../components/questionnaire/index.vue'),
        children: [
            { path: ':versionKey', name: 'list-questionnaire-questions', component: require('../components/questionnaire/list.vue'), props: true },
            { path: 'question/:resourceKey', name: 'show-questionnaire-question', component: require('../components/questionnaire/show.vue'), props: true },
            { path: ':versionKey/create', name: 'create-questionnaire-question', component: require('../components/questionnaire/create.vue'), props: true },
            { path: ':resourceKey/edit', name: 'edit-questionnaire-question', component: require('../components/questionnaire/edit.vue'), props: true },
        ]
    },
    {
        path: '/admin/authors',
        component: require('../components/author/index.vue'),
        children: [
            { path: 'create', name: 'create-author', component: require('../components/author/create.vue'), props: true },
            { path: ':resourceKey', name: 'show-author', component: require('../components/author/show.vue'), props: true },
            { path: ':resourceKey/edit', name: 'edit-author', component: require('../components/author/edit.vue'), props: true },
        ]
    },
    {
        path: '/admin/answers',
        component: require('../components/answer/index.vue'),
        children: [
            { path: ':resourceKey', name: 'show-answer', component: require('../components/answer/show.vue'), props: true },
            { path: 'create', name: 'create-answer', component: require('../components/answer/create.vue') }
        ]
    },
    { path: '/admin/skills/create', name: 'create-skill', component: require('../components/skill/create.vue') },
    { path: '/admin/skills/:resourceKey', name: 'show-skill', props: true, component: require('../components/skill/show.vue') },
    { path: '/admin/skills/:resourceKey/edit', name: 'edit-skill', props: true, component: require('../components/skill/edit.vue') },

    { path: '/admin/competency/create', name: 'create-competency', component: require('../components/competency/create.vue') },
    { path: '/admin/competency/:resourceKey/edit', name: 'edit-competency', props: true, component: require('../components/competency/edit.vue') },
    { path: '/admin/competency/:resourceKey', name: 'show-competency', props: true, component: require('../components/competency/show.vue') },
    { path: '/admin/competency/:versionKey/edit-component', name: 'edit-competency-component', component: require('../components/competency/edit-component.vue'), props: true },
    
    { path: '/admin/learningGoals/create', name: 'create-learningGoal', component: require('../components/learningGoal/create.vue') },
    { path: '/admin/learningGoals/:resourceKey', name: 'show-learningGoal', props: true, component: require('../components/learningGoal/show.vue') },
    { path: '/admin/learningGoals/:resourceKey/edit', name: 'edit-learningGoal', props: true, component: require('../components/learningGoal/edit.vue') },

    { path: '/admin/drive/create', name: 'create-folder', component: require('../components/drive/create.vue') },
    { path: '/admin/drive/:resourceKey', name: 'show-folder', props: true, component: require('../components/drive/show.vue') },
    { path: '/admin/drive/:resourceKey/edit', name: 'edit-folder', props: true, component: require('../components/drive/edit.vue') },

    { path: '/admin/sim-admin', name: 'sim-admin', component:  require('../components/SimAdmin.vue') },
    { path: '/admin/student-admin', name: 'student-admin', component:  require('../components/StudentAdmin.vue') },
    { path: '/admin/professorResources/create', name: 'create-professor-resources', component: require('../components/professorResources/create.vue') },
    // { path: '/admin/drive/:resourceKey', name: 'show-folder', props: true, component: require('../components/drive/show.vue') },
    // { path: '/admin/drive/:resourceKey/edit', name: 'edit-folder', props: true, component: require('../components/drive/edit.vue') },


    { path: '*', redirect: '/admin/versions' }
]

const router = new VueRouter({
    routes,
    mode: 'history',
    base: '/capsiminbox/',
    linkActiveClass: 'active',
    scrollBehavior (to, from, savedPosition) {

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if( to.hash ) resolve({ selector: to.hash })
                else if( savedPosition ) resolve(savedPosition)
                else resolve({ x: 0, y: 0 })
            }, 1000)
        })
    }
})

router.beforeEach(function(to, from, next) {
    setTimeout( () => {
        if(safeGet(to.meta, 'needsAuth', true) && !store.getters.authenticated) next({ name: 'home' })
        else next()
    }, 200)

})

module.exports = router
