<template>
    
    <div v-if='report' >    
        <br>
        <div>
            <div class="panel panel-default">  
                <div class="panel-heading">
                    <h2>Written Responses - {{report.studentName}}</h2>
                </div>
                <div class="panel-body">
                    <table class="table">
                        <thead>
                            <tr>
                                <th class="col-md-1" >#</th>
                                <th class="col-md-5">Original Email</th>
                                <th class="col-md-6">Student Response</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for='(question, i) in report.responses'>
                            <tr>
                                <td style="font-weight:bold;">{{i+1}}</td>
                                <td v-html="question.descriptionTagKey"></td>
                                <td v-html="question.writtenResponse"></td> 
                            </tr>
                            <tr>
                                <td colspan='2' style="border-top: none;" v-if="submitted[i] == null">
                                    <form class="col-md-12 form-inline" >
                                        <div class="form-group mr-20">
                                            <label>Enter Grade (0-100): </label>
                                            <input style="width: 80px; margin-left:10px;" v-model="grades[i]" class="form-control" type="number" value='grades[i]'>
                                            <button @click.prevent="submitGrade(i, question.FK_StudentToSimKey, question.FK_questionKey)" class="btn mat btn-success ml-20" >
                                            <span class="glyphicon"></span>
                                            Submit
                                            </button>
                                        </div>
                                    </form>
                                 </td>
                                 <td colspan='3' style="border-top: none;" v-else>
                                    <div class='row'>
                                        <div class='col-md-2'> 
                                            <label>Grade: {{grades[i]}} / 100 </label> 
                                            <!-- <h4 style="font-weight:bold;">Grade: {{grades[i]}} / 100</h4> -->
                                        </div>    
                                        <div class='col-md-1'>  
                                            <button @click.prevent="editGrade(i)" class="btn mat btn-danger ml-20" > 
                                            <span class="glyphicon"></span>
                                            Edit Grade
                                            </button>  
                                        </div>
                                    </div>    
                                 </td>
                            </tr>
                            <br>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
 
    name:'student-written-responses', 

    data() {
        let report = this.$store.state.studentGrades[this.$route.params.stsKey] 
        let submitted = {} 
        let grades = {}
        if(report) report.responses.forEach((rep, i)=>{ 
            submitted[i] = rep.professorGrade
            grades[i] = rep.professorGrade
        })
        return {
            submitted,
            grades,
            report 
        } 
 
    },

    created(){
         if(!this.report) this.$router.push({ name: "Dashboard"})
    },

    methods: {
        editGrade(i){
            this.submitted[i] = null
        },

        submitGrade(i, stsKey, questionKey) {
            let grade = Math.floor(this.grades[i]/1)
            if(grade > 100) grade = 100
            if(grade < 0) grade = 0
            this.submitted[i]=grade
            $.ajax({
                url: '/capsiminbox/professor/setgrade',
                method: 'post',
                data: {
                    stsKey: stsKey,
                    questionKey: questionKey,
                    grade: grade
                },
                dataType: 'json',
            })
            .fail( err => {
                console.log(err)
            })
        },
    },

    // beforeRouteEnter (to, from, next) {
    //     next( instance => {
    //         if(Object.keys(instance.$store.state.studentGrades[instance.$route.params.stsKey]).length < 1){
    //         instance.$router.push({name: 'Dashboard'})
    //         }
    //     })    
    // }
 
}
</script>