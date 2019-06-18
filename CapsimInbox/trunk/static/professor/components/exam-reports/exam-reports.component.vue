<template lang="html">
    <div id="capsim-professor-exam-reports" v-if="isExam === 1">
        <h1> Reports </h1>
        <div class="panel panel-default">
            <div class="panel-body">

                <div class="row report-section">
                    <div class="col-md-12">
                        <router-link to="/professor/assurance-of-learning" class="btn btn-success" >
                            Access
                        </router-link>
                        <span class="report-headers">Assurance Of Learning Report</span>
                        <div class="report-into-text">
                            A report of each student’s scoring on Learning Goals included in the exam’s question set.
                        </div>
                    </div>
                </div>
                <div class="row report-section">
                    <div class="col-md-12">
                        <router-link to="/professor/learning-objective-scores" class="btn btn-success" >
                            Access
                        </router-link>
                        <span class="report-headers">Learning Objectives</span>
                        <div class="report-into-text">
                            A report showing what percentage of students answered correctly for each Learning Objective included in the exam
                        </div>
                    </div>
                </div>

                 <div class="row report-section">
                    <div class="col-md-12">
                        <router-link to="/professor/skill-scores" class="btn btn-success" >
                            Access
                        </router-link>
                        <span class="report-headers">Concept Matrix</span>
                        <div class="report-into-text">
                            A matrix of each student and whether or not they correctly answered their question. A correct answer is notated with a ‘1’, while an incorrect answer displays a ‘0’. Partial credit will display as a decimal.
                        </div>
                    </div>
                </div>

                 <div class="row report-section">
                    <div class="col-md-12">
                        <router-link to="/professor/all-attempts-report" class="btn btn-success" >
                            Access
                        </router-link>
                        <span class="report-headers">All Attempts</span>
                        <div class="report-into-text">
                        Two reports that should be used if exam retakes are utilized. These are modified versions of the Concept Matrix and Course Roster from your Professor Dashboard.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'capsim-professor-exam-reports',
    computed: {
        ...mapState(['isExam'])
    }
}
</script>
<style lang="scss" scoped>
    .report-into-text{
        margin-left:88px
    }
    .report-headers{
        margin-left: 15px!important;
        font-weight: 700!important;
        font-size: 18px!important;
    }
    .report-section{padding: 15px;}
</style>
