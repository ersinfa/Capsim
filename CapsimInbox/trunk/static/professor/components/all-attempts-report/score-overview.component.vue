<template>
        <div class="panel panel-default">
            <div class="panel-body">
                <h3>
                  <b> Score Overview </b>
                <download-excel
                      class   = "btn btn-info-dark pull-right"
                      :data   = "tableData"
                      :fields = "exportTableFields"
                      type    = "csv"
                      name    = "ScoreOverview.csv">
                      Generate CSV
                  </download-excel>
                </h3>
                <datatable :per-page="pageCount" :columns="tableColumns" :rows="tableData" :global-search="true" :paginate="true"></datatable>
            </div>
        </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import datatable from '../table.vue'
import http from'jquery'
import { camelCase } from 'lodash'

export default {
    name: 'all-attemps-course-roster',
    data: () => ({
        pageCount: 25,
        reportData:[],
        columns: [
            { label: 'Name', field: 'name', sortable: true},
            { label: 'Attempt', field: 'attempt', sortable: true},
            { label: 'Overall Score', field: 'overall', sortable: true, type: 'percentage' }
               
        ]
    }),
    methods: {
        dateFormat(date) {
            if( date == '-' ) return date
            return this.$moment.utc(date).format('MM/DD/YYYY, h:mm a')
        },

        GET_REPORT(){
            return new Promise( (resolve, reject) => {
                http.ajax({
                url: '/capsiminbox/professor/getAllAttemptsScoreOverviewReport',
                method: "GET",
                dataType: 'json'
                })
                .done( reportData => resolve(reportData) )
                .fail( err => reject(err) )
            })
            .then( data => {
                this.reportData = data
            })
        },
    },
    computed: {

        exportTableFields(){
            const ret = {}
            this.tableColumns.forEach(function(obj) {
                ret[obj.label] = obj.field;
            });
           
            return ret
        },


        tableData() {
            return this.reportData.map( row =>{
                let competencies = {}
                for(let competency in row.competencies){
                    competencies[competency] = row.competencies[competency] 
                }

                let result = Object.assign({},row, {
                    name: row.name,
                    completionDate: this.dateFormat(row.completionDate),
                    ...competencies
                }) 
                return result
            })
        },
        competencies() {
            let competencies = this.$store.state.competencies
            return Object.keys(competencies).map( key => ({
                label: competencies[key].name,
                field: competencies[key].name,
                sortable: true,
                type: 'percentage'
                // html: true
            }))
        },

        tableColumns () {
            return this.columns
            .concat(this.competencies)
            .concat( { label: 'Exam Completion Date', field: 'completionDate', sortable: true},)
            .concat( { label: 'Exam Completion Time', field: 'timeSpent', sortable: true},)
            .concat( { label: 'Exam Time', field: 'examTime', sortable: true},)
        },
    },
    mounted () {
        this.GET_REPORT()
    },
    components: { datatable }
}
</script>
<style lang="scss">
    #capsim-professor-learning-report table tfoot tr:last-child td{ font-weight: bold}
</style>
