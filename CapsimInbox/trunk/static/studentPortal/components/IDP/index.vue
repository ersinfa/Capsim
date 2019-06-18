<template>
  <div class="panel panel-body student-idp">
    <template v-if="!isReportAvailable">
			<div class="alert alert-info lead " role="alert">
				IDP Builder will be available on {{ reportAvailableDate }} 
			</div>
		</template>
    <template v-else>
      <modal @closed="closeModal" :show-okay="false" id="review-skills" closeClass="btn-danger-outline">
        <h4 slot="title">Review Skills!</h4>
        <p slot="body">
          Don't forget to read about each skill to learn exactly how the assessment defines the skills and tips to help improve each skill.
        </p>
      </modal>
      <transition name="slide-fade" >
        <keep-alive>
          <component
              @nextStep="nextStep"
              @updateGoal="updateGoal"
              @goalSelected="goalSelected"
              @selectGoal="selectGoal"
              :is="currentStep"
              :next-step="nextStep"
              :data="report">
          </component>
        </keep-alive>
      </transition>
    </template>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import skills from './Skills.vue'
import reflect from './Reflect.vue'
import goal from './Goal.vue'
import plan from './Plan.vue'
import review from './Review.vue'
import modal from '../../../shared_components/Modal.vue'

export default {

    name: "IDP",

    data() {

      let _this = this

      return {
        steps: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'],
        currentStep: 'step-1',
        report: {},
        reportTemplate: {
            selectedSkill:"",
            reflect:{
                inputs1:[{
                    text:""
                },{
                    text:""
                },{
                    text:""
                }],
                inputs2:[{
                    text:""
                },{
                    text:""
                },{
                    text:""
                }]
            },
            goal:{
                accomplishDate: this.$moment(),
                accomplishPercentage:'',
                evaluate:[]
            },
            plan:{
                steps:[{
                    action:'',
                    date: '',
                    resources:'',
                    hasError: false
                }]
            }
        }
      }
    },

    components: {
        'step-1': skills,
        'step-2': reflect,
        'step-3': goal,
        'step-4': plan,
        'step-5': review,
        modal
    },

    beforeRouteEnter (to, from, next) {
		next(vm => {
            //route back to Dashboard if no selected assessment on the page such as in the event of a page refresh
            if(!vm.$store.state.selectedStsKey){
                vm.$router.push({ name: "Dashboard"})
            } else {
                let stsKey = vm.$store.state.selectedStsKey
                let selectedAssessment = vm.$store.getters.selectedAssessment
                vm.$set( vm.$data, 'currentStep', 'step-1' )
                vm.report = cloneDeep(vm.reportTemplate)
                vm.$store.dispatch('GET_IDP_GOALS', {stsKey})
                vm.$store.dispatch('GET_IDP_SCORE', {stsKey, versionKey: selectedAssessment.versionKey, isExam: selectedAssessment.isExam })
                vm.$store.dispatch('GET_SKILLS_INFO', {versionKey: selectedAssessment.versionKey || vm})
            }
		})
	},

    computed: {
        settings(){
            return this.selectedAssessment.settings
        },
        isExam(){
            return this.$store.state.session.isExam == 1
        },
        goals() {
            return this.$store.getters.goals
        },
        selectedAssessment(){
            return this.$store.getters.selectedAssessment
        },
        reportAvailableDate() {
            if (this.selectedAssessment && Object.keys(this.selectedAssessment).length > 0){
                    return this.selectedAssessment.reportAvailableDate
            }
        },
        now() {
            return this.$moment().format('MM/DD/YYYY hh:mm a')
        }, 
		isReportAvailable() {
            if(this.reportAvailableDate) {
                return this.$moment(this.reportAvailableDate).isBefore(this.now);
            }
        }
    },

    methods: {
        nextStep(step) {
            this.currentStep = step;
            if (step == 'step-1') this.report = cloneDeep(this.reportTemplate)
        },
        goalSelected( studentGoalKey ) {
            this.selectGoal( studentGoalKey )
            this.nextStep('step-5')
        },
        updateGoal(studentGoalKeyToEdit, redirectToStep2) {
            this.$store.dispatch('UPDATE_IDP_GOAL', this.report)
            .then( () => {
                if(redirectToStep2){
                    this.$emit( 'goalSelected', studentGoalKeyToEdit )
                    this.nextStep('step-2')
                } else {
                    this.nextStep('step-5')
                }
            })
        },
        closeModal() {
            this.$store.dispatch('SET_SETTING', { key: 'idpModal', value: true, configName: 'popups' })
            .catch( err => console.log(err) )
        },
        selectGoal(goalKey) {
            this.report = this.goals.find( goal => goal.studentGoalKey === goalKey )
        }
    },

    mounted() {
      if( !this.$safeGet( this.settings, 'popups.idpModal', false ) ) $('#review-skills').modal('show')
    }

}

</script>

<style lang="scss" scoped>

.slide-fade-enter-active {
    transition: all .3s .3s ease;
}
.slide-fade-leave-active {
    transition: all .3s ease;
}
.slide-fade-enter, .slide-fade-leave-to {
    transform: translateX(10px);
    opacity: 0;
}

</style>
