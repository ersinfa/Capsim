<template>
  <div>
    <h1>
        <template v-if="isExam === 1">
            Reports
        </template>
        <template v-else>
            Skill Scores
        </template>
    </h1>
    <template v-if="isExam === 1">
        <ol class="breadcrumb">
          <li><router-link to="/professor/exam-reports">Reports</router-link></li>
          <li class="active">Concept Matrix</li>
        </ol>
    </template>
    <div class="panel panel-default">
        <div class="panel-body">
            <h3> 
            <template v-if="isExam === 1">
                 <b> Concept Matrix </b>
                 <download-excel
            class   = "btn btn-info-dark pull-right margin-right"
            :data   = "tableData"
            :fields = "exportTableFields"
            type    = "csv"
            name    = "ConceptMatrix.csv">
        Generate CSV
        </download-excel>
                </template>
        <template v-else>
        <download-excel
            class   = "btn btn-info-dark pull-right margin-right"
            :data   = "tableData"
            :fields = "exportTableFields"
            type    = "csv"
            name    = "skillScores.csv">
        Generate CSV
        </download-excel>
         </template>
      </h3>
      <div class="clearfix"></div>
        <div class="table-responsive">
            <datatable :per-page="25" :columns="tableColumns" :rows="tableData" :global-search="true" :paginate="true"></datatable>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import datatable from './table.vue'
import { mapGetters } from 'vuex'
import { camelCase } from 'lodash'

export default {

    name: "SkillScores",

    components: {
      datatable
    },

    data: () => ({
        columns: [
          { label: 'Name', field: 'name', sortable: true, html: true },
          { label: 'Overall Score', field: 'overall', sortable: true, html: true  },
          { label: 'Self-Awareness Score', type: 'number', field: 'selfAwareness', sortable: true },
        ],
        dynSkills: []
    }),

    computed: {

         exportTableFields(){
            const ret = {}
            this.tableColumns.forEach(function(obj) {
                ret[obj.label] = obj.field;
            });
            ret['Overall Score'] = "overallExport" 
            return ret
        },


        ...mapGetters([
            'report',
            'skills',
        ]),
        
        isExam(){
            return this.$store.state.isExam; 
        },

        tableData() {
          return this.report.map( row => {
            return Object.assign({},row, {
                overall: `<span class="sr-only">${parseFloat(( row.overall !='-' ? row.overall : 0.1))/100}0</span>${row.overall}`,
                overallExport: row.overall,
                selfAwareness: (typeof row.selfAwareness === "string") ? 0 : row.selfAwareness
            }) 
          })
        },

        tableColumns() {
            if( this.isExam == 1 ) this.columns = this.columns.filter( col => col.field !== 'selfAwareness' )
            return this.columns.map( column => {
                let match = this.skills.find( skill => camelCase( skill.name ) === column.field )
                if( match !== undefined ) column.tooltip = match.description
                return column
            })
        }


    },

    beforeRouteEnter (to, from, next) {
        next( instance => {
            instance.$store.dispatch('GET_REPORT')
        })
    },

    async created() {
        let dynSkills = await this.getSkills()
        // Fix/Refactor, maybe we could just not send a description 
        dynSkills.forEach( skill =>
            this.columns.push({
                label: skill.name,
                field: camelCase(skill.name),
                type: 'number',
                sortable: true,
                tooltip: skill.description
            })
        )
    },

    methods: {
        // getOverall(row){
        //     let overall = (typeof row.overall === "string") ? 0 : row.overall
        //     return overall
        // },
        getSkills() {
            return new Promise( (resolve, reject) =>
                $.ajax({
                    url: '/capsiminbox/professor/skills',
                    method: 'get',
                    dataType: 'json'
                })
                .done( skills => resolve(skills) )
                .fail( err => reject(err) )
            )
        },
    }

}

</script>

<style lang="scss" scoped>
    table {
        table-layout: fixed;
        tr {
            td {
                vertical-align: middle;
                &:nth-child(n+2){
                    text-align: center;
                }
            }
            th {
                vertical-align: middle;
                &:nth-child(n+2){
                    text-align: center;
                }
            }
        }
    }
</style>
