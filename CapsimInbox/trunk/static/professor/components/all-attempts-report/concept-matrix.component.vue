<template>
        <div class="panel panel-default">
            <div class="panel-body">
                <h3>
                  <b> Concept Matrix </b>
                <download-excel
                      class   = "btn btn-info-dark pull-right"
                      :data   = "tableData"
                      :fields = "exportTableFields"
                      type    = "csv"
                      name    = "ConceptMatrix.csv">
                      Generate CSV
                  </download-excel>
                </h3>
                <div class="table-responsive">
                    <datatable :per-page="pageCount" :columns="tableColumns" :rows="tableData" :global-search="true" :paginate="true"></datatable>
                </div>
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
        skillsData:[],
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
                url: '/capsiminbox/professor/getAllAttemptsConceptMatrixReport',
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
        GET_SKILLS(){
            return new Promise( (resolve, reject) => {
                http.ajax({
                url: '/capsiminbox/professor/getSkills',
                method: "GET",
                dataType: 'json'
                })
                .done( reportData => resolve(reportData) )
                .fail( err => reject(err) )
            })
            .then( data => {
                this.skillsData = data
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
                let skills = {}
                for(let skill in row.skills){
                    skills[skill] = row.skills[skill] 
                }

                let result = Object.assign({},row, {
                    name: row.name,
                    completionDate: this.dateFormat(row.completionDate),
                    ...skills
                }) 
                return result
            })
        },
        skills() {
            let skills = this.skillsData
            return Object.keys(skills).map( key => ({
                label: skills[key].name,
                field: skills[key].name,
                sortable: true,
                type: 'percentage'
                // html: true
            }))
        },

        tableColumns () {
            return this.columns
            .concat(this.skills)
            .concat( { label: 'Exam Completion Date', field: 'completionDate', sortable: true},)
            .concat( { label: 'Exam Completion Time', field: 'timeSpent', sortable: true},)
            .concat( { label: 'Exam Time', field: 'examTime', sortable: true},)
        },
    },
    mounted () {
        this.GET_REPORT()
        this.GET_SKILLS()
    },
    components: { datatable }
}
</script>
<style lang="scss">
    #capsim-professor-learning-report table tfoot tr:last-child td{ font-weight: bold}
</style>
