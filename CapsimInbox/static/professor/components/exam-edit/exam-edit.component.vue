<template lang="html">
    <div v-if="isExam === 1">
      <notification :message="'Exam successfully updated'" :isLoading="isLoading" :isActive.sync="isActive" :style="{ 'z-index': '999' }">
            <span class="glyphicon glyphicon-ok mr-5" slot="success-icon"></span>
        </notification>
        <h1> Edit Exam </h1>

        <div class="panel panel-default">
            <div class="panel-body">

              <ul class="nav nav-tabs nav-justified" role="tablist">
                <li role="presentation" class="active"><a href="#SettingsTab" aria-controls="Settings" role="tab" data-toggle="tab">Settings</a></li>
                <li role="presentation"><a href="#ExamTab" aria-controls="Exam" role="tab" data-toggle="tab">Exam</a></li>
              </ul>

                <div class="tab-content">
                <div role="tabpanel" class="tab-pane active" id="SettingsTab">
                  <ExamSettings/>
                    <template v-if="isMasteradmin">
                      <ScoringAutomation/>
                    </template>
                    <LmsTimeAccommodation/>
                </div>
                <div role="tabpanel" class="tab-pane " id="ExamTab">
                  <h3> Exam Content </h3>
                  <h4> Question Selection</h4>
                  <div class="col-sm-6 text-center">Question</div>
                  <div class="col-sm-6 text-center">Question Preview</div>
                  <div class="clearfix"></div>
                  <div class="col-sm-6">
                    <div class="box-size ">
                      <template v-for="questionGroup in unAssignedQuestionGroup">
                        <div class="checkbox" style="padding: 2px 0px">
                          <label class="custom-checkbox" :class="{'active': (selectedQuestionGroupToAssign.includes(questionGroup.questionGroupKey))}">
                            <span class="checkmark"></span>
                            <input :value="questionGroup.questionGroupKey" v-model="selectedQuestionGroupToAssign" type="checkbox">
                            <!-- {{questionGroup.name}} -->
                            <b>
                              <template v-for="(competency, index) in questionGroup.competencies">
                                <template v-if="index > 0">/</template>
                                  {{competency.name}}
                              </template>
                            </b>
                            <template v-for="(skill, index) in questionGroup.skills">
                                <template v-if="index > 0">/</template>
                                  {{skill.name}}
                              </template>
                          </label>
                        </div>
                      </template>
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <div class="well">
                        Preview coming soon!
                      </div>
                    </div>

                    <div class="clearfix"></div> <br/>
                    <button v-if="isExamLocked == false" class="btn btn-primary" @click="addQuestionGroups()"> Add Question</button>
                    <button v-else class="btn btn-primary disabled" > Add Question</button>


                    <hr>
                    <h4>Exam Preview</h4>
                    <div class="col-sm-6">
                      <div class="box-size">
                      <template v-for="(questionGroup,questionGroupIndex) in assignedQuestionGroup">
                        <div class="checkbox">
                          <label class="exam-item panel panel-default" :class="{'active': (selectedQuestionGroupToUnAssign.includes(questionGroup.questionGroupKey))}">

                            <div style="display:table-row">
                              <div class="exam-preview-left-column">
                                  {{questionGroupIndex + 1}}
                              </div>
                              <div class="exam-preview-right-column">
                                  <input :value="questionGroup.questionGroupKey" v-model="selectedQuestionGroupToUnAssign" type="checkbox"  style="display:none">
                              <!-- {{questionGroup.name}} -->
                                  <b>
                                    <template v-for="(competency, index) in questionGroup.competencies">
                                      <template v-if="index > 0">/</template>
                                        {{competency.name}}
                                    </template>
                                  </b></br>
                                  <template v-for="(skill, index) in questionGroup.skills">
                                    <template v-if="index > 0">/</template>
                                    {{skill.name}}
                                  </template>
                              </div>
                            </div>


                      
                          </label>
                        </div>
                      </template>

                      </div>
                    </div>
                    <div class="col-sm-6">
                      <div class="well">
                        Preview coming soon!
                      </div>
                    </div>
                    <div class="clearfix"></div>
                    <br/>


                      <button v-if="isExamLocked == false" class="btn btn-primary" @click="removeQuestionGroups()"> Remove Question</button>
                      <button v-else class="btn btn-primary disabled"> Remove Question</button>
                      <!-- <button class="btn btn-primary" @click="updateSelectedQuestionGroups()"> Update Question Set</button> -->
                </div>

              </div>
           </div>
        </div>

        <!-- <div class="panel panel-default">
            <div class="panel-body">
              <ExamSettings/>

              <template v-if="isMasteradmin">
                 <ScoringAutomation/>
              </template>
             
              <LmsTimeAccommodation/>
              
            </div>
        </div> -->

        <!-- <div class="panel panel-default">
          <div class="panel-body">
              <h3> Exam Content </h3>
              
              <template v-for="questionGroup in questionGroups">
                <div class="checkbox">
                  <label>
                    <input :value="questionGroup.questionGroupKey" v-model="selectedQuestionGroup" type="checkbox">
                    {{questionGroup.name}}
                  </label>
                </div>
              </template>
              <button class="btn btn-primary" @click="updateSelectedQuestionGroups()"> Update Question Set</button>
            </div>
        </div> -->
    </div>
</template>

<script>
import debounce from 'lodash.debounce'
import ExamSettings from '../settings'
import ScoringAutomation from '../scoring-automation'
import LmsTimeAccommodation from '../lms-time-accommodation'
import { mapState } from 'vuex'

export default {
    name: 'capsim-professor-exam-edit',
    data: () => ({
      isExamLocked:false,
      questionGroups:[],
      selectedQuestionGroup:[],
      selectedQuestionGroupToAssign:[],
      selectedQuestionGroupToUnAssign:[],
      assignedQuestionGroup:[],
      unAssignedQuestionGroup:[],
    }),
    components: { ExamSettings, LmsTimeAccommodation, ScoringAutomation },
    computed: {
        ...mapState(['isExam']),
        settings(){
            return this.$store.state.settings || {}
        },
        isMasteradmin(){
         return this.$route.query.masteradmin == 1
        },
    },
    mixins: [require('../../mixins/courseSettings')],
     methods: {

       addQuestionGroups(){
        if( this.isExamLocked != true){
          this.selectedQuestionGroup = this.assignedQuestionGroup.map(e=> e.questionGroupKey)
          this.selectedQuestionGroup.push(...this.selectedQuestionGroupToAssign)
          this.updateSelectedQuestionGroups()
        }
       },
       removeQuestionGroups(){
        if( this.isExamLocked != true){
          this.selectedQuestionGroup = this.assignedQuestionGroup.map(e=> e.questionGroupKey)
          this.selectedQuestionGroup = this.selectedQuestionGroup.filter( ( el ) => !this.selectedQuestionGroupToUnAssign.includes( el ) )
          this.updateSelectedQuestionGroups()
        }
       },

       getExamQuestions() {
            $.ajax({
                url: '/capsiminbox/professor/getExamQuestions',
                method: 'GET',
                contentType: 'application/json'
            })
            .done( (data) => {
              this.assignedQuestionGroup = data.assignQuestions
              this.unAssignedQuestionGroup = data.unAssignQuestions
              this.selectedQuestionGroupToAssign = []
              this.selectedQuestionGroupToUnAssign = []
            })
            .catch( err => console.log(err) )
        }, 
       hasStudentsStartedExam() {
            $.ajax({
                url: '/capsiminbox/professor/hasStudentsStartedExam',
                method: 'GET',
                contentType: 'application/json'
            })
            .done( (data) => {
              this.isExamLocked = data
            })
            .catch( err => console.log(err) )
        }, 

        getVersionQuestionGroups: debounce( function() {
          $.ajax({
            url: '/capsiminbox/professor/getVersionQuestionGroups',
            method: 'GET',
            dataType: 'json'
          })
          .done((questionGroups) => this.questionGroups = questionGroups)
          .catch( err => console.log(err) )
        }, 500 ),

        getQuestionGroupToSim: debounce( function() {
          $.ajax({
            url: '/capsiminbox/professor/getQuestionGroupToSim',
            method: 'GET',
            dataType: 'json'
          })
          .done((selectedQuestionGroup) => this.selectedQuestionGroup = selectedQuestionGroup)
          .catch( err => console.log(err) )
        }, 500 ),

      
        updateSelectedQuestionGroups: debounce( function() {
          this.isLoading = true
          this.isActive = true
          $.ajax({
            url: '/capsiminbox/professor/updateSelectedQuestionGroups',
            method: 'PUT',
            data: JSON.stringify({selectedQuestionGroup: this.selectedQuestionGroup}),
            contentType: 'application/json'
          })
          .done( () => setTimeout( () => { this.isLoading = !this.isLoading 
          this.getExamQuestions()
          }, 1000 ) )
          .catch( err => console.log(err) )
        }, 500 ),

        // generateStudentsPassword: debounce( function() {
        //   this.isLoading = true
        //   this.isActive = true
        //   $.ajax({
        //     url: '/capsiminbox/professor/generateStudentsPassword',
        //     method: 'post',
        //     contentType: 'application/json'
        //   })
        //   .done( () => setTimeout( () => { this.isLoading = !this.isLoading }, 1000 ) )
        //   .catch( err => console.log(err) )
        // }, 500 ),

    },

  created() {
    this.hasStudentsStartedExam()
    this.getVersionQuestionGroups()
    this.getQuestionGroupToSim()
    this.getExamQuestions()
  },
}
</script>

<style lang="scss" scoped>
  .box-size{
    height: 350px;
    overflow: auto;
  }
  .exam-item{
    display: block;
    width: 98%;
    padding: 0;
  }

  .exam-item.active{
    background-color: #383677;
    color: #fff;
  }
  .exam-preview-left-column{
    display: table-cell; 
    vertical-align:middle;
    background-color: #383677;
    color: #fff;
    border-radius: 4px 0px 0px 4px;
    width: 40px;
    text-align: center;
  }
  .exam-preview-right-column{
    display: table-cell;
    padding: 10px
  } 



  .custom-checkbox {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  // font-size: 22px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
}

/* On mouse-over, add a grey background color */
.custom-checkbox:hover .checkmark {
  background-color: #ccc;
}

/* When the checkbox is checked, add a blue background */
.custom-checkbox.active .checkmark {
  background-color: #383677;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.custom-checkbox.active .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.custom-checkbox .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>

