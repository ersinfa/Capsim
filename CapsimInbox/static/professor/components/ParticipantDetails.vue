<template>
    <div>
        <h1> {{participantInfo.firstname}} {{participantInfo.lastname}}</h1>
        <div class="panel">
            <div class="panel-body">
                <h2>IDP</h2>
                <table class="table saved-skills">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Created On</th>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(goal, key) in participantGoals">
                            <td>
                                <template v-if="isExam == 1">
                                {{ competenciesObj[goal.selectedSkill].name }}
                                </template>
                                <template v-else>
                                {{ skillsObj[goal.selectedSkill].name }}
                                </template>
                            </td>
                            <td>
                                {{ $moment(goal.dateTime).format('MM/DD/YYYY')  }}
                            </td>
                            <td>
                                <button @click="generatePdf(goal.studentGoalKey)" class="btn btn-primary mat">Download</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {

    name: "ParticipantDetails",

    data: () => ({
        participantGoals:[],
        participantInfo:{}
    }),

    computed: {
        
        ...mapGetters([
            'skillsObj'
        ]),
        isExam(){
            return this.$store.state.isExam
        },
        competenciesObj(){
            let retVal ={}
            this.$store.state.competencies.forEach(e=> retVal[e.competencyKey] = e)
            return retVal
        }


    },

    beforeRouteEnter (to, from, next) {
        next( instance => {
            instance.getStudentGoals(to.params.stsKey)
            instance.getStudentInfo(to.params.stsKey)
        })
    },

    methods: {

        getStudentGoals(stsKey) {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/professor/getStudentGoals',
                    method: "GET",
                    dataType: 'json',
                    data: {stsKey: stsKey },
                    contentType: 'application/json'
                })
                .done( goals => {
                    goals.forEach( goal => {
                        let innerGoal = JSON.parse(goal.goal)
                        Object.assign(goal, {
                            ...innerGoal
                        })
                    })
                    resolve( goals )
                })
                .fail( err => reject(err) )
            })
            .then( goals => this.participantGoals = goals ) 
        },
        
        getStudentInfo(stsKey) {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/professor/getStudentInfo',
                    method: "GET",
                    dataType: 'json',
                    data: {stsKey: stsKey },
                    contentType: 'application/json'
                })
                .done( participantInfo => resolve( participantInfo ) )
                .fail( err => reject(err) )
            })
            .then( participantInfo => this.participantInfo = participantInfo ) 
        },

        generatePdf(idpKey) {
            if(this.isExam == 1) window.open(`/capsiminbox/print/download-idp-modex/${idpKey}`)
            else window.open(`/capsiminbox/print/download-idp/${idpKey}`)
        }
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
