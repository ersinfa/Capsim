<template>
    <div ref="container" class="mail-view p-15" :class="colClass">
        <!-- Email here -->
        <div v-if="currentEmail" :style="{ height: emailHeight, marginRight: emailMarginRight }" style="transition: all 350ms cubic-bezier(0.19, 1, 0.22, 1);" ref="email" class="email p-15" >
            <div class="row">
                <div class="col-md-12">
                    <template v-if="isExam == 1">
                        <h2 class="m-10 text-light">
                            Question #{{$store.state.selectedQuestionID}}
                            <br/>
                            <small>{{currentEmail.competencyName}}</small>
                        </h2>
                        <br/>
                        
                    </template>
                    <template v-else>
                        <h2 class="m-10 text-light">{{ currentEmail.subjectTagKey }}</h2>
                    </template>
                </div>
            </div>
            <template v-if="isExam !== 1">
                <div class="media mb-25">
                
                    <div class="media-left">
                        <a href="#">
                            <authorInitial :author-name="currentEmail.authorNameTagKey"></authorInitial>
                        </a>
                    </div>
                    <div class="media-body">
                        <h4 class="text-semibold mt-0">{{ currentEmail.authorNameTagKey }}
                            <br><small class="author-title">{{ currentEmail.authorTitle }}</small>
                        </h4>
                        {{ currentEmail.timestamp }}
                    </div>
               
            </div>
             </template>

             
            <div @click="openFile(file)" v-for="file in currentEmail.files" data-toggle="modal" data-target="#myModal" class="btn btn-default btn-sm mb-15 mr-15">
                <span :class="['glyphicon', 'p-5', getFileIcon(file)]"></span>
                <span>{{ file.displayName }}</span>
                 <span class="glyphicon glyphicon-triangle-bottom" style="font-size: 0.7em"></span>
            </div>
            <div class="row">
                <div v-html="emailDescription" class="col-md-12 pl-20 pr-20 mb-20">
                </div>
            </div>
            <div v-if="currentEmail.answers.length > 0 || currentEmail.isWrittenResponse == 1" class="row pl-20 pr-20 pb-20">
                <hr>
                <div class="col-md-12 well questions mb-0">
                    <!-- Fix: Repeating code --> 
                    <template v-if="(isSent ) && !(isExam == 1) && !(isWrittenResponse)">
                        <b>Me: <template v-for="answer in answerPicked"> {{answer.nameTagKey}}<br/> </template></b>
                    </template>

                    <template v-else-if="smartAnswer">
                        <b>Me:  {{ smartAnswer }}<br/></b>
                    </template>

                    <template v-else-if="isSent  && !(isExam == 1) && isWrittenResponse">
                        <b>Me:<br><br></b>
                        <p v-html="currentEmail.writtenResponse"><br/></p>
                    </template>

                    <template v-else>
                      <div :class="isWrittenResponse ? 'content-center' : 'col-md-105'">
                        <!-- Multi answer question -->
                        <template v-if="currentEmail.FK_questionTypeKey == 2 && !isWrittenResponse"> 
                          <template v-for="answer in currentEmail.answers">
                            <div class="radio" :class="{'answer-choice': (isExam == 1)}">
                              <label :for="`f-option-${answer.answerKey}`">
                                <input name="answer" :id="`f-option-${answer.answerKey}`" type="checkbox" :value="answer.answerKey" v-model="picked" :disabled="(currentEmail.maxAnswerCount > 1 && currentEmail.maxAnswerCount <= picked.length && !picked.includes(answer.answerKey) )">
                                {{ answer.nameTagKey }}
                              </label>
                            </div>
                          </template>
                        </template>
                        <!-- Single answer question -->
                        <template v-else-if="currentEmail.FK_questionTypeKey == 1 && !isWrittenResponse">
                            <template v-for="answer in answersToShow" >
                                <div class="radio" :class="{'answer-choice': (isExam == 1)}">
                                    <label :for="`f-option-${answer.answerKey}`">
                                    <input :name="`answer`" :id="`f-option-${answer.answerKey}`" type="radio" :value="answer.answerKey" v-model="picked">
                                    {{ answer.nameTagKey }}
                                    </label>
                                </div>
                            </template>
                        </template>
                        <!-- Written Response question -->
                        <template v-else-if="isWrittenResponse">
                          <!-- <textarea v-model="writtenResponse" type="text" placeholder="Enter your response here" class='emailMsgAnswer'></textarea> -->
                          <wysiwyg id="written-response" v-model="writtenResponse" 
                           v-on:content-updated="saveDraft" :value="draftValue" class='emailMsgAnswer'></wysiwyg>
                        </template>
                       
                        <template v-if="isSent && answerPicked">
                             <b>Saved Answer: <template v-for="answer in answerPicked"> {{ (filterAnswers(answer))}}<br/> </template></b>
                        </template>
                      </div>

                      <div class="col-md-12" style="margin-top: 10px" >

                        <button @click="submitAnswer" class="btn btn-primary mat pull-right"  >
                            <template v-if="$store.state.assessmentTypeKey == 3">
                              Respond
                            </template>
                            <template v-else>
                                {{ info.respond }}
                            </template>
                        </button> 
                        
                        <button v-if="isWrittenResponse"  @click="saveDraft" class="btn btn-default mat pull-right" id="save-draft" style="margin-right: 10px;"  > 
                            Save Draft
                        </button>
                      </div>
                    </template>
                 
                </div>
            </div>
            <template v-if="isExam == 1">
                <button class="btn btn-primary pull-left mat" v-if="showPrevious" id="showPrevious" @click="clickPrevious">  Previous</button>
                <button class="btn btn-primary pull-right mat" v-if="showNext" id="showNext" @click="clickNext">Next</button>
            </template>
        </div>
        <!-- No email selected -->
        <div class="empty"></div>
        
    </div>
</template> 
<script>

export default {
  name: "mailView",

  components: {
    radioButton: require("./inputs/radio.vue"),
    authorInitial: require("./AuthorInitial.vue")
  },

  data() {
    return {
      windowHeight: 0,
      size: 7,
      picked: [],
      initial: true,
      showError: false,
      isChatOpen: false,
      errorMessage: "Please pick an answer.",
      writtenResponse: "",
      draftValue: "",
      smartAnswer: null
    };
  },

  props: {
    currentEmail: {
      type: Object
    },
    questionNumber: {
      type: [Number, String]
    },
    className: {
      type: String
    }
  },

  watch: {
    "currentEmail.questionKey": function() {
      if (this.$refs.email) this.scrollTop();
      this.reset();
    }
  },

  computed: {
    emailDescription() {
      let description = this.currentEmail.descriptionTagKey
        .replace(/{name}/g, this.userName)
        .replace(/{date.\(-\d{0,2}\)}/g, match =>
          this.formatDate(match, "MMMM D, YYYY")
        )
        .replace(
          /{date}/g,
          this.$moment()
            .startOf("week")
            .subtract(2, "days")
            .format("MMMM D, YYYY")
        )
        .replace(/{datetime.\(-\d{0,2}\)}/g, match =>
          this.formatDate(match, "MMMM D, YYYY h:mm a")
        )
        .replace(
          /{datetime}/g,
          this.$moment()
            .startOf("week")
            .subtract(2, "days")
            .format("MMMM D, YYYY h:mm a")
        );

      return description;
    },

    emailHeight() {
      
      // if (this.currentEmail) {
      //   if (this.isExam) {
      //     return `${this.windowHeight - 200}px`;
      //   } else {
      //     return `${this.$refs.container.offsetHeight - 30}px`;
      //   }
      // }
      
     return '1000px';
    },

    answersToShow(){
      let answersToShow = this.currentEmail.answers
      if(this.currentEmail.isSmartThreading == 1){
          let answeredEmailKeyArr = this.$store.state.selectedSmartThreadingAnswers
          let newArr = answersToShow.filter(e => answeredEmailKeyArr.indexOf(e.answerKey) == -1 )
          return newArr
      } else {
        return answersToShow
      }
      
    },

    isWrittenResponse() {
      if(this.currentEmail.isWrittenResponse == 1){
       this.writtenResponse = this.getDraftData();
      }
      return this.currentEmail.isWrittenResponse == 1;
    },

    emailMarginRight() {
      return this.isChatOpen
        ? `${this.$store.getters.constants["chat-width"]}px`
        : "0px";
    },

    colSize() {
      var arr = this.size.toString().split(".");
      return arr.length > 1 ? `${arr[0]}${arr[1]}` : `${arr[0]}`;
    },

    colClass() {
      if (this.className) return this.className;
      return `col-md-${this.colSize}`;
    },

    answered() {
      return this.currentEmail.answer !== undefined;
    },

    isSent() {
      if (this.currentEmail.isSent) {
        // const map = this.currentEmail.answer.map(x=> x.answerKey)
        // this.picked = map[0]
        return this.currentEmail.isSent;
      }
      return false;
    },

    answerPicked() {
      if (this.currentEmail.answer) return this.currentEmail.answer;
      return {};
    },

    isExam() {
      if (this.$store.state) {
        return this.$store.state.isExam;
      }
    },

    userName() {
      return this.$store.getters.userData.firstname;
    },

    info() {
      if (this.$store.state) {
        // startCase
        return this.$store.state.info;
      }
    },
    showPrevious() {
      return this.$store.state.selectedQuestionID > 1;
    },

    showNext() {
      return (this.$store.state.selectedQuestionID < this.$store.getters["email/activeEmails"].length);
    }

  },

  methods: {
    saveDraft(){
      const question = this.$store.state.emails.find(question => question.questionKey === this.currentEmail.questionKey);
      //console.log(question);
      question.writtenResponse = this.writtenResponse;
      return this.$store.dispatch("email/ANSWER_EMAIL_SAVE_DRAFT", {
          questionkey: this.currentEmail.questionKey,
          writtenResponse: this.writtenResponse
      })
      console.log('Draft saved..');
    },
    getDraftData(){
      /*
      let payload = { questionkey: this.currentEmail.questionKey }
      $.post({ url: '/capsiminbox/webapp/get_savedraft', dataType: 'json', data: payload })
      .then( (data) => {
        console.log(data);
      });
      */
      const question = this.$store.state.emails.find(question => question.questionKey === this.currentEmail.questionKey);
      //console.log(question); 

      if(question.writtenResponse != undefined){
        return question.writtenResponse;
      }
      else if(this.currentEmail.writtenDraftResponse != undefined){
        return this.currentEmail.writtenDraftResponse;
      }
      else{
        return "";
      }
      
      //return (question.writtenResponse != undefined) ? question.writtenResponse : "";
    },
    clickPrevious() {
      $(`#questionListTable tr:nth-child(${this.$store.state.selectedQuestionID - 1})`).click();
    },

    clickNext() {
      $(`#questionListTable tr:nth-child(${this.$store.state.selectedQuestionID + 1})`).click();
    },

    formatDate(match, format) {
      let offset = parseInt(match.substring(8, match.length - 2));
      return this.$moment()
        .startOf("week")
        .subtract(2 + offset, "days")
        .format(format);
    },

    filterAnswers(answerPicked) {
      const result = this.currentEmail.answers.filter(answer => {
        return answer.answerKey == answerPicked.answerKey;
      });
      return result.map(x => x.nameTagKey).join(", ");
    },

    reset() {
      this.picked = [];
      if ("answer" in this.currentEmail) {
        if (this.currentEmail.FK_questionTypeKey == 1) {
          this.picked = this.currentEmail.answer[0].answerKey;
        } else {
          for (let i = 0; i < this.currentEmail.answer.length; i++) {
            this.picked.push(this.currentEmail.answer[i].answerKey);
          }
        }
      }
      //this.writtenResponse = "";
      this.initial = true;
      this.showError = false;
      this.smartAnswer = null;
    },

    resize() {
      this.$el.style.height = `${window.innerHeight - 50}px`;
      if (this.$refs.email)
        this.$refs.email.style.height = `${this.$refs.container.offsetHeight -
          30}px`;

      this.windowHeight = window.innerHeight;
    },

    submitAnswer() {
      if (!this.currentEmail.isWrittenResponse) {
        if (!this.validate()) return;
      }

        // Starts Promise chain
        Promise.resolve()
        // Clears answers before inserting new answers
        .then( () => {
            if (this.currentEmail.isSent){
                const answerKeys = this.answerPicked.map(x => x.answerKey);
                return this.$store.dispatch("email/CLEAR_EMAIL", {
                    questionkey: this.currentEmail.questionKey,
                    oldAnswerkey: answerKeys
                })
            }
        })
        // Inserting answers
        .then(() => {
            if (this.currentEmail.isWrittenResponse) {
                return this.$store.dispatch("email/ANSWER_EMAIL_WRITTEN", {
                    questionkey: this.currentEmail.questionKey,
                    writtenResponse: this.writtenResponse
                })
            } else {
              if(!this.isExam){
                this.$store.commit('SET_STATE', {data: {recentlySelectedAnswerKey: this.picked}})
              }
                
                if( this.currentEmail.isSmartThreading == 1){
                  let answersArr =  this.$store.state.selectedSmartThreadingAnswers
                  answersArr.push(this.picked)
                  this.$store.commit('SET_STATE', {data: {selectedSmartThreadingAnswers: answersArr }})
                }
                return this.$store.dispatch("email/ANSWER_EMAIL", {
                questionkey: this.currentEmail.questionKey,
                answerkey: this.picked,
                isSmartThreading: this.currentEmail.isSmartThreading
                });
            }
        })
        // Updates store with answers selection
        .then(() => {
            if (!this.currentEmail.isWrittenResponse) {
                const question = this.$store.state.emails.find(question => question.questionKey === this.currentEmail.questionKey);
                let answers =  typeof this.picked == "object" ? this.picked : [this.picked];
                let questionAnswers = question.answers.filter(answer => answers.includes(answer.answerKey));
                let timeImpact = 0;
                questionAnswers.forEach(answer => { timeImpact += answer.timeImpact; });
                if (timeImpact != 0) this.$store.commit("time/UPDATE_DEADLINE", timeImpact);
                if(this.currentEmail.isSmartThreading){
                  this.smartAnswer = questionAnswers[0].nameTagKey
                }
            }
            //need to manually reset this component because the questionKey won't change if you return to same smart threadaing question
          
        })
        .catch(error => {
            this.$store.dispatch("Errors/responseError", error);
        });
        
    },

    scrollTop() {
      this.$refs.email.scrollTop = 0;
    },

    validate() {
      if (!(Array.isArray(this.picked) && this.picked.length == 0)) return true;
      this.showError = true;
      return false;
    },

    openFile(file) {
      this.$emit("openFile", file);
    },

    getFileIcon(file) {
      let docType = file.FK_fileTypeKey;
      switch (docType) {
        case 1:
          return "glyphicon-picture";
        case 2:
          return "glyphicon-play-circle";
        default:
          return "glyphicon-file";
      }
    }
  },

  mounted() {
    this.windowHeight = window.innerHeight;
    EventBus.$on("open", () => (this.size -= 1.5));
    EventBus.$on("close", () => (this.size += 1.5));
    $(window).on("resize", () => this.resize());
    EventBus.$on("toggleChat", () => {
      this.isChatOpen = !this.isChatOpen;
    });
  }
};
</script>
<style lang="scss" scoped>
.mail-view {
  background-color: #fafafa;
  color: #6c6d6d;
  height: 100%;

  &.modex {
    background-color: #edeff0;
    padding: 60px !important;
  }
  .email {
    overflow-y: auto;
    background-color: white;
    box-shadow: 0px 0px 2px rgba(181, 181, 181, 0.45);
    border-radius: 2px;
    color: black;
  }

  .author-title {
    font-size: 1.2rem;
    color: #000;
  }

  > h3 {
    line-height: 60px;
    margin: 0 -15px;
    color: white;
    background-color: #41cac0;
  }

  .mail-buttons {
    color: #6c6d6d;

    .glyphicon {
      font-size: 18px;
    }
    .icon-text {
      font-size: 16px;
      text-transform: uppercase;
    }
  }

  .emailMsgAnswer {
    width: 100%;
    height: 15vh;
    margin-bottom: 20px;
  }

  .glyphicon-share-alt {
    &.Reply {
      transform: scaleX(-1);
    }
    &.Forward {
      transform: scaleY(1);
    }
  }

  .flagged {
    color: #ff4d4d;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.52);
  }

  // input[type="radio"] {
  //     position: absolute;
  //     display: none;
  // }

  .questions {
    counter-reset: listStyle;
    .answer-choice {
      counter-increment: listStyle;
      margin-left: 20px;
    }
    .answer-choice::before {
      position: absolute;
      left: -20px;
      top: 5px;
      content: counter(listStyle, upper-alpha) ".";
    }

    .error-message {
      color: red;
    }

    label {
      font-weight: normal;
      .glyphicon {
        font-size: 14px;
      }
      .unchecked-answer {
        padding-top: 1px;
        width: 13px;
        height: 13px;
        border: 2px solid black;
        border-radius: 50%;
        display: inline-block;
      }
    }
  }
}
</style>
