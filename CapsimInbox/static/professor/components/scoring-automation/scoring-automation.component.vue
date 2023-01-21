<template >
    <div id="capsim-professor-scoring-automation">
        <h3> Scoring Automation </h3>
        
        <div class="form-inline">
            <div class="checkbox mr-15" v-for="competency in competencies">
                <label>
                <input type="checkbox" v-model="competenciesToClear" :value="competency.competencyKey"> {{competency.name}}
                </label>
            </div> 
            <br/>
            <br/>
            Score Benchmark
            <div class="input-group mr-30">
                <input type="text" class="form-control" id="exampleInputAmount" v-model="scoreBenchmark" placeholder="Percentage" style="max-width: 120px;">
                <div class="input-group-addon">%</div>
            </div>
            Time per subject area
            <div class="input-group">
               <input type="text" class="form-control" v-model="timePerSubjectArea" style="max-width: 120px;">
                <div class="input-group-addon">Minutes</div>
            </div>
            
            
           </div>

            <br/>
            <label>
            <input type="checkbox" v-model="emailScoringReportToStudents" > Email Scoring Report to Students
            </label>
            <br/>
            <br/>
            <button class="ml-30 btn btn-primary" @click="setScoringAutomation" > Submit </button>
            
        
    </div>
</template>
<script>
import http from'jquery'
import { mapState } from 'vuex'
import { debounce } from 'lodash'
export default {
    name: "capsim-professor-exam-settings",
      data: () => ({
        competenciesToClear:[],
        scoreBenchmark:null,
        emailScoringReportToStudents:null,
        timePerSubjectArea:null,
    }),
    watch: {
      
    },
    methods:{
        setScoringAutomation(){
            return new Promise( (resolve, reject) => {
                http.ajax({
                url: '/capsiminbox/professor/setScoringAutomation',
                method: "POST",
                data:{
                    data:JSON.stringify({
                        "competenciesToClear": this.competenciesToClear,
                        "scoreBenchmark": this.scoreBenchmark,
                        "emailScoringReportToStudents": this.emailScoringReportToStudents,
                        "timePerSubjectArea": this.timePerSubjectArea,
                    })
                },
                dataType: 'json'
                })
                .done( reportData => resolve(reportData) )
                .fail( err => reject(err) )
            })
            .then( data => {
                this.reportData = data
            })
        },
        getScoringAutomation(){
            return new Promise( (resolve, reject) => {
                http.ajax({
                url: '/capsiminbox/professor/getScoringAutomation',
                method: "GET",
                dataType: 'json'
                })
                .done( reportData => resolve(reportData) )
                .fail( err => reject(err) )
            })
            .then( data => {
                this.competenciesToClear = data.competenciesToClear || []
                this.scoreBenchmark = data.scoreBenchmark || null
                this.emailScoringReportToStudents = data.emailScoringReportToStudents || null
                this.timePerSubjectArea = data.timePerSubjectArea || null
            })
        },
       
    },
    computed: {
        competencies(){
            return this.$store.state.competencies
        },
        examSettings () {
            if (this.sectionSettings) return this.sectionSettings
            return null
        },
    },
     mounted () {
        this.getScoringAutomation()
    },
};
</script>
