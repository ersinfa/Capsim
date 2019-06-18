<template>
    <div class="row col-wrapper">

        <leftNavigation v-on:openFile="openFile" v-on:selectEmail="emailSelected"></leftNavigation>
      
		<!-- Remove middle pane for Exam -->
        <template v-if="isExam == 1">
            <mailView className="col-lg-9 col-md-8 modex" :currentEmail="currentEmail" v-on:openFile="openFile"></mailView>
        </template>

        <template v-else>
            <inbox v-on:selectEmail="emailSelected"></inbox>
            <mailView className="mail-view p-15" :currentEmail="currentEmail" v-on:openFile="openFile"></mailView>
        </template>
       
        <notification v-if="unreadMessages > 0" :message="newMessageText" :isLoading="false" :isWarning="false" :isActive.sync="showAlert">
            <span slot="icon" class="glyphicon glyphicon-comment"></span>
        </notification>

        <modal :show-okay="false" id="myModal" size="lg" closeClass="btn-danger-outline">
            <template v-if="openedFile">
                <h4 slot="title">
                    {{ openedFile.displayName }}
                    <a class="btn btn-sm btn-primary mat"
                    :href="fileHref" target="_blank">Open in window</a>
                </h4>

                <iframe v-if="/\.xls|\.xlsx|\.doc|\.docx|\.ppt|\.csv|\.pptx/.test(fileHref)" slot="body" width="100%" height="800px" frameborder='0' :src="fileSrc"></iframe>
                <object v-else-if="/\.pdf/.test(fileHref)" slot="body" width="100%" height="800px" :data="fileHref"></object>
                <img v-else-if="/\.jpg|\.png|\.jpeg/.test(fileHref)" slot="body" :src="fileHref" :alt="openedFile.displayName">
                <div v-if="openedFile.FK_fileTypeKey === 2" slot="body" class="embed-responsive embed-responsive-16by9">
                    <iframe class="embed-responsive-item" :src="fileHref"></iframe>
                </div>
            </template>
        </modal>

        <!-- I see a pattern in the these modal formats, i think these could be combined into a single modal that loads in the info details.  -->
        <!-- However, that would require a code rewrite, and could result in an inbox issue.  -->

        <template v-if="$store.state.assessmentTypeKey == constants.ASSESSMENT_TYPE_KEY.DEMO">

            <modal :confirm-text="'Exit'" v-on:confirm="exitInbox" id="assessment-warning" closeClass="btn-danger">
                <h4 slot="title">Assessment Not Complete</h4>
                <p slot="body">WARNING: Your assessment is in-progress. If you leave, the timer will continue to run until the assessment is complete.</p>
            </modal>

            <modal :confirm-text="'Complete'" v-on:confirm="exitInbox" :show-close="false" id="assessment-complete">
                <h4 slot="title">Assessment Complete</h4>
                <p slot="body">You have completed the CapsimInbox assessment. When your instructor has released results, you can view these on the dashboard.</p>
            </modal>
        </template>

        <template v-else-if="$store.state.assessmentTypeKey == constants.ASSESSMENT_TYPE_KEY.REHEARSAL">

            <modal v-on:closed="hideModal" :confirm-text="'Next'" v-on:confirm="hideModal" :showClose="false" id="step-1" >
              <h4 slot="title"> {{ info.assessmentRehearsal.title }} </h4>
              <p slot="body"> {{ info.assessmentRehearsal.body }} </p>
            </modal> 

          <template v-if="isExam == 1">
              <modal :confirm-text="'Complete'"  v-on:confirm="exitTutorials()" :show-close="false" confirm-class="btn-success" id="assessment-complete">
                  <h4 slot="title">Tutorial Complete</h4>
                  <p slot="body"> 
                      You've completed all questions in this tutorial. If you'd like to view this again, please re-select "Tutorial" in your left hand navigation.
                      <br/><br/>
                      Please note: The report links to the left are only for this tutorial. Your exam will use different data.
                  </p>
              </modal>

              <modal :confirm-text="'OK'"  v-on:confirm="closeModal" :show-close="false" id="assessment-warning">
                  <h4 slot="title"> Warning </h4>
                  <p slot="body">You have not completed all of the questions in this tutorial. If you feel prepared, feel free to enter your exam or retake this one!</p>
              </modal>
          </template>

        </template>


        <template v-else>
              <modal 
                  :confirm-text="info.assessmentWarning.confirmText" 
                  :close-text="info.assessmentWarning.closeText" 
                  :show-close="info.assessmentWarning.showClose" 
                  :show-okay="!hideExitButton"
                  :confirm-class="(isExam == 1)? 'btn-success' : 'btn-danger' "
                  :close-class="(isExam == 1)? 'btn-default-outline' : 'btn-success' "
                  v-on:confirm="exitInbox(info.assessmentWarning.exit)" 
                  id="assessment-warning">
                      <h4 slot="title">{{ info.type }} Not Complete</h4>
                      <p slot="body"> {{ info.assessmentWarning.body }} </p>
              </modal>

              <modal 
                  :confirm-text="info.assessmentComplete.confirmText" 
                  :close-text="info.assessmentComplete.closeText" 
                  :show-close="info.assessmentComplete.showClose"
                  :show-okay="!hideExitButton"
                  v-on:confirm="exitInbox(info.assessmentComplete.exit)" 
                  id="assessment-complete-inbox">
                          <h4 slot="title">{{ info.type }} Complete</h4>
                          <p slot="body"> {{ info.assessmentComplete.body }} </p>
              </modal>

              <modal 
                  :showExit="false" 
                  :show-close="false"
                  :show-okay="!hideExitButton"
                  :confirm-text="'Close Exam'"
                  confirmClass="btn-danger"  
                  v-on:confirm="exitInbox(true)"
                  id="past-due-modal-inbox">
                  <h4 slot="title">Exam has ended</h4>
                  <p slot="body">
                      Time has expired. Your results have been submitted.
                  </p>
              </modal>

              <modal 
                  :showExit="false" 
                  :show-close="false"
                  :show-okay="!hideExitButton"
                  :confirm-text="'Close'"
                  confirmClass="btn-danger"  
                  v-on:confirm="exitInbox(`previouslycompleted`)"
                  id="already-complete-modal-inbox">
                  <h4 slot="title">Exam has ended</h4>
                  <p slot="body">
                      You have already completed the assessment and your responses have been submitted.
                  </p>
              </modal>
              
            <template v-if="isExam == 1">
                <modal 
                    :confirm-text="info.assessmentConfirmation.confirmText" 
                    :close-text="info.assessmentConfirmation.closeText" 
                    :show-close="info.assessmentConfirmation.showClose" 
                    v-on:confirm="exitInbox(info.assessmentConfirmation.exit)" 
                    id="assessment-confirmation">
                        <h4 slot="title">{{ info.type }} Confirmation</h4>
                        <p slot="body"> {{ info.assessmentConfirmation.body }} </p>
                </modal>

                <modal 
                    :showExit="false" 
                    :show-close="false"
                    :confirm-text="'Close Exam'"
                    v-on:confirm="exitInbox(true)"
                    id="past-due-modal">
                    <h4 slot="title">Exam has ended</h4>
                    <p slot="body">
                        Time has expired. Your results have been submitted.
                    </p>
                </modal>

                <modal :showOkay="false" id="error-response-modal">
                    <template v-if="errors">
                        <h4 slot="title">Oops!</h4>
                        <p slot="body">
                          <template v-if="typeof errors.hardCodededResponse != 'undefined'">
                            {{errors.hardCodededResponse.message}}
                            <template v-if="errors.hardCodededResponse.displayLogOutBtutton == 1">
                              <br/>
                              <br/>
                              <a href="/CapsimInbox/student/logout" class="btn btn-primary mat" style="font-size:12px !important">Log Out</a>
                            </template>
                          </template>
                          <template v-else>
                            {{errors.message}}
                          </template>
                            
                        </p>
                    </template>
                </modal>

                <modal :showOkay="false" :showExit="false" :close-text="'Continue'" v-on:closed="showTermsOfUseModal()" id="custon-UF-modal-V125" close-class="btn-success">
                    <h2 slot="title">Please read before starting! </h2>
                    <p style="font-size:18px;margin-bottom:18px;" slot="body">
                        The Capsim Modular Exam is intended to test your general knowledge of Operations Management. <br/><br/>
                        <b>Please read the following limitations and information about this exam:</b><br/>
                        <ul>
                          <li>Open book: No</li>
                          <li>Computer Tools: None</li>
                          <li>Open notes: No</li>
                          <li>Open web: No</li>
                          <li>Calculators: Basic business or financial calculators (NO Graphing Calculators)</li>
                          <li>Scratch paper: Yes – Blank (2 sheets front and back. This may be printer paper or lined paper.)</li>
                          <li>Other permitted materials: Linked files within exam application.</li>
                          <li>Restroom breaks permitted: None</li>
                        </ul>
                          You will have 30 minutes to complete the exam. Please be sure to contact your proctor before logging out from your exam.<br/><br/>
                          Please do not contact Prof. Munson with questions, but rather <span class="btn-link"> megan.leroy@warrington.ufl.edu </span> (if Prof Munson gets many emails he may be inclined to be less generous with future exam questions)<br/>
                    </p>
                </modal>   

                <modal :showOkay="false" :showExit="false" :close-text="'Continue'" v-on:closed="showTermsOfUseModal()" id="custon-UF-modal-V244" close-class="btn-success">
                    <h2 slot="title">Please read before starting! </h2>
                    <p style="font-size:18px;margin-bottom:18px;" slot="body">
                        The Capsim Modular Exam is intended to test your knowledge of business concepts taught over the course of your program. <br/><br/>
                        <b>Please read the following limitations and information about this exam:</b><br/>
                        <ul>
                          <li>Open book: No</li>
                          <li>Computer Tools: None</li>
                          <li>Open notes: No</li>
                          <li>Open web: No</li>
                          <li>Calculators: Basic business or financial calculators (NO Graphing Calculators)</li>
                          <li>Scratch paper: Yes – Blank (2 sheets front and back. This may be printer paper or lined paper.)</li>
                          <li>Other permitted materials: Linked files within exam application.</li>
                          <li>Restroom breaks permitted: None</li>
                        </ul>
                          You will have 120 minutes to complete the exam. Please be sure to contact your proctor before logging out from your exam.<br/><br/>
                          Please do not contact Prof. Munson with questions, but rather <span class="btn-link"> megan.leroy@warrington.ufl.edu </span> (if Prof Munson gets many emails he may be inclined to be less generous with future exam questions)<br/>
                    </p>
                </modal>                

                <modal :showOkay="false" :showExit="false" :close-text="'Agree'" v-on:closed="showInfoModal()" id="terms-of-use-modal" close-class="btn-success">
                    <h2 slot="title">Terms Of Use </h2>
                    <p style="font-size:18px;margin-bottom:18px;" slot="body">
                        This exam is licensed exclusively for single use to {{username}}; reuse or use by anyone else is fraudulent. This is an individual and confidential examination, protected by the laws of the United States and international law. 
                        <br /><br /> <b> Exam agreement: </b>
                        <br />By pressing the Agree button below I certify that I am {{username}}. I agree I will not record or copy any exam question or answer in any form, verbally, in writing, or by electronic means, including but not limited to screenshots, recorded media, telephony, and Internet web sites, blogs, chat rooms, e-mail, or forums.
                    </p>
                </modal>

                <modal :showOkay="false" :showExit="false" :close-text="'Continue'" v-on:closed="startClock()" id="info-modal" close-class="btn-success">
                    <!-- <h4 slot="title"> </h4> -->
                    <p style="font-size:18px;margin-bottom:18px;" slot="body">
                        As you complete your exam, you will need to reference certain reports, graphs, and charts. These are housed in your left hand navigation under the <b>Files</b> header.
                    </p>
                </modal>

            </template>

        </template>

    </div>
</template>

<script>
import Inbox from "./Inbox.vue";
import MailView from "./MailView.vue";
import LeftNavigation from "./LeftNavigation.vue";
import Modal from "../../shared_components/Modal.vue";
import CapsimTable from "../../shared_components/CapsimTable.vue";
import notification from "../../shared_components/Notification.vue";
import { mapGetters } from "vuex";
import debounce from 'lodash.debounce'
import delay from 'lodash.delay'

export default {
  name: "Home",

  data() {
    return {
      currentEmail: null,
      openedFile: null,
      showAlert: true,
      hideExitButton: false
    };
  },

  beforeRouteEnter(to, from, next) {
    next(instance => {
      instance.$store
        .dispatch("LOAD_STATE")
        .then(() => {
          if (instance.$store.state.assessmentTypeKey == instance.$store.getters.constants.ASSESSMENT_TYPE_KEY.WEBAPP) {
            if (instance.$store.state.isExam != 1)
              return instance.$store.dispatch("START_SIM");
          }
        })
        .then(() => {
          if (instance.$store.state.isExam != 1 || instance.$store.state.assessmentTypeKey == instance.$store.getters.constants.ASSESSMENT_TYPE_KEY.REHEARSAL)
            return instance.$store.dispatch("time/initializeClock");
        })
        .catch(err => console.log(err));
    });
  },

  mounted() {
    EventBus.$on("completeAssessment", () => this.completeAssessment());
    this.$el.style.height = `${window.innerHeight - 50}px`;
    window.addEventListener(
      "resize",
      () => (this.$el.style.height = `${window.innerHeight - 50}px`)
    );
    window.onbeforeunload = () => true;
    if (this.isExam == 1){
        if(this.$store.state.versionKey == 125) $("#custon-UF-modal-V125").modal({ backdrop: "static", keyboard: false });
        else if(this.$store.state.versionKey == 244) $("#custon-UF-modal-V244").modal({ backdrop: "static", keyboard: false });
        else $("#terms-of-use-modal").modal({ backdrop: "static", keyboard: false });
    }

    if (this.$store.state.assessmentTypeKey == this.$store.getters.constants.ASSESSMENT_TYPE_KEY.REHEARSAL){
        $('#step-1').modal('show')
    }
 
    if(this.isReEntrySingle){
      this.setThreadedEmailsOnReEntry() 
    }
    if (this.isExam != 1){
      delay(()=>{
            this.checkIfComplete()
      }, 2000)
    }
    
  },

  components: {
    Inbox,
    MailView,
    LeftNavigation,
    Modal,
    notification,
    CapsimTable
  },

  watch: {
    assessmentComplete(val) {
        this.getAssessmentCompleted()
    },

    currentTime(val) {
      if ((this.isExam === 1 || this.showTimerAsClock) && val <= 0) {
        EventBus.$emit("completeAssessment");
      }
    }
  },

  computed: {
    reports() {
      if (this.$store.state.Reports) {
        return this.$store.state.Reports;
      }
    },

    errors() {
      if (this.$store.state.Errors) {
        return this.$store.state.Errors;
      }
    },

    info() {
      if (this.$store.state) {
        // startCase
        return this.$store.state.info;
      }
    },

    isExam() {
      if (this.$store.state) {
        return this.$store.state.isExam;
      }
    },

    username() {
      if (this.$store.state.userData) {
        const user = this.$store.state.userData;
        return `${user.firstname} ${user.lastname}`;
      }
    },

    unreadMessages() {
      if (this.unansweredEmails.length === 0)
        return this.activeMessages.filter(message => !message.isRead).length;
      else
        return this.activeMessages.filter(message => message.timer <= this.elapsed && !message.isRead).length;
    },

    ...mapGetters("email", ["unansweredEmails"]),
    
    ...mapGetters("email", ["answeredEmails"]),

    ...mapGetters("email", ["threadEmails"]),
    
    ...mapGetters("email", ["cleanEmails"]),

    ...mapGetters("chat", ["messagesFromThread"]),

    ...mapGetters("chat", ["activeMessages"]),

    ...mapGetters("chat", ["messages"]),

    ...mapGetters("time", ["currentTime"]),

    ...mapGetters("email", ["activeEmails"]),

    timer() {
      return this.$store.state.time;
    },

    elapsed() {
      return this.$store.getters["time/elapsed"];
    },

    newMessageText() {
      return `You have ${this.unreadMessages} new ${this.unreadMessages > 1 ? "messages" : "message"}.`;
    },

    isReEntry(){
      return this.$store.state.userData.isReEntry
    },

    isReEntrySingle(){
      return this.$store.state.userData.isReEntrySingle
    },

    isPostAssessment(){
      return this.$store.state.userData.postAssessment
    },

    showTimerAsClock(){
      return this.$store.state.userData.showTimerAsClock
    },

    assessmentComplete() {
       return this.$store.getters.assessmentComplete
    },

    fileHref() {
      let link = "";
      if (this.openedFile !== null) {
        // if( this.openedFile.FK_fileTypeKey !== 2 && ( /\.xls|\.xlsx|\.doc|\.docx|\.ppt|\.pptx/.test(this.openedFile.fileName) ) ) link = `${this.$store.state.assetsPath}/capsiminbox/${this.fileType}/${this.openedFile.fileName}`
        if (
          this.openedFile.FK_fileTypeKey !== 2 &&
          /\.xls|\.xlsx|\.doc|\.docx|\.ppt|\.csv|\.pptx/.test(
            this.openedFile.fileName
          )
        )
          link = `${this.$store.state.assetsPath}/capsiminbox/${
            this.fileType
          }/${this.openedFile.fileName}`;
        else if (this.openedFile.FK_fileTypeKey !== 2)
          link = `${this.$store.state.assetsPath}/capsiminbox/${
            this.fileType
          }/${this.openedFile.fileName}`;
        else link = this.openedFile.fileName;
      }
      return link;
    },

    fileSrc() {
      //    return `http://docs.google.com/gview?url=${this.fileHref}&embedded=true`
      return `https://view.officeapps.live.com/op/embed.aspx?src=${
        this.fileHref
      }`;
    },

    fileType() {
      let fileTypeFolder = "";
      if (this.openedFile == null) return fileTypeFolder;
      else if (/\.png|\.jpeg|\.jpg/.test(this.openedFile.fileName))
        fileTypeFolder = "images";
      else if (/\.pdf/.test(this.openedFile.fileName)) fileTypeFolder = "pdfs";
      else fileTypeFolder = "documents";

      return fileTypeFolder;
    },

    constants(){
        return this.$store.getters.constants;
    },

    assessmentPreviouslyCompleted(){
      return this.$store.state.assessmentComplete
    }
  },

  methods: {
    exitTutorials() {
        window.onbeforeunload = undefined
      return (window.parent.location.href = "/capsiminbox/student/dashboard");
    },
    closeModal() {
      $("#assessment-complete").modal("hide");
      $("#assessment-warning").modal("hide");
    },
    hideModal(modalId) {
      $(`#step-1`).modal("hide");
      $('[data-toggle="popover"]').popover("show");
    },
    startClock() {
      if (this.$store.state.assessmentTypeKey == this.constants.ASSESSMENT_TYPE_KEY.WEBAPP) {
        this.$store
          .dispatch("START_SIM")
          .then(() => this.$store.dispatch("time/initializeClock"));
      } else {
        this.$store.dispatch("time/initializeClock");
      }
    },
    showInfoModal() {
      $("#info-modal").modal({ backdrop: "static", keyboard: false });
    },
    showTermsOfUseModal() {
      $("#terms-of-use-modal").modal({ backdrop: "static", keyboard: false });
    },
    openFile(file) {
      this.openedFile = file;
      if (this.$store.state.assessmentTypeKey == this.constants.ASSESSMENT_TYPE_KEY.WEBAPP) {
        !this.openedFile.isLogged &&
          this.logActivity({
            payload: { objectKey: file.fileKey, actionKey: 6 }
          });
      }

      this.openedFile.isLogged = true;
    },

    emailSelected(email) {
      this.currentEmail = email;
    },

    logActivity({ payload, callback }) {
      $.post({
        url: "/capsiminbox/webapp/log-activity",
        dataType: "json",
        data: payload
      })
        .done(res => {
          if (typeof callback == "function") callback();
        })
        .fail(err => console.log(err));
    },

    completeAssessment() {
      if (this.assessmentComplete) return this.exitInbox();
      else if (this.currentTime <= 0 && this.$store.state.assessmentTypeKey == this.constants.ASSESSMENT_TYPE_KEY.WEBAPP) return this.pastDue();
      else return $("#assessment-warning").modal("toggle");
    },

    //this delays the modal check by a half second to make sure the modal doesn't pop up too early as the getter breifly changes
    getAssessmentCompleted: debounce( function() {
      if(this.$store.getters.assessmentComplete) {
        $("#assessment-complete-inbox").modal("toggle");
        $("#assessment-complete").modal("toggle");
      } 
    }, 500 ),

    showReport(reportKey) {
      if (this.reports[reportKey]) {
        this.currentReport = this.reports[reportKey];
        this.currentReportUrl = `/capsiminbox/webapp/report-window?report=${reportKey}`;
        $("#report-modal").modal("toggle");
      }
    },
    
    exitInbox(exit) {
      this.hideExitButton = true
      if (this.$store.state.assessmentTypeKey == this.constants.ASSESSMENT_TYPE_KEY.WEBAPP) {
        this.activeEmails.map(email => {
          if (email.isWrittenResponse == 1 && email.isSent == false) {
            this.$store
              .dispatch("email/ANSWER_EMAIL_WRITTEN", {
                questionkey: email.questionKey,
                writtenResponse: "--NO RESPONSE PROVIDED BY STUDENT--"
              })
              .catch(error => {
                this.$store.dispatch("Errors/responseError", error);
              });
          }
        });
       if ((exit && this.isReEntrySingle && !this.assessmentComplete) || exit=='previouslycompleted'){
          window.onbeforeunload = undefined;
          return (window.location.href = "/capsimInbox/webapp/re-entry-single")
        } else if (exit || (exit === undefined && this.isExam !== 1)) {
          window.onbeforeunload = undefined;
          return (window.location.href = "/capsiminbox/webapp/complete-assessment");
        } else {
          $("#assessment-complete").modal("hide");
          $("#assessment-complete-inbox").modal("hide");
          $("#assessment-warning").modal("hide");
          $("#assessment-confirmation").modal("toggle");
          return;
        }
    } else if(this.$store.state.assessmentTypeKey == this.constants.ASSESSMENT_TYPE_KEY.REHEARSAL) {
    } else {
        $("#assessment-complete").modal("hide");
        $("#assessment-warning").modal("hide");
        this.$router.push({ name: "feedback" });
      }
    },

    pastDue() {
      $("#past-due-modal-inbox").modal({ backdrop: "static", keyboard: false });
      $("#past-due-modal").modal({ backdrop: "static", keyboard: false });
    },

    checkIfComplete(){
        if(this.assessmentPreviouslyCompleted && !this.isReEntrySingle && !this.isReEntry){
          $("#already-complete-modal-inbox").modal({ backdrop: "static", keyboard: false });
        }
    },

    setThreadedEmailsOnReEntry: debounce( function() {
      let selectedAnswers = []
    
      this.activeMessages.map(am =>{
        if(am.answer) selectedAnswers.push(am.answer[0].answerKey)
      })
      this.answeredEmails.map(e => {
        if(e.answer) selectedAnswers.push(e.answer[0].answerKey)
      })
  

      //if you have answered emails at this point, we know you are reentering, and we want to remove the time delay from non-threaded emails
      if(this.answeredEmails.length > 0){
        this.cleanEmails.forEach(e=>{
          if(e.timer > 0){
            Vue.set(e, 'timer', null)
          }
        })
        this.activeMessages.forEach(m=>{
          if(m.timer > 0){
            Vue.set(m, 'timer', null)
          }
        })

      }

      //this gets all the threaded emails/messages that have been delivered prior to re-entering and delivers them
      this.messagesFromThread.forEach(m =>{
        if (m.dependencies.length > 0 && selectedAnswers.indexOf(m.dependencies[0].FK_answerKey) > -1 ) {
          Vue.set(m, 'dependencies', [])
          Vue.set(m, 'timer', null)
        }   
      })

      this.threadEmails.forEach(te =>{
        if (selectedAnswers.indexOf(te.dependencies[0].FK_answerKey) > -1) {
          Vue.set(te, 'dependencies', [])
          Vue.set(te, 'timer', null)
        }   
      })
    }, 5000 )
  }
};
</script>

<style lang="scss">
.notification-box {
  position: absolute;
  top: 5px !important;
  right: 200px !important;
  box-shadow: 0 0 2px #424242 !important;
  width: auto;
  z-index: 9999;
  padding: 10px !important;
}
.close {
  opacity: 0.7 !important;
}

.slide-notification-enter {
  transform: translateX(300px) !important;
  opacity: 0;
}
.slide-notification-leave-to {
  transform: translateX(-200px) !important;
  opacity: 0;
}

.col-wrapper {
  background-color: #f1f2f7;

  > div:first-of-type {
    border-right: 1px solid #dadadc;
  }
  > div {
    border-right: 1px solid #dadadc;
  }
}
</style>
