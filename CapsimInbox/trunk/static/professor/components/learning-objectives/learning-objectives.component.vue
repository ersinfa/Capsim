<template>
  <div id="capsim-professor-learning-objectives" v-if="isExam ==1">
    <h1>
       Reports
    </h1>
    <ol class="breadcrumb">
      <li><router-link to="/professor/exam-reports">Reports</router-link></li>
      <li class="active">Learning Objectives</li>
    </ol>
    
    <div class="panel panel-default">
      <div class="panel-body">
         <h3>
          <b>Learning Objectives </b>
           <download-excel
                class   = "btn btn-info-dark pull-right"
                :data   = "tableRowsExport"
                :fields = "exportTableFields"
                type    = "csv"
                name    = "LearningObjectives.csv">
                Generate CSV
            </download-excel>

          <br/>
          <small>Exams Completed: {{ examsCompleted }}</small>
        </h3>
         
        <datatable :per-page="25" :columns="columns" :rows="tableData" :global-search="true" :paginate="false"></datatable>
      </div>
    </div>
  </div>
</template>
<script>
import datatable from '../table.vue'
import { mapGetters, mapState } from 'vuex'
import { camelCase } from 'lodash'
import { version } from 'punycode';

export default {
    name: "capsim-professor-learning-objectives",
    components: { datatable },
    data: () => ({
        columns: [
            { label: 'Subject Area', field: 'compentency', sortable: true, html: true },
            { label: 'Learning Objective', field: 'skill', sortable: true },
            { label: 'Average', field: 'score', sortable: true, html: true, thClass:'text-center', tdClass:'text-center' },
        ],
        classAverages: {},
        skillInfo: {},
        examsCompleted: 0
    }),
    computed: {
        ...mapGetters([
            'report',
            'skills'
        ]),
        ...mapState(['isExam']),
        // Wait for PDD to decide a format for this reprot
        tableData (){
            const result = []
            const report = this.classAverages
            if(!report) return []
            for(let compentency in report) {
                const subjectArea = compentency
                // this.columns.push(name)
                // const score = (report[compentency].score)
                const skills = (report[compentency].skills)
                for(let skillKey in skills) {
                    const skill = ((this.skillInfo[skillKey]))
                    result.push({
                        compentency: subjectArea,
                        skill: skill.name,
                        score: `<span class="sr-only">${(skills[skillKey] == 0? 0.000001 : skills[skillKey].toFixed(1)/1000)}</span>${skills[skillKey].toFixed(1)}%`,
                        scoreExport: `${skills[skillKey].toFixed(1)}%`
                    })

                }
            }
            return result
        },
        tableRowsExport(){
            const retVal = this.tableData.slice() // Creates a copy of an array
            return retVal
        },
        exportTableFields () {
            const ret = {}
            this.columns.forEach((obj) => {
                ret[obj.label] = obj.field
            });
            ret['Average']="scoreExport"
            return ret
        },

    },

    async created () {
        this.skillInfo = await this.getSkillInfo()
        const { report, examsCompleted } = await this.getSkills()
        this.classAverages = report
        this.examsCompleted = examsCompleted
    },
    methods: {
        getSkills() {
            return new Promise( (resolve, reject) =>
                $.ajax({
                    url: '/capsiminbox/professor/getSkillAverages',
                    method: 'get',
                    dataType: 'json'
                })
                .done( skills => resolve(skills) )
                .fail( err => reject(err) )
            )
        },
        getSkillInfo() {
            return new Promise( (resolve, reject) =>
                $.ajax({
                    url: '/capsiminbox/professor/skills?format=map',
                    method: 'get',
                    dataType: 'json'
                })
                .done( skills => resolve(skills) )
                .fail( err => reject(err) )
            )
        }
    }
}
</script>
<style lang="scss">
    #capsim-professor-learning-objectives table tr td:last-child{ font-weight: bold}
     #capsim-professor-learning-objectives table {
        // table-layout: fixed;
        tr {
            td {
                vertical-align: middle;
                &:last-child{
                    text-align: center !important;
                }
            }
            th {
                vertical-align: middle;
                &:last-child{
                    text-align: center !important;
                }
            }
        }
    }
</style>
