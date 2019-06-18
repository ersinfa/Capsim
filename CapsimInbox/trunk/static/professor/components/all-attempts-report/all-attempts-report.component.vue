<template>
    <div id="all-attempts-report" v-if="isExam === 1">
        <h1>Reports </h1>
        <ol class="breadcrumb">
          <li><router-link to="/professor/exam-reports">Reports</router-link></li>
          <li class="active">All Attempts</li>
        </ol>
        <concept-matrix></concept-matrix>
        <score-overview></score-overview>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import conceptMatrix from './concept-matrix.component.vue'
import scoreOverview from './score-overview.component.vue'

export default {
    name: 'capsim-professor-learning-report',
    data: () => ({
    }),

    computed: {
        ...mapState(['isExam']),
    },

    components: {  conceptMatrix, scoreOverview }
}
</script>
