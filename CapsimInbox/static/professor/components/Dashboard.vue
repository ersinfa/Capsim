<template>
    <div>
        <notification :message="currentMessage" :isLoading="isLoading" :isWarning="isWarning" :isActive.sync="isActive">
            <span slot="icon" class="glyphicon glyphicon-ok"></span>
        </notification>
        <div class="alert alert-info hidden" role="alert" id="surveyAlert" v-if="showSurvey">
            <h4>As your students are completing the CapsimInbox assessment, our team would appreciate if you could take a few minutes to provide feedback through a quick survey.</h4>
            <div class='text-center'>
                <button @click="declineSurvey" class='btn btn-danger-outline'>No Thank You</button>
                <a :href="`${$store.state.professorSurveyLink}`" target="_blank" @click="acceptSurvey" class="btn btn-primary white" role="button">Take Survey!</a>
            </div>
        </div>
        <h1>Dashboard</h1>

        <template v-if="isExam === 1">
            <div class="row">
                <div class="col-md-6">
                    <div class="panel panel-default">
                        <div class="panel-body">
                            <h3 class="mt-10">Hello Professor! Here is the current course information</h3>
                            <p class="lead">Industry ID - {{ sessionData.simID }}</p>
                            <p class="lead">{{settings.simTitle}}</p>
                            <p><b>Start Date: </b> {{accessDates.accessStartDate}}</p>
                            <p><b>End Date:</b> {{accessDates.accessEndDate}}</p>
                            <p><b>Reports Available:</b> {{reportAvailableDate}}</p>
                            <router-link to="/professor/exam-edit" class="btn btn-info-light pull-right">Edit Exam</router-link>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <scoreBoard></scoreBoard>
                </div>
            </div>
        </template>


                          



        <div class="panel panel-default" v-if="isExam != 1 && datatableLoaded == true ">
            <!--&& classAverage.overall != '-'" add this to hide the average scores if noone has completed the assessment-->
            <div class="panel-body">
                <!-- <h2>Compared Score Averages</h2> -->

                <div >
                    <h3 class="text-center"><b>Class Average</b></h3>
                    <img v-if="datatableLoaded == false" :src="`/capsiminbox/images/loading_icon.svg`" alt="CapsimInbox Logo" width="100%" height="200px">
                    
                    <div>
                        <h4 class="text-center col-md-6" style=""><b>Overall Score</b></h4>
                        <h4 class="text-center col-md-6 "><b>Skill Scores</b></h4>
                        <div class="" style="display: table;">
                            
                            <div class="v-align overall overall-color">
                                
                            <p class="text-center">{{classAverage.overall}}{{ordinalIndicator(classAverage.overall)}} Percentile</p>
                                <div class="progress" style="height: 35px">
                                    <div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" :style="`width: ${classAverage.overall}%;`">
                                    </div>
                                </div>
                                <div class="pull-left">0</div>
                                <div class="pull-right">100</div>

                                <div class="lead text-center" v-if="classAverage.overall != '-'">{{classAverage.overall}}{{ordinalIndicator(classAverage.overall)}} Percentile</div>
                                <div class="clearfix"></div>
                            </div>
                            <div class="overall">
                                
                                <table class="table" v-if="classAverage.skills">
                                    <thead>
                                        <tr>
                                            <th>Skill name</th>
                                            <th>Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="skill in classAverage.skills">
                                            <td>{{skill.name}} <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="top" :title="skill.description"></span></td>
                                            <td>{{skill.score}}</td>
                                        </tr>
                                    </tbody>  
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-body">
                <div class="row">
                    <div class="col-md-6"><h2>Course Roster</h2></div>
                    <div class="col-md-6">
                        <download-excel
                            class   = "btn btn-info-dark csv-valign pull-right"
                            :data   = "tableData"
                            :fields = "exportTableFields"
                            type    = "csv"
                            name    = "CourseRoster.csv">
                            Generate CSV
                        </download-excel>
                         <template v-if="showProcessResultsButton == true & isExam == 1">
                            <div @click="processStudents()" class="btn btn-primary pull-right mt-20 mr-35">
                                Process Results
                            </div>
                            <div class="pull-right mr-35" v-if="preccesingResults == true">
                                <img  :src="`/capsiminbox/images/loading_icon.svg`" alt="Loading..." width="100%" height="60px">
                            </div>
                        </template>
                    <router-link v-if="isExam !== 1" to="/professor/skill-scores" class="pull-right mt-30 mr-35">View Skill Scores</router-link> 
                    </div>
                </div>    
                <div class="table-responsive">
                <img v-if="datatableLoaded == false" :src="`/capsiminbox/images/loading_icon.svg`" alt="Loading..." width="100%" height="200px">
                <datatable  v-if="datatableLoaded == true" :per-page="25" :columns="tableColumns" :rows="tableData" :global-search="true" :paginate="true"></datatable>
                
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import datatable from './table.vue'
import scoreBoard from './score-board'

import { mapGetters, mapState } from 'vuex'
import { camelCase } from 'lodash'

export default {

    name: 'dashboard',

    data() {
        return {
            preccesingResults:false,
            showProcessResultsButton:false,
            datatableLoaded:false,
            testMessage:'', 
            triggerSurvey:true,
            industryRoster: [],
            columns: [
                { label: 'Name', field: 'name', sortable: true, html: true },
                { label: 'Overall Score', field: 'overall', sortable: true, html: true  },
                { label: 'Adjusted Percentage', field: 'overallAdjusted', sortable: true, html: true  },
                { label: 'Self-Awareness Score', type: 'number', field: 'selfAwareness', sortable: true  },
                { label: 'Development Index', field: 'developmentIndex', sortable: true  }
                
            ],
            message: "",
            linkCopied: false,
            checkForWrittenResponse: true,
            checkForFileUpload: true
        }
    },

    components: {
        datatable,
        scoreBoard
    },

    mixins: [require('../mixins/courseSettings')],

    methods: {

        declineSurvey(){
            this.triggerSurvey = false
            let timesDeclined = (this.settingsSurvey.timesDeclined ? this.settingsSurvey.timesDeclined + 1 : 1 )
            let lastDeclinedDate = Date.now()
            this.$store.dispatch('UPDATE_PROFESSOR_SETTING', {key: "timesDeclined", value: timesDeclined, configName: "survey" })
            .then( () => this.$store.dispatch('UPDATE_PROFESSOR_SETTING', {key: "lastDeclinedDate", value: lastDeclinedDate, configName: "survey" }))
        },

        acceptSurvey(){
            this.triggerSurvey = false
            this.$store.dispatch('UPDATE_PROFESSOR_SETTING', {key: "surveyTaken", value: 1, configName: "survey" })
        },

        dateFormat(date) {
            if( date == '-' ) return date
            return this.$moment.utc(date).format('MM/DD/YYYY, h:mm a')
        },

        copyLink() {
            this.$refs.regUrl.select()
            this.linkCopied = document.execCommand('copy', false)
            setTimeout(() => this.linkCopied = false, 5000)
        },

        getOverall(row){
            let overall = (typeof row.overall === "string") ? 0 : row.overall
            return overall
        },

        ordinalIndicator(score){
            if(score == 0) return ""
            if(score >=10 && score <=19) return "th"
            let remainder = score < 10 ? score : score % 10
            if(remainder == 1 ) return "st"
            if(remainder == 2 ) return "nd"
            if(remainder == 3 ) return "rd"
            return "th"
        },
        setShowProcessResultsButton() {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/professor/getIsStudentsNeedsToBeProcessed',
                    method: "GET",
                    dataType: 'json',
                    contentType: 'application/json'
                })
                .done( data => {
                    this.showProcessResultsButton = data
                })
                .fail( err => reject(err) )
            })
        },
        processStudents() {
            this.preccesingResults = true
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/professor/processStudents',
                    method: "POST",
                    dataType: 'json',
                    contentType: 'application/json'
                })
                .done( data => {
                    if(data == true) this.showProcessResultsButton = false
                    this.preccesingResults = false
                    this.$store.dispatch('GET_REPORT')
                })
                .fail( err => {
                    console.log(err) 
                    this.preccesingResults = false    
                    this.$store.dispatch('GET_REPORT')
                })
            })
        },
    },

    computed: {
        showSurvey(){
            const now = Date.now()
            const threeWeeksAgo = now - (3 * 7 * 24 * 60 * 60 * 1000)
            const twoWeeksAgo = now - (2 * 7 * 24 * 60 * 60 * 1000)
            const courseStartDate = Date.parse(this.$store.state.startDateTime)
            return (
                (this.triggerSurvey && this.$store.state.professorSurveyLink && this.settingsSurvey.surveyTaken != 1 &&
                    (
                        (!this.settingsSurvey.timesDeclined > 0 &&
                        courseStartDate < threeWeeksAgo ) 
                        ||
                        (this.settingsSurvey.timesDeclined > 0 && 
                        this.settingsSurvey.timesDeclined < 3 && 
                        this.settingsSurvey.lastDeclinedDate < twoWeeksAgo)
                    )
                )
            )    
        },

        settings(){
            return this.$store.state.settings || {}
        },

        settingsSurvey(){
            return this.settings.survey || {}
        },
        
        isExam(){
            return this.$store.state.isExam; 
        },
        // dashboardAccess(){
        //     return this.$store.state.settings.dashboardAccess; 
        // },

        isFileUpload(){
            return this.$store.state.versionConfig.fileUpload
        },

        studentGrades(){
            let grades = {}
            this.report.forEach(r=>{
               let key = r.stsKey
               if(r.writtenResponses){
                   grades[key] = {
                   studentName: r.name, 
                   responses: r.writtenResponses,    
                   numberOfQuestions: r.writtenResponses.length,
                   numberOfGrades: 0,
                   average: 0,
                   questionGrades: {}
                } 
                r.writtenResponses.forEach(res=>{
                   if(res.professorGrade || res.professorGrade == 0) {
                        grades[key].questionGrades[res.FK_questionKey] = res.professorGrade
                        grades[key].numberOfGrades = grades[key].numberOfGrades + 1
                   }    
                   //calculates average if all test scores are graded 
                   if(grades[key].numberOfGrades == grades[key].numberOfQuestions){
                       let sum = 0
                       for(let q in grades[key].questionGrades){
                           sum += grades[key].questionGrades[q]
                       }
                       grades[key].average = Math.floor(sum / grades[key].numberOfGrades) 
                   }
                })
               }
            })
            this.$store.commit('UPDATE_STATE', { studentGrades: grades })

            return grades
        },

        exportTableFields(){
            const ret = {}
            this.tableColumns.forEach(function(obj) {
                ret[obj.label] = obj.field;
            });
            // Updating name pointer since original name value might contain html in it.
            this.$store.state.competencies.forEach(competency => ret[competency.name] = competency.name+'Export')
            ret['IDP Completion Date']="IDPCompletionForExport" 
            ret['Name']="nameExport" 
            ret['Overall Score']="overallExport" 
            ret['Adjusted Percentage']="overallAdjustedExport" 
            if(this.isExam == 1 ){
                ret['Exam Completion Time']="inboxTimeSpentExport"
                ret['Exam Completion Date']="inboxCompletionExport"
            }else{
                ret['Assessment Completion Time']="inboxTimeSpentExport"
                ret['Inbox Completion Date']="inboxCompletionExport"
            }
            
             
            // ret['Name']="nameForExport" 
            return ret
        },

        courseRegistrationUrl() {
            return `https://${this.$store.state.portalUrl}/StudentRegApp_v2010/index.cfm?simID=${this.sessionData.simID}`
        },

        ...mapGetters([
            'report',
            'skills',
            'hasWrittenResponse'
        ]),
        ...mapState({
            session: state => state.session,
            accessDates: state => state.settings.dashboardAccess,
        }),

        tableData() {
            return this.report.map( row =>{
                let grades = this.studentGrades[row.stsKey] 
                let average = 0
                if(grades) average =  grades.average
                let showGrades = average > 0
                let gradesNeeded = row.inboxCompletion != '-' ? "Grades Needed" : "-"
                let writtenResponseInput =  { value: average,  link:`/professor/written-responses/${row.stsKey}`, linkText: showGrades ? average + " / 100 - Edit Grades" : gradesNeeded }
                let fileUploadInput =  { link:`/professor/student-files/${row.stsKey}`, linkText: "View Files"}
                let competencies = {}
                for(let competency in row.competencies){
                    competencies[competency] = `<span class="sr-only">${parseFloat(( row.overall !='-' ? (row.competencies[competency] != '0' ? row.competencies[competency] : 0.1)  : 0.01))/100}0</span>${( row.overall !='-' ? row.competencies[competency]+'%' : '-')}` 
                    competencies[competency+'Export'] = `${( row.overall !='-' ? (row.competencies[competency]+'%') : '-')}` 
                }

                let result = Object.assign({},row, {
                    name: (this.isExam == 1 ? `<span class="sr-only">${row.name}</span><a href="/CapsimInbox/professor/student-settings/${row.stsKey}">${row.name}</a><br/>  ${(row.isInProgress? 'In progress':'')}` : row.name), 
                    nameExport: row.name, 
                    IDPCompletionForExport: this.dateFormat(row.IDPCompletion),
                    overall: `<span class="sr-only">${parseFloat(( row.overall !='-' ? (row.overall != '0%' ? row.overall : 0.1)  : 0.01))/100}0</span>${row.overall}`,
                    overallExport: row.overall,
                    overallAdjusted: `<span class="sr-only">${parseFloat(( row.overallAdjusted !='-' ? (row.overallAdjusted != '0%' ? row.overallAdjusted : 0.1) : 0.01))/100}0</span>${row.overallAdjusted}`,
                    overallAdjustedExport: row.overallAdjusted,
                    writtenResponse:  writtenResponseInput,
                    fileUpload: fileUploadInput,
                    selfAwareness: (typeof row.selfAwareness === "string") ? 0 : row.selfAwareness,
                    inboxCompletion: `<span class="sr-only">${row.inboxCompletion}</span> ${this.dateFormat(row.inboxCompletion)}`,
                    inboxCompletionExport: this.dateFormat(row.inboxCompletion),
                    inboxTimeSpent: `<span class="sr-only">${parseFloat(( row.inboxTimeSpent !='-' ? row.inboxTimeSpent : 0.1))/100}0</span>${row.inboxTimeSpent}`,
                    inboxTimeSpentExport: row.inboxTimeSpent,
                    IDPCompletion: (row.stsKey == '' || row.IDPCompletion == '-')? `<span class="sr-only">${row.IDPCompletion}</span> ${this.dateFormat(row.IDPCompletion)}` :  `<span class="sr-only">${row.IDPCompletion}</span> ${this.dateFormat(row.IDPCompletion)} <br/> <a href="/CapsimInbox/professor/participant-details/${row.stsKey}">View</a>` ,
                    ...competencies
                }) 
                // Refactor later
                if(this.isExam == 1 )
                    result.additionalTime = (result.additionalTime !== '-' ? `${row.additionalTime} minutes` : row.additionalTime); 
                return result
            })
        },

        tableColumns() {
            if( this.competencies.length > 0 ) this.columns = this.columns.filter( col => col.field !== 'developmentIndex' )
            if( this.isExam == 1 ) this.columns = this.columns.filter( col => col.field !== 'selfAwareness' )
            if( this.isExam != 1 ) this.columns = this.columns.filter( col => col.field !== 'overallAdjusted' )
            if( this.isExam != 1 ) this.columns = this.columns.filter( col => col.field !== 'password' )
            if(this.checkForWrittenResponse && this.hasWrittenResponse ){
                this.columns.splice(2,0,{ label: 'Written Response Score', field: 'writtenResponse', html: true, link: true})
                this.checkForWrittenResponse = false
            } 
            if(this.checkForFileUpload && this.isFileUpload) {
                this.columns.splice(5,0,{ label: 'Uploaded Files', field: 'fileUpload', html: true, link: true})
                this.checkForFileUpload = false
            }
            return this.columns.map( column => {
                let match = this.skills.find( skill => camelCase( skill.name ) === column.field )
                if( match !== undefined ) column.tooltip = match.description
                if (column.field === 'writtenResponse') column.tooltip = "This score is representative of the written responses provided within the assessment by each participant."
                if( column.field === 'overall' && this.isExam == 1) delete column.tooltip // Removes tooltip from Overall if it's exam
                return column
            }).concat(this.competencies).concat(this.dateInfo)
        },

        dateInfo() {
            // Refactor later
            if(this.isExam == 1 ){
                return [
                    { label: 'Exam Completion Date', field: 'inboxCompletion', sortable: true, html: true },
                    { label: 'Exam Completion Time', field: 'inboxTimeSpent', sortable: true, html: true },
                    { label: 'IDP Completion Date', field: 'IDPCompletion', sortable: true, html: true },
                    { label: 'Custom Timer', field: 'additionalTime', sortable: true, html: true },
                    { label: 'Exam Access Password', field: 'password', sortable: true  }
                ]
            } else {
                let dateInfo = [
                    { label: 'Inbox Completion Date', field: 'inboxCompletion', sortable: true, html: true },
                    { label: 'Assessment Completion Time', field: 'inboxTimeSpent', sortable: true, html: true }
                ]
                //do not show IDP completion field if the assessment has no skills
                if(Object.keys(this.skills).length > 0) {
                    dateInfo.push({ label: 'IDP Completion Date', field: 'IDPCompletion', sortable: true, html: true })
                }
                return dateInfo
            }
        },

        competencies() {
            let competencies = this.$store.state.competencies
            return Object.keys(competencies).map( key => ({
                label: competencies[key].name,
                field: competencies[key].name,
                sortable: true,
                html: true
            }))
        },

        classAverage() {
            return this.$store.state.classAverage
        }


    },

    beforeRouteEnter (to, from, next) {
        next( instance => {
            instance.$store.dispatch('GET_REPORT')
            .then( () => instance.$store.dispatch('GET_SECTION_SETTINGS'))
            .then( () => instance.datatableLoaded = true)
            .then( () => instance.setShowProcessResultsButton())
        })
    },

    mounted(){
        setTimeout(function(){ $('#surveyAlert').removeClass("hidden") }, 500);
    }

}
</script>

<style lang="scss" scoped>
.input-group{
    min-width: 200px;
}
table{
    table-layout: fixed;
    tr{
        td{
            vertical-align: middle;
            &:nth-child(n+2){
                text-align: center;
            }
        }
        th{
            vertical-align: middle;
            &:nth-child(n+2){
                text-align: center;
            }
        }
    }
}
.v-align2{
    margin-top: 50px;
    vertical-align: middle;
    float: none;
}
.overall{
    display: table-cell; 
    width:44%; 
    padding-right:3%; 
    padding-left:3%; 
    vertical-align: middle;
}
.overall-color{
    background-color: #F8F8F8;
}

.link-group {
    margin: 15px;
    float: right;
}

 .btn-info-dark{
    background-color: #474747;
    border-color: #474747;
    color: #ffffff;
}

.csv-valign{
    margin-top: 20px;
}



</style>
