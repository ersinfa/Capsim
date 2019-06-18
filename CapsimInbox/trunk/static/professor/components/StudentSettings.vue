<template>
    <div class="container">
         <notification :message="notificationMessage" :isLoading="isLoading" :isActive.sync="isActive" :isWarning="isWarning" :style="{ 'z-index': '999' }">
            <span class="glyphicon glyphicon-ok mr-5" slot="success-icon"></span>
        </notification>

        <h1> Student Settings</h1>
        <div class="panel panel-default">
            <div class="panel-body">
                 <h3><b> {{ participantInfo.firstname }} {{ participantInfo.lastname }} Exam Settings</b></h3>
                 <div class="form-inline" v-if="participantSetting">
                    <div class="form-group">
                        <label for="course-title" class="control-label mr-30">Exam Time: </label>
                        <input style="max-width: 120px; display: inline;" v-model.number="participantSetting.additionalTime" type="text" class="form-control" id="exam-time">
                        <label>Minutes</label>
                    </div>
                    <button class="ml-30 btn btn-primary" @click="updateSetting"> Update Exam Time</button>
                    <br/>
                    <br/>
                    <div class="form-group">
                            <label for="course-title" class="control-label mr-30">Password: </label>
                            <input style="max-width: 182px; display: inline;" v-model="password" type="text" class="form-control" id="exam-time">
                    </div>
                    <button class="ml-30 btn btn-primary" @click="updatePassword"> Update Password</button>
                        
                </div>
            </div>
        </div>
        <div class="panel panel-default">
            <div class="panel-body">
                <h3><b>Exam Scores</b></h3>
                <h4><b>Clear Subject Scores</b></h4>
                    <template v-if="!(participantSettingCorrectOne.assessment && participantSettingCorrectOne.assessment.clearedCompetencies && participantSettingCorrectOne.assessment.clearedCompetencies.length > 0 && competencies.length > 0)">
                        <div class="form-inline">
                            <div class="checkbox mr-15" v-for="competency in competencies">
                            <label>
                                <input type="checkbox" v-model="competenciesToClear" :value="competency.competencyKey"> {{competency.name}} 
                                <template v-if="typeof studentScores != 'undefined' && typeof studentScores.competencyScore != 'undefined' && typeof studentScores.competencyScore[competency.competencyKey] != 'undefined'">
                                ({{studentScores.competencyScore[competency.competencyKey].toFixed(0)}}%)
                                        </template>
                            </label>
                            </div> 
                            <button v-if="competenciesToClear.length > 0 " class="ml-30 btn btn-info-light" data-target="#clear-student" data-toggle="modal" >Clear </button>
                            <button v-else class="ml-30 btn " disabled>Clear </button>
                        </div>
                    </template>

                     <template v-if="participantSettingCorrectOne.assessment && participantSettingCorrectOne.assessment.clearedCompetencies && participantSettingCorrectOne.assessment.clearedCompetencies.length > 0 && competencies.length > 0">
                    
                    <br/>
                    <p> Participants are in progress of retaking 
                        <template v-for="(competencyKey, index) in participantSettingCorrectOne.assessment.clearedCompetencies"> 
                            <template v-if="competencies.filter(competency=> competency.competencyKey == competencyKey)[0]">
                                {{ competencies.filter(competency=> competency.competencyKey == competencyKey)[0].name + (index < participantSettingCorrectOne.assessment.clearedCompetencies.length-1 ? ',':'')}} 
                            </template>
                        </template>
                        subject areas.
                        <button class="ml-30 btn btn-primary" @click="restoreStudentScore()">Restore scores </button>
                    </p>
                    
                </template>
                <hr/>

                <template v-if="this.professorLog.length > 0">
                    <br/>
                    <h4><b>Clear Subject Scores Log</b></h4>
                    <datatable  :per-page="5" :columns="tableColumns" :rows="tableData" :global-search="false" :paginate="true"></datatable>
                </template>

                <template v-if="this.studentScores.isCompleted == true">
                    <br/>
                    <h4><b>Student Scores</b></h4>
                    <datatable :per-page="rowsPerPage" :columns="studentScoresTableColumns" :rows="studentScoresTableData" :global-search="false" :paginate="true" @rowClick="showQuestion" @rowsPerPageChange="updateRowsPerPage"></datatable>
                </template>
                 
           </div>
        </div>
        

        <template v-if="this.studentScores.isCompleted == true">
            <Modal :show-okay="false" id="question-modal" size='lg'>
                <h4 slot="title"> Question #{{selectedQuestion.id}}</h4>
                <div slot="body">
                    <h4>{{selectedQuestion.value.competencyName}}</h4>
                    <div v-html="selectedQuestion.value.questionName" class="col-md-12 pl-20 pr-20 mb-20">
                    </div>
                    <div class="col-md-12 well">

                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Student Answer</th>
                                    <th>Points</th>
                                    <th>Answer</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr  v-for="answer in selectedQuestion.value.answers">
                                    <td>
                                        <input name="answer" :id="`f-option-${answer.answerKey}`" :type="(selectedQuestion.value.FK_questionTypeKey == 1? 'radio' : 'checkbox' )" :checked="answer.picked" disabled :value="answer.answerKey" >
                                    </td>
                                    <td>{{ (answer.points === null ? 0 : answer.points) }}</td>
                                    <td>{{ answer.nameTagKey }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                <div class="clearfix"></div>
                </div>
            </Modal>
        </template>

         <Modal :confirm-text="'Clear Score'" id="clear-student" size='lg'  v-on:confirm="clearStudentScore()">
            <h4 slot="title">WARNING</h4>
            <div slot="body">
                WARNING: Clearing scores will result in the student needing to resubmit the questions to receive a full score.
            </div>
        </Modal>


    </div>
</template>
<script>
import { groupBy, orderBy, cloneDeep  } from 'lodash'
import Modal from '../../shared_components/Modal.vue'
import debounce from 'lodash.debounce'
import * as numberFormatter from "accounting"
import datatable from './table.vue'

export default {
    name:'capsim-student-settings', 
    data: () => ({
        rowsPerPage:10,
        selectedQuestion:{
            value:{
            questionName:'',
            questionTitle:'',
            answers:[]
            }
            
        },
        participantSettingCorrectOne:{},
        password:'',
        participantSetting: {
            additionalTime: 0,
            clearedCompetencies:[]
        },
        participantInfo: {
            firstname: '',
            lastname: ''
        },
        notificationMessage:'',
        isWarning:false,
        // competencies:[],
        studentScores:{},
        competenciesToClear:[],
        stsKey: {},
        professorLog:[]
    }),
    components: { Modal, datatable },
    computed: {
        competencies(){
            return this.$store.state.competencies
        },
        competenciesObj(){
            let retVal ={}
            this.$store.state.competencies.forEach(e=> retVal[e.competencyKey] = e)
            return retVal
        },
        tableColumns(){
            return  [{ label: 'Date', field: 'date', sortable: true},{ label: 'Action', field: 'action', sortable: true, html:true }]
        },
        studentScoresTableColumns(){
            return  [
                { label: 'Question', field: 'questionNr', sortable: true, tdClass:"text-center", thClass:"text-center" }
                ,{ label: 'Learning Objective', field: 'skillName', sortable: true}
                ,{ label: 'Date Answered', field: 'questionAnswerLogTime', sortable: true}
                ,{ label: 'Score', field: 'score', sortable: true}
                ]
        },
        studentScoresTableData(){
            const retVal = []
            let questionNr = 0
           
            if(typeof this.studentScores !='undefined' && typeof this.studentScores.competencyQuestions !='undefined'){
                 Object.values(this.studentScores.competencyQuestions).forEach(competency=>{
                    competency.forEach(item=>{
                        retVal.push({
                            "questionNr":item.id
                            ,"skillName":item.value.skillName
                            ,"questionAnswerLogTime": (item.value.questionAnswerLogTime != '')? this.$moment.utc(item.value.questionAnswerLogTime).format('MM/DD/YYYY, h:mm a'): item.value.questionAnswerLogTime
                            ,"score": `${this.studentScores.skillScore[item.value.skillKey]} of ${ this.studentScores.possibleSkillPoints[item.value.skillKey]}`
                        })
                    })
                })
                
            }
           
            return retVal
         
        },
        tableData(){
            return this.professorLog.map( row =>{
                let action = ''
                if( row.FK_logActionTypeKey == 8){
                    action = '<b>Cleared Competencies:</b> '
                    let isFirst = true 
                    for( let competencyKey in row.value.clearedCompetencies){
                        if(!isFirst) action +=', '
                        action += this.competenciesObj[row.value.clearedCompetencies[competencyKey]].name
                        isFirst = false
                    }
                     action += '.'
                }else{
                    action = '<b>Restored Score.</b>'
                }
                let result = Object.assign({},row, {
                    date: this.$moment.utc(row.dateTime).format('MM/DD/YYYY, h:mm a'), 
                    action: action,
                }) 
                return result
            })

        }
    },
    mixins: [require('../mixins/courseSettings')],
    beforeRouteEnter (to, from, next) {
        next( instance => {
            instance.getStudentSettings(to.params.stsKey)
            instance.getProfessorLog(to.params.stsKey)
            instance.getStudentSettingsCorrectOne(to.params.stsKey)
            instance.getStudentInfo(to.params.stsKey)
            instance.setStudentKey(to.params.stsKey)
            // instance.getCompetencies()
            instance.getStudentReport(to.params.stsKey)
        })
    },
    watch: {
        participantSetting(){
            // this.updateSetting() 
        }
    },
    methods: {
        updateRowsPerPage(e){
            this.rowsPerPage = e.target.value
        },
        showQuestion(row){
            let retVal = {}
            if(typeof this.studentScores !='undefined' 
            && typeof this.studentScores.competencyQuestions !='undefined' 
            && typeof row !='undefined'){
                 Object.values(this.studentScores.competencyQuestions).forEach(competency=>{
                    competency.forEach(item=>{
                        if(row.questionNr == item.id) {
                            retVal = item
                        }
                    })
                })
                this.selectedQuestion = retVal
             $("#question-modal").modal("show");
            }
            
        },
        // showQuestion(item){
        //     this.selectedQuestion = item
        // },
        setStudentKey (stsKey) {
            this.stsKey = stsKey
        }, 
        getProfessorLog(stsKey) {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/professor/getProfessorLog',
                    method: "GET",
                    dataType: 'json',
                    contentType: 'application/json'
                })
                .done( data => {
                    resolve( data )
                })
                .fail( err => reject(err) )
            })
            .then( data => {
                this.professorLog = data.filter(e=> (e.FK_logActionTypeKey == 8 || e.FK_logActionTypeKey == 9) && e.key == stsKey )
                this.professorLog.forEach(e=> e.value = JSON.parse(e.value))
                } )
        },
        getStudentSettings(stsKey) {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/professor/getStudentSettings',
                    method: "GET",
                    dataType: 'json',
                    data: {stsKey: stsKey },
                    contentType: 'application/json'
                })
                .done( data => {
                    resolve( data )
                })
                .fail( err => reject(err) )
            })
            .then( data => this.participantSetting = data )
        },
         getStudentSettingsCorrectOne(stsKey) {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/professor/getStudentSettingsCorrectOne',
                    method: "GET",
                    dataType: 'json',
                    data: {stsKey: stsKey },
                    contentType: 'application/json'
                })
                .done( data => {
                    resolve( data )
                })
                .fail( err => reject(err) )
            })
            .then( data => {
                this.participantSettingCorrectOne = data
                if(typeof data.assessment != 'undefined' && typeof data.assessment.password != 'undefined' ){
                    this.password = data.assessment.password
                    }
                } )
        },
        getStudentReport(stsKey) {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/professor/getStudentReport',
                    method: "GET",
                    dataType: 'json',
                    data: {stsKey: stsKey },
                    contentType: 'application/json'
                })
                .done( data => {
                    resolve( data )
                })
                .fail( err => reject(err) )
            })
            .then( data => {
                this.studentScores = data 
                this.studentScores.questions = this.parseEmails(data) 
                this.studentScores.competencyQuestions = groupBy(this.studentScores.questions, 'competencyName') 
                this.studentScores.competencyQuestions = this.mapper(this.studentScores.competencyQuestions)
            })
        },

        mapper(collection){
            let count = 0; 
            const keys = (Object.keys(collection)); 
            const map = {}; 
            const test = Object.values(collection).forEach((list,index) => {
                map[keys[index]] = list.map(item => {
                    // Convert to map not object, later
                    return { id:++count, value:item }
                }); 
            })
            return map;
        },

        clearStudentScore() {
            this.isLoading = true
            this.isActive = true
            this.notificationMessage = 'Scores have been cleared'
            $("#clear-student").modal("hide");
            $.ajax({
                url: '/capsiminbox/professor/clearStudentScore',
                method: "DELETE",
                data: JSON.stringify({stsKey: this.stsKey, competenciesToClear:this.competenciesToClear}),
                contentType: 'application/json'
            })
            .done( () => setTimeout( () => { 
                this.isLoading = !this.isLoading;
                this.isWarning = false
                if(typeof this.participantSettingCorrectOne.assessment !='undefined'){
                    if(typeof this.participantSettingCorrectOne.assessment.clearedCompetencies !='undefined'){
                        this.competenciesToClear.forEach(competencyKey =>{
                            if(!this.participantSettingCorrectOne.assessment.clearedCompetencies.includes(competencyKey))
                            this.participantSettingCorrectOne.assessment.clearedCompetencies.push(competencyKey)
                        } )
                    }else{
                        this.participantSettingCorrectOne.assessment.clearedCompetencies = this.competenciesToClear
                    }
                }else{
                    this.participantSettingCorrectOne.assessment = {}
                    this.participantSettingCorrectOne.assessment.clearedCompetencies = this.competenciesToClear
                }
                this.getProfessorLog(this.stsKey)

                // this.updateSetting()
                }, 500 ) )
            .fail( err => console.log(err) ) 
        },
        restoreStudentScore() {
            this.isLoading = true
            this.isActive = true
            // this.notificationMessage = 'Scores have been restored'

            $.ajax({
                url: '/capsiminbox/professor/restoreStudentScore',
                method: "POST",
                data: JSON.stringify({stsKey: this.stsKey}),
                contentType: 'application/json'
            })
            .done( data => setTimeout( () => { 
                this.notificationMessage = data.message
                this.isWarning = (data.status == 400)
                this.isLoading = !this.isLoading;

                if(data.status == 200){
                    if(typeof this.participantSettingCorrectOne.assessment !='undefined'){
                        this.participantSettingCorrectOne.assessment.clearedCompetencies = []
                    }else{
                        this.participantSettingCorrectOne.assessment = {}
                        this.participantSettingCorrectOne.assessment.clearedCompetencies = []
                    }
                    this.getProfessorLog(this.stsKey)
                }
                }, 500 ) )
            .fail( err => console.log(err) ) 
        },
        updateSetting: debounce( function() {
            this.isLoading = true
            this.isActive = true
            $.ajax({
                url: `/capsiminbox/professor/update-student-settings/${this.stsKey}`,
                method: 'PUT',
                data: JSON.stringify(this.participantSetting),
                contentType: 'application/json'
            })
            .done( (data) => setTimeout( () => { this.isLoading = !this.isLoading }, 1000 ) )
            .catch( err => console.log(err) )
        }, 500 ),

        updatePassword: debounce( function() {
            this.isLoading = true
            this.isActive = true
            $.ajax({
                url: `/capsiminbox/professor/setStudentSettings`,
                method: 'POST',
                data: JSON.stringify({stsKey:this.stsKey,key:'password',value:this.password,configName:'assessment'}),
                contentType: 'application/json'
            })
            .done( (data) => setTimeout( () => { this.isLoading = !this.isLoading }, 1000 ) )
            .catch( err => console.log(err) )
        }, 500 ),

        getStudentInfo(stsKey) {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/professor/getStudentInfo',
                    method: "GET",
                    dataType: 'json',
                    data: { stsKey: stsKey },
                    contentType: 'application/json'
                })
                .done( data => resolve( data ) )
                .fail( err => reject(err) )
            })
            .then( data => this.participantInfo = data ) 
        },
        
            parseEmails(data){
            const emailsLength = data.questions.length
            const evalRegex = /####.*?####/g; 
            const advancedReport = data.report
            return data.questions.map( (elem, idx) => {

                // Evaluates dynamic content
                elem.answers.map(answer => {
                    const answerText = answer.nameTagKey; 
                    if(answerText){
                        try {
                            let mathces = answer.nameTagKey.match(evalRegex);
                            if(mathces != null){
                                for(let i=0;i<mathces.length;i++){
                                    let temp = mathces[i].replace(/####/g,'')
                                    answer.nameTagKey = answer.nameTagKey.replace(mathces[i],eval(temp))
                                }
                            }
                        } catch (error) {
                            console.log(error); 
                        }
                    }
                    return answer; 
                }); 

                let mathces = elem.questionName.match(evalRegex);
                if(mathces != null){
                    try {
                        for(let i=0;i<mathces.length;i++){
                            let temp = mathces[i].replace(/####/g,'')
                            elem.questionName = elem.questionName.replace(mathces[i],eval(temp))
                        }
                    } catch (error) {
                        console.log(error); 
                    }
                }

                return elem
            })
        },

    }
}
</script>