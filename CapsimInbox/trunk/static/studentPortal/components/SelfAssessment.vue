<template lang="html">
    <div class="col-md-12 welcome">
        <!-- <ol class="breadcrumb">
            <li v-for="breadcrumb in breadcrumbs">{{ breadcrumb }}</li>
        </ol> -->

        <div v-show="currentStep === 1" class="step-1">
            <h1>Before You Start!</h1>
            <p class="help-text">
                Before you proceed to the exercise, please respond to the following question:
            </p>
            <p class="help-text">
                Relative to your peers, where would you place yourself on the following skills?
                <br>
                <small>(50 means you are more skilled than half of your peers, 75 means better than 75% of your peers)</small>
            </p>
            <p class="help-text">
                Hover over the info dot to view skill descriptions.
            </p>

            <h2>Self-Assessment</h2>
            <div v-for="(skill, index) in skills" class="col-md-12 mb-30">
                <h4 class="text-capitalize mb-40">
                    {{ skill.name }}
                    <span class="glyphicon glyphicon-info-sign" data-toggle="tooltip" data-placement="top" :title="skill.description"></span>
                </h4>
                <div class="row">
                    <div class="col-md-1" style='text-align: right;'>
                        <p>0</p>
                    </div>
                    <div class="col-md-10">
                         <slider
                            :dotSize="25"
                            :piecewise-style="{ backgroundColor: '#003F54' }"
                            :slider-style="{ backgroundColor: '#1e7658' }"
                            :process-style="{ backgroundColor: '#003F54' }"
                            :tooltip-style="{ backgroundColor: '#1e7658', border:'1px solid #003f54' }"
                            v-model.sync="skill.points" :min="0" :max="100">
                        </slider>
                    </div>
                    <div class="col-md-1" style='text-align: left;'>
                        <p>100</p>
                    </div>    
                </div> 
            </div>
        </div>
        <button v-if="isAssessmentComplete" @click="nextStep" class="btn btn-success mat pull-right">Next</button>
        <button @click="previousStep" class="btn btn-info-dark-outline border-radius">Previous</button>
    </div>
</template>

<script>
import slider from 'vue-slider-component'
import cloneDeep from 'lodash/cloneDeep'

export default {

    name: 'Self-Assessment',

    components: {
        slider
    },

    mixins: [ require('../mixins/steps') ],

    data() {
        return {
            breadcrumbs: [],
            currentStep: 1,
            next: 'Onboarding',
            previous: 'Welcome',
            steps: {
                1: 'Self Assessment'
            },
            skills: cloneDeep(this.$store.getters.selectedAssessment.skills)
        }
    },

    computed: {
      isAssessmentComplete() { return this.skills.every( skill => this.$safeGet( skill, 'points', false ) && skill.points !== 0 ) },

      isAssessmentCompleted() {
          if(this.hasOwnProperty('settings')) {
              return this.$safeGet( this.settings, 'assessment.completed', false )
          }
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

    beforeRouteLeave (to, from, next) {
        if(!!this.$store.state.selectedStsKey && this.isAssessmentComplete && !this.isAssessmentCompleted ){
          this.$store.dispatch( 'SET_ASSESSMENT', this.skills )
          .then( () => next() )
          .catch( (err) => next(false) )
        }else{
          next()
        }
    },

    created() {
        this.breadcrumbs.push(this.steps[1])
        this.getAssessmentAnswers();
    },

    methods: {
      // Gets self assessment scores
      getAssessmentAnswers() {
        this.$store.dispatch( 'GET_ASSESSMENT_ANSWERS' )
        .then( answers => {
          let skillsArr = this.$store.getters.selectedAssessment.skills.map(e => e.skillKey)
          let answersArr = answers.map(e => e.FK_skillKey)
          for(let i=0; i < answersArr.length; i++){
            let index = skillsArr.indexOf(answersArr[i])
            this.$store.getters.selectedAssessment.skills[index].points = answers[i].points
          }
          this.skills = cloneDeep(this.$store.getters.selectedAssessment.skills)
        })
        .catch( (err) => console.log(err) )
      },

    },

    mounted() {
        $('[data-toggle="tooltip"]').tooltip()
    }

}
</script>

<style lang="scss">

.btn:focus {
  outline: none !important;
}

.btn:active {
  outline: none !important;
}

.glyphicon-info-sign {
    color: #6666FF;
}

.vue-slider-piecewise-label {
    font-size: 1.6rem !important;
}
</style>
