<template lang="html">
    <div class="col-md-12 welcome">
        <!-- <ol class="breadcrumb">
            <li v-for="breadcrumb in breadcrumbs">{{ breadcrumb }}</li>
        </ol> -->

            <h1>Exit Survey</h1>
            <p class="help-text margin-sides">
                Below are statements about how you view yourself now, not as you wish in the future. Indicate the extent 
                <br>to which you agree with each statement as it applies to you. There are no “right” or “wrong” answers. 
                <br>Take your time and consider each statement carefully.
            </p>
 
            <br>

            <div v-for="(question, index) in postAssessmentQuestions">
                <div class="pl-15">
                    <div class="form-group">
                        <label class="col-sm-12 control-label">{{index+1}}. {{question.description}}</label>
                        <br>
                        <div class="col-sm-12 move-right small">
                            <div v-for="(option,i) in options" class="">
                                <label class="question">
                                    <input v-model.number="answers[question.questionKey]" type="radio" :name="`answer-${question.questionKey}`" :value="`${question.isReversed ? 5-i : i+1}`" :id="`option-${question.questionKey}-${i}`">
                                    {{option}}
                                </label>
                            </div>
                            <br>
                        </div>
                    </div>
                </div>
                <br>
                <br>
            </div>
            <div v-if="showWarning"><span v-if="showWarning" class="text-danger">Please answers all questions before submitting</span></div>
            <br>
            <button @click="submitAnswers" class="btn btn-lg btn-primary mat adjust">Submit</button>
    </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

export default {

    name: 'Post-Assessment',

    components: {
      
    },

    data() {
        return {
            options: ["Strongly Disagree", "Disagree", "Neither Agree, nor Disagree", "Agree", "Strongly Agree"],
            answers: {},
            showWarning: false
        }
    },

    computed: {
        selectedAssessment(){
            return this.$store.getters.selectedAssessment 
        },

        postAssessmentQuestions(){
            return this.selectedAssessment.postAssessmentQuestions.sort((a, b)=>{
                return a.sequence - b.sequence
            })
        },
        answersNeeded(){
            return this.postAssessmentQuestions.length - Object.keys(this.answers).length > 0
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


    methods: {
        submitAnswers(){
            if(this.answersNeeded){
                this.showWarning = true
            } else {
                this.showWarning = false
                this.$store.dispatch('POST_POST_ASSESSMENT', { answers: this.answers, stsKey: this.$store.state.selectedStsKey, update: Object.keys(this.$store.state.allAssessments.length == 1) })
                .then( () => this.$store.dispatch('SET_SETTING', { key: 'completed', value: true, configName: 'postAssessment' }))
                .then( () => this.$router.push({ name: "Dashboard", props: {postAssessmentDone: true} }) ) 
                .catch( err => console.log(err) )
            }
        }

    },

    mounted() {
        $('[data-toggle="tooltip"]').tooltip()
    }

}
</script>

<style lang="scss">

.move-right{
    margin-left: 30px;
}

.adjust{
    margin-left: 300px;
    margin-bottom: 30px;
}

.btn:focus {
  outline: none !important;
}

.btn:active {
  outline: none !important;
}

.glyphicon-info-sign {
    color: #6666FF;
}

.margin-sides{
    margin: 0 20px 0 20px;
}
.question{
    font-weight: normal !important;
}
</style>
