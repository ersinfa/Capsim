<template>
    <div id="capsim-student-inbox-portal-dashboard" class="student-dashboard">
        <img v-if="dataLoaded == false" :src="`/capsiminbox/images/loading_icon.svg`" alt="CapsimInbox Logo" width="100%" height="200px">    
        <h1>Student Dashboard</h1>
        <div class="panel panel-default">
            <div class="panel-body">  
                <h2 class="mt-0"><b>{{ isExam ==1 ? simTitle : "Assessments"}}</b></h2>
                <template v-if="isExam == 1">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Start</th>
                                <th>End</th>
                                <th>Time</th>
                                <th>Exam Status</th>
                                <th>Overall Score</th>
                                <th>Full Results</th>
                            </tr>
                        </thead>
                        <tbody v-if="dashboardAccess">
                            <tr>
                                <td>{{ accessStartDate }}</td>
                                <td>{{ accessEndDate }}</td>
                                <td>{{ additionalTime }} minutes</td>

                                <template v-if="hasAccess">
                                    <td>
                                        <template v-if="isAssessmentCompleted">
                                            Complete
                                        </template>
                                        <template v-else-if="passwordRequired">
                                            <div data-target="#password-modal" data-toggle="modal" class="btn btn-success mat" @click="passwordFieldError = false">Take Exam</div>
                                        </template>
                                        <template v-else>
                                            <a href="/capsiminbox/webapp" class="btn btn-success mat">Take Exam</a>
                                        </template>
                                    </td>
                                    <td>
                                        <span v-if="isAssessmentCompleted && isReportAvailable"> {{ overall }}% </span>
                                        <span v-else> Not Available</span>
                                    </td>
                                    <td><div @click="selectAssessment(stsKey,'/student/dashboard/idpbuilder')" class="btn btn-link" v-if="isAssessmentCompleted">View</div><span v-if="!isAssessmentCompleted"> Not Available</span></td>
                                </template>
                                <template v-else>
                                    <td>
                                         <template v-if="isAssessmentCompleted">
                                            Complete
                                        </template>
                                         <template v-else>
                                             <a class="btn btn-default mat disabled">Take Exam</a>
                                        </template>
                                    </td>
                                    <td>
                                        <span v-if="isAssessmentCompleted && isReportAvailable"> {{ overall }}% </span>
                                        <span v-else> Not Available</span>
                                    </td>
                                    <td>
                                        <div v-if="isAssessmentCompleted && isReportAvailable" @click="selectAssessment(stsKey,'/student/dashboard/idpbuilder')" class="btn btn-link" >View</div>
                                        <span v-else> Not Available</span>
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </template>
                <template v-else>
                    <table class="table">
                            <thead>
                                <tr>
                                    <th>CapsimInbox Version</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Assessment Status&nbsp<span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="top" :title="tooltip.assessment"></span></th>
                                    <th v-if="hasVersionWithFileUpload">Submission Status<span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="top" :title="tooltip.submission"></span></th>
                                    <th>Feedback Report&nbsp<span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="top" :title="tooltip.feedback"></span></th>
                                    <th>Individual Development Plan&nbsp<span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="top" :title="tooltip.idp"></span></th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- <template v-for="(assessment, key) in mappedAssessments"> -->
                                <!-- show the assessments order the assessments by start date -->
                                <!-- <div v-for="k in Object.keys(a).sort((a,b)=>order.indexOf(a)-order.indexOf(b))">{{k}}:{{a[k]}}</div> -->
                                <template v-for="key in Object.keys(mappedAssessments).sort((a,b)=>assessmentOrder.indexOf(a) - assessmentOrder.indexOf(b))">   
                                    <tr>
                                        <td>{{ mappedAssessments[key].versionName }}</td>
                                        <td>{{ mappedAssessments[key].startDateTime }}</td>
                                        <td>{{ mappedAssessments[key].endDateTime }}</td>
                                        <!-- re-entry? -->
                                        <template v-if="showReEntry(key)">
                                            <td><div @click="selectAssessment(key,{ name: 'Inbox'}, 'advance')" class="btn btn-primary mat">Re-Take Assessment</div></td>
                                            <td v-if="mappedAssessments[key].versionSettings.fileUpload"><div @click="selectAssessment(key,{ name: 'Files'})" class="btn btn-primary mat">Manage Files</div></td>
                                            <td v-else-if="hasVersionWithFileUpload"></td>
                                            <td>Not Available</td>    
                                            <td>Not Available</td>
                                        </template>
                                        <template v-else-if="showComplete(key)">
                                            <td v-if="mappedAssessments[key].versionSettings.fileUpload && isPending(key)">Pending</td>
                                            <td v-else-if="mappedAssessments[key].versionSettings.reEntrySingle && !isComplete(key)"><div @click="selectAssessment(key,{ name: 'Welcome'},'set')" class="btn btn-primary mat">Take Assessment</div></td>
                                            <td v-else-if="postAssessmentEnabled && !postAssessmentComplete"><div @click="selectAssessment(key,{ name: 'PostAssessment'},'set')" class="btn btn-primary mat">Take Post Assessment Survey</div></td>
                                            <td v-else>Complete</td>
                                            <td v-if="mappedAssessments[key].versionSettings.fileUpload"><div @click="selectAssessment(key,{ name: 'Files'})" class="btn btn-primary mat">Manage Files</div></td>
                                            <td v-else-if="hasVersionWithFileUpload"></td>
                                            <td v-if="mappedAssessments[key].report && Object.keys(mappedAssessments[key].report.skillGap).length > 0 && !hasVersionWithFileUpload"><div @click="selectAssessment(key,{ name: 'Report'})" class="btn btn-link">View</div></td>
                                            <td v-else>Not Available</td>
                                            <td v-if="mappedAssessments[key].report && Object.keys(mappedAssessments[key].report.skillGap).length > 0 && !hasVersionWithFileUpload"><div @click="selectAssessment(key,{ name: 'IDP Builder'})" class="btn btn-link">View</div></td>
                                            <td v-else>Not Available</td>
                                        </template>
                                        <template v-else-if="!mappedAssessments[key].hasAccess">
                                            <td>Not Available</td>
                                            <td>Not Available</td>
                                            <td>Not Available</td>
                                        </template>                         
                                        <template v-else>
                                            <td><div @click="selectAssessment(key,{ name: 'Welcome'},'set')" class="btn btn-primary mat">Take Assessment</div></td>
                                            <td v-if="mappedAssessments[key].versionSettings.fileUpload"><div @click="selectAssessment(key,{ name: 'Files'})" class="btn btn-primary mat">Manage Files</div></td>
                                            <td v-else-if="hasVersionWithFileUpload"></td>
                                            <td>Not Available</td>    
                                            <td>Not Available</td>    
                                        </template>                            
                                    </tr>
                                </template>
                            </tbody>    
                    </table>
                </template>
            </div>
        </div>
        <template v-if="isExam != 1">
        <div v-if="showAggregateScores" class="panel panel-default">
            <div class="panel-body">
            <h2><b>Aggregate Scores</b></h2>
            <h3><b>Overall Percentile</b></h3>
                <table class='table overall-table'>
                    <thead>
                        <tr>
                            <th style="width: 250px;" class="version-col">CapsimInbox Version</th>
                            <th>Percentile</th>
                            <th style="width: 200px;"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(assessment, key, i) in overallScores">
                            <tr v-if="mappedVersions.indexOf(assessment.versionKey) > -1">
                                <td class="version-col">
                                    {{assessment.versionName}}
                                    <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="top" :title="`Date Completed: ${assessment.completionDate.slice(0, 10)}`"></span>
                                </td>    
                                <td>
                                    <div class="progress" style="height: 25px">
                                        <div :class="`progress-bar progress-bar-${i+1}`" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" :style="`width: ${assessment.overallScore}%;`">
                                            <span class="sr-only">{{assessment.overallScore}}{{ordinalIndicator(assessment.overallScore)}} Percentile</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{{assessment.overallScore}}{{ordinalIndicator(assessment.overallScore)}} Percentile</td>
                            </tr>
                        </template>
                    </tbody> 
                </table>
            <h3><b>Skills Scores</b></h3>
                <template>
                    <ChartContainer  :mappedSkillScores="mappedSkillScores" :useTabs="useTabs" ></ChartContainer>
                </template>
            </div>
        </div>
        </template>

        <template v-if="isExam == 1">
            <Modal :confirm-text="'Close'"  v-on:confirm="closeModal" :show-close="false" id="student-modal">
                <h4 slot="title"> Welcome to Modular Exam! </h4>
                <p slot="body">Welcome to your student dashboard! Please take a look at the Tutorial link on the left side of your page before beginning your exam. You'll only have one attempt to complete your exam and will not be able to re-enter.</p>
            </Modal>

            <Modal :confirm-text="'Take Exam'"  v-on:confirm="enterExam" :show-close="false" id="password-modal">
                <h4 slot="title"> Password Needed </h4>
                <div slot="body">
                    <div class="form-group">
                        <label for="passwordField">Please enter your password</label>
                        <input v-model="passwordField" type="password" id="passwordField"  placeholder="password" class="form-control">
                    </div>
                    <small v-if="passwordFieldError == true" class="text-danger">
                        *password incorrect
                    </small>
                    
                </div>
            </Modal>
        </template>

        <template v-if="!isSurveyCompleted">
            <modal @closed="surveyClosed" :show-okay="false" id="survey" closeClass="btn-danger-outline">
                <h4 slot="title">Thanks for completing {{inboxOrExam}}!</h4>
                <p slot="body">
                    Would you be willing to share 1 minute of your time to provide feedback on your {{inboxOrExam}} experience? Thanks!
                    <a target="_blank" :href="$store.state.surveyLink">Click here</a>
                </p>
            </modal>
        </template>    

    </div>
</template>

<script>
import { mapState } from 'vuex'
import Modal from '../../../shared_components/Modal.vue'
import jquery from 'jquery'
import chart from './chartSkillTrends.vue';
import ChartContainer from './chartContainer.vue';

export default {
    components: { chart, Modal, ChartContainer },
    name: 'capsim-student-portal-dashboard',
    data() {
    return { 
        dataLoaded: false
        ,passwordField:'' 
        ,passwordFieldError:false
        ,tooltip: {
            submission: "If the submission has not been uploaded, select the link below to upload document. If submission has been uploaded but the professor has not yet provided a grade, await the results. If the submission has been reviewed by the professor, click the link below for further information."
            ,netChange: "Difference between first score and last score"
            ,assessment: "Assessment Status reflects the current state of your CapsimInbox assessment. When the assessment is available to complete, select the option to 'Take Assessment'. Once the assessment has been completed in it's entirety, the status will show as 'Complete'."
            ,feedback: "The Feedback Report is generated once the CapsimInbox has been completed and will display information regarding performance in the assessment. If the Feedback Report is unavailable, please wait until the reports have been released by the administrator/professor."
            ,idp: "The Individual Development Plan(IDP) was designed to assist in skill improvement. Click the link below to improve a skill or view saved IDPs"
        }
    }
  },
    beforeRouteEnter(to, from, next) {
        next( vm => {
             vm.$nextTick( () => {
                vm.$store.dispatch('GET_SETTINGS')
                if( vm.isAssessmentCompleted ) {
                    (!vm.isSurveyCompleted) && $('#survey').modal('toggle')
                    return
                }
            }) 
            vm.dataLoaded = true
        // vm.$store.dispatch('GET_ASSESSMENTS')
        // .then( () => vm.dataLoaded = true)
        })
    },

    created() {
      this.$store.dispatch('GET_SETTINGS')
    },

    mounted() {
        $('[data-toggle="tooltip"]').tooltip()
    },

    methods: {
        closeModal: () => $('#student-modal').modal('hide'),
         // Additional password check for University of Florida
        enterExam(){
            jquery.ajax({
                    url: '/capsiminbox/student/examPasswordCheck',
                    method: 'POST',
                    data: JSON.stringify({passwordField:this.passwordField}),
                    contentType: 'application/json'
                })
                .done( data =>{ window.location.href = "/capsiminbox/webapp" })
                .fail( err => {this.passwordFieldError = true} )
        },
        surveyClosed() {
            this.$store.dispatch('SET_SETTING', { key: 'survey', value: true, configName: 'popups' })
        },
        setStudentCycle(stsKey){
            this.$store.dispatch('SET_STUDENT_CYCLE', +stsKey )
        },
        advanceStudentCycle(stsKey){
            this.$store.dispatch('ADVANCE_STUDENT_CYCLE', +stsKey )
        },
        selectAssessment: function(stsKey, toRoute, advanceCycle){
            if(advanceCycle=="advance"){
                this.advanceStudentCycle(stsKey)
            }if(advanceCycle=='set'){
                this.setStudentCycle(stsKey)
            }
            this.$store.dispatch('UPDATE_SESSION', {stsKey: stsKey, toRoute: toRoute.name})
            .then(()=> {
                // this.$store.commit('UPDATE_STATE', { selectedStsKey: +stsKey })
                this.$router.push(toRoute)
            })
        },
        isPending(key){
            let currentCycle = this.mappedAssessments[key].cycle
            let thisCycleFiles = this.mappedAssessments[key].studentFiles.filter(file => file.FK_cycleKey == currentCycle)
            let thisCyclePendingFiles = thisCycleFiles.filter(file => file.FK_cycleKey == currentCycle && file.FK_fileStatusKey == 1)
            return thisCyclePendingFiles.length > 0 || thisCycleFiles.length == 0
        },
        isComplete(key){
            return this.mappedAssessments[key].isComplete 
        },
        showComplete(key){
            let currentCycle = this.mappedAssessments[key].cycle
            let thisCycleFiles = this.mappedAssessments[key].studentFiles.filter(file => file.FK_cycleKey == currentCycle)
            let thisCycleRejectedFiles = thisCycleFiles.filter(file => file.FK_cycleKey == currentCycle && file.FK_fileStatusKey == 3)
            return this.mappedAssessments[key].isComplete || ( thisCycleFiles.length > 0 && thisCycleRejectedFiles.length == 0) || this.mappedAssessments[key].versionSettings.reEntrySingle
        },
        showReEntry(key){
            if(this.mappedAssessments[key].studentFiles.length > 0 ){
                let currentCycle = this.mappedAssessments[key].cycle
                let thisCycleRejectedFiles = this.mappedAssessments[key].studentFiles.filter(file => file.FK_cycleKey == currentCycle && file.FK_fileStatusKey == 3)
                return thisCycleRejectedFiles.length > 0
            } else {
                return false
            }
        },
        ordinalIndicator(score){
            if(score == 0) return ""
            if(score >=10 && score <=19) return "th"
            let remainder = score < 10 ? score : score % 10
            if(remainder == 1 ) return "st"
            if(remainder == 2 ) return "nd"
            if(remainder == 3 ) return "rd"
            return "th"
        }
    },

	beforeDestroy: function() {
		this.target.destroy();
	},

    computed: {
        ...mapState({
            session: state => state.session,
            assessments: state => state.allAssessments, 
            schoolKey: state => state.session.schoolKey,
            reportAvailableDate: state => state.session.reportAvailableDate,
            settings: state => state.settings,
            loginCounter: state => state.session.loginCounter,
            additionalTime: state => state.studentSettings.additionalTime,
            simTitle: state => state.studentSettings.simTitle,
            dashboardAccess: state => state.studentSettings.dashboardAccess,
            passwordRequired: state => state.studentSettings.passwordRequired,
            accessStartDate: state => state.studentSettings.dashboardAccess.accessStartDate,
            accessEndDate: state => state.studentSettings.dashboardAccess.accessEndDate,
            overall: state => state.report.overall.score,
            stsKey: state => state.session.studentToSimKey
        }),
        //  this.$store.getters.selectedAssessment
        hasAccess() {
            const afterStart = this.$moment(this.accessStartDate).isBefore(this.now)
            const beforeEnd = this.$moment(this.now).isBefore(this.accessEndDate);
            return (afterStart && beforeEnd)
        },
        isAssessmentCompleted() {
            return this.$safeGet(this.settings, 'assessment.completed', false) 
        },
        isReportAvailable(){
            if(typeof this.$store.state.session.reportAvailableDate == 'undefined') return true
            return this.$moment(this.reportAvailableDate).isBefore(this.now);
        },

        isExam(){
            return this.session.isExam
        },

        postAssessmentEnabled(){
            return this.session.postAssessment
        },

        postAssessmentComplete(){
            return this.$safeGet(this.$store.state.allAssessments[this.stsKey].settings, 'postAssessment.completed', false)
        },

        inboxOrExam(){
            if(this.isExam) return "Modular Exam"
            else return "Capsim Inbox"
        },

        // Restrict assessments by the start/end date        
		mappedAssessments () {
            if(Object.keys(this.assessments).length > 0){
                for (let assessment in this.assessments){
                    const afterStart = this.$moment(this.assessments[assessment].startDateTime).isBefore(this.now)
                    const beforeEnd = this.$moment(this.now).isBefore(this.assessments[assessment].endDateTime);
                    this.assessments[assessment].hasAccess =  (afterStart && beforeEnd)
                }
            }
            return this.assessments
        },

        //Get Array of stsKeys to order mappedAssessments by start date
        assessmentOrder(){
            let assessmentArr = []
            for (let key in this.mappedAssessments){
                this.mappedAssessments[key].stsKey = key
                assessmentArr.push(this.mappedAssessments[key])
            }
            let sortedArr = assessmentArr.sort((a, b) => {
                return this.$moment.utc(a.startDateTime).diff(this.$moment.utc(b.startDateTime))
            })
            return sortedArr.map(e => e.stsKey)
        },

        mappedSkillScores(){
            let skillsObj = {} 
            let skillMap = this.session.skillMap || []
            if(Object.keys(this.mappedAssessments).length > 0){
                let versions = []
                for (let assessment in this.mappedAssessments){
                    let versionKey = this.mappedAssessments[assessment].versionKey
                    if(versions.indexOf(versionKey) == -1){ 
                        versions.push(versionKey)
                    }
                }
                for (let assessment in this.mappedAssessments) {
                        if(this.mappedAssessments[assessment].report && this.mappedVersions.indexOf(this.mappedAssessments[assessment].versionKey) > -1) {
                        let skillGap = this.mappedAssessments[assessment].report.skillGap
                        for(let skill in skillGap){
                            let originalSkillKey = skillGap[skill].skillKey
                            let mappedSkillKey = skillGap[skill].skillKey
                            //check if the skill is in skillKey_2, if so, set skillKey to corresponding skillKey_1 and exit loop
                            for(let i=0; i < skillMap.length; i++){
                                if(originalSkillKey == skillMap[i].FK_skillKey_2  && versions.indexOf(skillMap[i].FK_versionKey_1) > -1 ){
                                    mappedSkillKey = skillMap[i].FK_skillKey_1
                                    break
                                } 
                            }
                            //this adds the skillKey to the object if it doesn't exist yet
                            if(!skillsObj[mappedSkillKey] && skillGap[originalSkillKey]){
                                skillsObj[mappedSkillKey] = {scores: []}
                                skillsObj[mappedSkillKey].skillName = skillGap[originalSkillKey].name
                                skillsObj[mappedSkillKey].skillDescription = skillGap[originalSkillKey].description
                                skillsObj[mappedSkillKey].versionKey = this.mappedAssessments[assessment].versionKey
                                skillsObj[mappedSkillKey].versionName = this.mappedAssessments[assessment].versionName
                            }
                            //this adds the skill score to the correct place in the object
                            skillsObj[mappedSkillKey].scores.push({y: +skillGap[skill].gameScore, name: this.mappedAssessments[assessment].versionName + " - Completed: " + this.mappedAssessments[assessment].completionDate.slice(0, 10)})
                        }
                    }
                }
            }
            return skillsObj  
        },

        //Refactor this
        mappedVersions(){
            let versions = {}
            let versionsToShow = []
            let skillMap = this.session.skillMap || []
            if(Object.keys(this.mappedAssessments).length > 0){
                //get unique versions on Object
                for (let assessment in this.mappedAssessments){
                    let versionKey = this.mappedAssessments[assessment].versionKey
                    if(!versions[versionKey]){ 
                        versions[versionKey] = 0
                    }
                }

                for (let assessment in this.mappedAssessments) {
                    if(this.mappedAssessments[assessment].report ) {
                        let skillGap = this.mappedAssessments[assessment].report.skillGap
                        let versionKey = this.mappedAssessments[assessment].versionKey
                        versions[versionKey] = versions[versionKey] + 1
                        for(let skill in skillGap){
                            let skillKey = skillGap[skill].skillKey
                            let stopLoop = false
                            //check if the assessment has a skill that is mapped to another skill, if so increment it's corresponding version count and stop loop
                            for(let i=0; i < skillMap.length; i++){
                                if(skillKey == skillMap[i].FK_skillKey_1 && versions.hasOwnProperty(skillMap[i].FK_versionKey_2 )){
                                    let correspondingVersionKey = skillMap[i].FK_versionKey_2
                                    versions[correspondingVersionKey] = versions[correspondingVersionKey] + 1
                                    stopLoop = true
                                    break
                                }    
                        
                                if(skillKey == skillMap[i].FK_skillKey_2 && versions.hasOwnProperty(skillMap[i].FK_versionKey_1 )){
                                    let correspondingVersionKey = skillMap[i].FK_versionKey_1
                                    versions[correspondingVersionKey] = versions[correspondingVersionKey] + 1
                                    stopLoop = true
                                    break
                                }   
                            }
                            if(stopLoop) break
                        }
                    }
                }
            }
            //capture all versions in array that have 2 completed versions
            for(let key in versions){
                if(versions[key] >= 2) versionsToShow.push(+key)
            }
            return versionsToShow  
        },
        overallScores(){
            let scoresObj = {}
            if(Object.keys(this.mappedAssessments).length > 0){
                for(let assessment in this.mappedAssessments){
                    if(this.mappedAssessments[assessment].hasOwnProperty("report")) {
                        scoresObj[assessment] = {
                            overallScore: this.mappedAssessments[assessment].report.overall.score,
                            versionName: this.mappedAssessments[assessment].versionName,
                            versionKey: this.mappedAssessments[assessment].versionKey,
                            completionDate: this.mappedAssessments[assessment].completionDate
                        }
                    }
                }    
            }
            return scoresObj  
        },
        showAggregateScores(){
            //only show the aggregate scores section if mappedVersions has at least 1 version
            if(Object.keys(this.mappedVersions).length > 0 ) return true
        },
        useTabs(){
            let useTabs = false
            let numberOfSkillsCharts = Object.keys(this.mappedSkillScores).length
            for(let a in this.mappedAssessments){
                //if the number of skill charts is greater than any single assessments number of skills, we know its not mapped to itself and should use second chart tab
                if(this.mappedVersions.length > 1 && Array.isArray(this.mappedAssessments[a].skills) && this.mappedAssessments[a].skills.length < numberOfSkillsCharts){
                    useTabs = true
                }
            }
            return useTabs
        },

        hasVersionWithFileUpload () {
            let count = Object.keys(this.assessments).length
            let compare = 0
            if(count > 0) {
                for (let stsKey in this.assessments){
                    if ( this.assessments[stsKey].versionSettings.fileUpload){
                        compare++
                    } 
                }
                return count > 0 && count == compare 
            }
        },
        now() {
            return this.$moment().format('MM/DD/YYYY hh:mm a')
        },
        isSurveyCompleted() {
            return this.$safeGet(this.settings, 'popups.survey', false)
        },
    }
}
</script>

<style lang="scss" scoped>
   
</style>