<template>
    <div id="capsim-professor-learning-report" v-if="isExam === 1">
        <h1>Reports </h1>
        <ol class="breadcrumb">
          <li><router-link to="/professor/exam-reports">Reports</router-link></li>
          <li class="active">Assurance of Learning Report</li>
        </ol>
        <div class="panel panel-default">
            <div class="panel-body">
                <h3>
                  <b> Assurance of Learning Report </b>
                <download-excel
                      class   = "btn btn-info-dark pull-right"
                      :data   = "tableRowsExport"
                      :fields = "exportTableFields"
                      type    = "csv"
                      name    = "AssuranceOfLearningReport.csv">
                      Generate CSV
                  </download-excel>
                </h3>
                <datatable :per-page="pageCount" :columns="tableColumns" :rows="tableRows" :footer="tableFooter" :global-search="true" :paginate="true"></datatable>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import datatable from '../table.vue'
// import { ResponsiveTable } from "../../../shared_components/ui"
import { camelCase } from 'lodash'

export default {
    name: 'capsim-professor-learning-report',
    data: () => ({
        pageCount: 25,
        columns: [
            { label: 'Name', field: 'name', sortable: true, html: true }
        ]
    }),
    methods: {
        ...mapActions(['GET_GOAL_REPORT']),
        toObject (array) {
            const map = {}
            for (let index = 0; index < array; index++) {
                const element = array[index]
                map[element.key] = element.score
            }
            return map
        }
    },
    computed: {
        ...mapState(['isExam', 'learningGoalReport', ]),
        exportTableFields () {
            const ret = {}
            this.tableColumns.forEach((obj) => {
                if(obj.field == 'name'){
                    ret[obj.label] = obj.field
                }else{
                    ret[obj.label] = obj.field+'Export'
                }
            });
            return ret
        },
        tableRows () {
            const rows = []
            for (let index = 0; index < this.learningGoalReport.length; index++) {
                const studentReport = this.learningGoalReport[index];
                const map = {}
                map.name= studentReport.name
                // map out the scoring data 
                for (let step = 0; step < studentReport.score.length; step++) {
                    const element = studentReport.score[step];
                    map[element.key] = `<span class="sr-only">${element.score == 0 ? 0.0001 : element.score.toFixed(1)/1000}</span>${element.score.toFixed(1)}%`
                    map[element.key+'Export'] = element.score.toFixed(1) +'%'
                }
                rows.push(map)
            }
            return rows
        },
        tableColumns () {
            if (this.learningGoalReport.length <= 0) return []

            const temp = this.learningGoalReport[0].score.map(goal => ({
                label: goal.name,
                field: goal.key,
                sortable: true,
                html: true
            }))
            return this.columns.concat(temp)
        },
        tableRowsExport(){
            const retVal = this.tableRows.slice() // Creates a copy of an array
            this.tableFooter.forEach(row => {
                const tempRetVal = {}
                for (var key in row) {
                    if(key == 'name'){
                        tempRetVal[key] = row[key];
                    }else{
                        tempRetVal[key+'Export'] = row[key];
                    }
                }
                retVal.push(tempRetVal)
                })
            return retVal

        },
        tableFooter() {
            let retVal = {}
            let rowsLength = this.learningGoalReport.length

            for (let index = 0; index < rowsLength; index++) {
                const studentReport = this.learningGoalReport[index];
                for (let step = 0; step < studentReport.score.length; step++) {
                    const element = studentReport.score[step];
                    if(retVal[element.key] !== undefined){
                        retVal[element.key]+=element.score
                    }else{
                        retVal[element.key]=element.score
                    }
                }
            }
            
            for (let key in retVal) {
                retVal[key] = (retVal[key] / rowsLength).toFixed(1) +'%'
            }
            retVal['name'] = 'Average Score'

            return [retVal]
        },
    },
    mounted () {
        this.GET_GOAL_REPORT()
    },
    components: { datatable }
}
</script>
<style lang="scss">
    #capsim-professor-learning-report table tfoot tr:last-child td{ font-weight: bold}
</style>
