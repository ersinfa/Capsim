<template lang="html">
    <div class="col-md-12 welcome">
        <!-- <ol class="breadcrumb">
            <li v-for="breadcrumb in breadcrumbs">{{ breadcrumb }}</li>
        </ol> -->

        <div v-show="currentStep === 1" class="step-1">
            <h1>Before We Begin</h1>
            <p class="help-text">
                Hello and welcome to CapsimInbox. Before you begin, we have a few questions for you.
            </p>

            <br>

            <div v-for="(question, index) in sortedQuestions" class="questions">
                <label :for="`questionAnswer_${index}`">{{ question.nameTagKey }}</label>
                <br><span v-if="showError && unansweredQuestions.indexOf(question.questionKey) > -1" class="text-danger">Please select an answer</span>
                <select v-model="question.answerKey" class="form-control" :id="`questionAnswer_${index}`">
                    <option v-for="answer in sortAnswers(question.entryAnswers)" :value="answer.answerKey">{{ answer.nameTagKey }}</option>
                </select>
                <br>
            </div>
        </div>

        <div v-show="currentStep === 2" class="step-1">
            <h1>Welcome to CapsimInbox!</h1>
            <p class="help-text">
                <template v-if="versionKey == 42"> <!-- Hardcoed for Ethics Only -->
                    This interactive exercise simulates a portion of a typical workday for a 
                    manager and is designed to assess five important skills: Recognizing Issues, Investigating Facts, Identifying Stakeholders, Generating Solutions and Evaluation Consequences.
                </template>
                <template v-else>
                    This interactive exercise simulates a portion of a typical workday for a
                    manager and is designed to assess five important skills: Organizing, Leading, Problem Solving, Communicating, Initiating.
                </template>
                
            </p>

            <br>
            <h2>Introductory Video</h2>
            <template v-if="versionKey == 42">
                <a target="_blank" href="https://downstream-to-capsim-customers.s3.amazonaws.com/production/videos/CapsimINBOX/ADA/Welcome_to_capsimInbox_Ethics_Audio_Description.mp4">Audio Description</a>
            </template>
            <template v-else>
                <a target="_blank" href="https://downstream-to-capsim-customers.s3.amazonaws.com/production/videos/CapsimINBOX/ADA/Welcome_To_CapsimInbox_Audio_Descriptions.mp4">Audio Description</a>
            </template>
            <div class="well">
                <div class="embed-responsive embed-responsive-16by9">
                    <video ref="video" controls name="media">
                         <template v-if="versionKey == 42"> <!-- Hardcoed for Ethics Only -->
                          <track src="/capsiminbox/resources/vtt/Welcome_to_Capsim_Inbox_ethics.vtt" default kind="subtitles" srclang="en" label="English">
                          <source src="https://downstream-to-capsim-customers.s3.amazonaws.com/production/videos/CapsimINBOX/Welcome%20to%20Capsim%20Inbox_v4_Ethics.mp4" type="video/mp4">
                        </template>
                        <template v-else>
                          <track src="/capsiminbox/resources/vtt/Welcome_to_Capsim_Inbox.vtt" default kind="subtitles" srclang="en" label="English">
                          <source src="https://downstream-to-capsim-customers.s3.amazonaws.com/production/videos/CapsimINBOX/Welcome%20to%20Capsim%20Inbox_v3.mp4" type="video/mp4">
                        </template>
                    </video>
                </div>
            </div>
        </div>
        <!-- <div v-show="currentStep === 3" class="step-2">
            <h1>Inbox Details</h1>

            <p class="help-text">
                Your primary objective during this exercise is to review and respond to emails and messages. Note that you will not need to write-out your responses. Instead, you will be asked to choose among several options, each reflecting a different way that you could respond to the selected email or message.
            </p>

            <p class="help-text">
                CapsimInbox is designed to be completed in its entirety.
                The exercise takes about 60 minutes to complete.
                You must start and finish the exercise in a single session <span class="text-danger"> (you cannot save and return later)</span>.
            </p>

            <br>

            <h3>A Few Tips</h3>
            <ul class="pl-10 tips">
                <li>Be mindful of your time</li>
                <li>Read and think carefully about your choices</li>
                <li>Have fun and do your best!</li>
                <li>Use a notepad to help you respond</li>
            </ul>
        </div> -->
        <button v-show="showNext" @click="nextStepHandler" class="btn btn-success mat pull-right">Next</button>
        <button v-show="showPrevious" @click="previousStep" class="btn btn-info-dark-outline border-radius">Previous</button>
          
    </div>
</template>

    <script>
import cloneDeep from 'lodash/cloneDeep'

    export default {

        mixins: [ require('../mixins/steps') ],

        name: "Welcome",

        data() {
            return {
                currentStep: 1,
                steps: {
                    1: 'Questionnaire',
                    2: 'Welcome',
                    // 3: 'Inbox Details'
                },
                breadcrumbs: [],
                next: 'Self Assessment',
                showError: false,
                showNext: true,
                showPrevious: false,
                questions: cloneDeep(this.$store.getters.selectedAssessment.questions)
            }
        },

        beforeRouteEnter (to, from, next) {
            next(vm => {  
                //route back to Dashboard if no selected assessment on the page such as in the event of a page refresh
                if(!vm.$store.state.selectedStsKey){
                    vm.$router.push({ name: "Dashboard"})
                } 
            })
        },

        computed: {
            sortedQuestions() {
                return this.questions
                        .sort( (e1, e2) => (e1.sort < e2.sort) ? -1 : (e1.sort > e2.sort) ? 1 : 0 )
                        .filter( el => el.isActive )
            },
            unansweredQuestions(){
                return this.questions.filter((q)=>!q.hasOwnProperty("answerKey")).map((e)=>e.questionKey)
            },
            versionKey(){
                return this.$store.getters.selectedAssessment.versionKey
            }
        },

        watch: {
            currentStep( val, oldVal ) {
                if( val === 1 ) this.$refs.video.pause()
                this.showPrevious = ( val != 1 )? true : false
            }
        },

        methods: {
            nextStepHandler() {
                if( this.currentStep === 1 ) {
                    if(this.unansweredQuestions.length == 0){
                        this.showError = false
                        this.$store.dispatch('POST_ANSWERS', this.questions).catch( err => console.log(err) )
                    } else {
                        this.showError = true
                    }
                }
                if(!this.showError) this.nextStep();
            },

			sortAnswers(answers) {
				return answers.map( el => (el) ).sort( (e1, e2) => (e1.sort < e2.sort) ? -1 : (e1.sort > e2.sort) ? 1 : 0 )
            },
            
            // Gets Questionnaire Answers
            getQuestionsAnswers() {
                this.$store.dispatch( 'GET_QUESTIONS_ANSWERS' )
                .then( answers => {
                    let questionsArr = this.$store.getters.selectedAssessment.questions.map(e => e.questionKey)
                    let answersArr = answers.map(e => e.FK_questionKey)
                    for(let i=0; i < answersArr.length; i++){
                        let index = questionsArr.indexOf(answersArr[i])
                        this.$store.getters.selectedAssessment.questions[index].answerKey = answers[i].FK_answerKey
                    }
                    this.questions = cloneDeep(this.$store.getters.selectedAssessment.questions)
                })
                .catch( (err) => console.log(err) )
            },
        },

        mounted() {
            this.$refs.video.onended = () => this.showNext = true
        },

        created() {
            this.getQuestionsAnswers();
        },

        skipWelcomeVideo(){
            return this.$store.state.session.skipWelcomeVideo
        }


    }
    </script>

    <style lang="scss">

    @import "../../../assets/sass/colors.scss";
    .welcome {
        font-size: 1.6rem;

        ul.tips {
            list-style: none;
            li {
                zoom: 1.2;
                &::before {
                    content: "•";
                    margin-right: 10px;
                    font-size: 1.5rem;
                }
                &:nth-child(1) {
                    &::before {
                        color: $primary-color;
                    }
                }
                &:nth-child(2) {
                    &::before {
                        color: $secondary-color;
                    }
                }
                &:nth-child(3) {
                    &::before {
                        color: $third-color;
                    }
                }
            }
        }
    }

    .help-text {
        font-size: 1.8rem;
    }


    </style>
