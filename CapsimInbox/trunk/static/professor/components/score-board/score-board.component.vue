<template lang="html">
    <div class="panel panel-default">
        <div class="panel-body">
            <h3><b> Exam Scores </b></h3> 
            <p class="text-center"><b> Exams Completed: </b> {{ examsCompleted }} / {{ numberOfStudents }}  </p> 
            <table class="table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Class Average Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(value, key) in averages">
                        <td>{{ key }}</td>
                        <td>{{ roundNumber(value) }}%</td>
                    </tr>
                    <tr style="border-top: 2px solid black;" v-if="Object.keys(averages).length > 1">
                        <td>Overall</td>
                        <td>{{classAverage.overall}}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
// import CapsimTable from '../../../shared_components/CapsimTable.vue'
import { mapGetters } from 'vuex'

export default {
    name: 'capsim-professor-score-board',
    methods: {
        roundNumber(data){
            return Math.round(data)
        }
    },
    computed: {
        ...mapGetters([
            'averages',
            'examsCompleted',
            'numberOfStudents',
            'classAverage'
        ]),
        classAverage(){
            return this.$store.state.classAverage
        }
    }
}
</script>
<style lang="scss" scoped src="./score-board.component.scss"></style>
