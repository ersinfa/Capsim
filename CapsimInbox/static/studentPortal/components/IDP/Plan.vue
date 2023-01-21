<!-- INBOX -->
<template v-if="!isExam">
    <div v-if="data">
        <h1><strong>Create Plan</strong></h1>
        <p class="lead">Your Chosen Skill: <b>{{skillsInfo[data.selectedSkill].name}}</b> </p>
        <p class="lead">Skill Development Tactic:</p>
        <div v-html="skillsInfo[data.selectedSkill].developmentalTactic"></div>

        <br/>
        <p>
            Describe the steps you will take to improve your skill and reach your developmental goal. When describing these action steps, try to think of challenging experiences that will alow you a lot of opportunities to apply and practice the developmental tactic shown above. Be as specific as possible when describing your steps. Avoid general statement.
        </p>
        <br/>
        <PlanStep v-for="(step,index) in plan.steps"
            @deleteStep="deleteStep"
            @moveUp="moveUp"
            @moveDown="moveDown"
            :step="step" :stepNr="index+1"
            :isLast="isStepLast(index)" :canDelete="plan.steps.length !== 1">
        </PlanStep>
        <div class="btn btn-primary" @click="addStep()">Add step</div>
        <br/><br/>
        <div @click="next" class="btn btn-success mat pull-right">Next</div>
        <div @click="nextStep('step-3')" class="btn btn-info-dark-outline pull-left border-radius">Back</div>
    </div>

</template>
<!-- END INBOX -->
<!-- MODX -->
<template v-else>
    <div v-if="data">
        <h1><strong>Create Plan</strong></h1>
        <p class="lead">Your Chosen Subject Area: <b>{{ reflectedSkill.competencyName }}</b> </p>
        <!-- <p class="lead">Skill Development Tactic:</p>
        <div v-html="reflectedSkill.developmentalTactic"></div> -->

        <br/>
        <p>
           Describe the steps you will take to improve in this subject area and reach your developmental goal. When describing these action steps, try to think of challenging experiences that will allow you a lot of opportunities to apply and practice tactics that relate to these steps. Be as specific as possible when describing your steps. Avoid general statement.
        </p>
        <br/>
        <PlanStep v-for="(step,index) in plan.steps"
            @deleteStep="deleteStep"
            @moveUp="moveUp"
            @moveDown="moveDown"
            :step="step" :stepNr="index+1"
            :isLast="isStepLast(index)" :canDelete="plan.steps.length !== 1">
        </PlanStep>
        <div class="btn btn-primary" @click="addStep()">Add step</div>
        <br/><br/>
        <div @click="next" class="btn btn-success mat pull-right">Next</div>
        <div @click="nextStep('step-3')" class="btn btn-info-dark-outline pull-left border-radius">Back</div>
    </div>

</template>
<!-- END MODX -->
<script>
import { mapGetters } from 'vuex'
import PlanStep from './PlanStep.vue'

export default {

    name: "Plan",

    props: ['nextStep','data'],

    data() {
        return {
            steps:[{
                action:'',
                date: '',
                resources:'',
                hasError: false
            }]
        }
    },

    computed: {
        plan() {
            return this.data.plan
        },

         ...mapGetters([
            'idpScore',
            'skillsInfo',
            'reportCompetencies'
        ]),

        reflectedSkill () {
          let skill = this.skillsInfo[this.data.selectedSkill]
          if (skill) return skill
          return this.idpScore.filter(score => {
            return score.competencyKey == this.data.selectedSkill
          })[0]
        },

        parentCompetencyScore () {
            return this.reportCompetencies[this.reflectedSkill.competencyName]
        },
        isExam(){
            return this.$store.state.session.isExam == 1
        }
    },


    components: {
        PlanStep
    },
    methods: {
        addStep(){
            this.plan.steps.push({
                action:'',
                date: '',
                resources:'',
                hasError: false,
            })
        },

        deleteStep(i) {
            this.plan.steps.splice(i, 1)
        },

        isStepLast(step) {
            return step === this.plan.steps.length - 1
        },

        moveUp(i) {
            this.plan.steps.move(i, i-1)
        },

        moveDown(i) {
            this.plan.steps.move(i, i+1)
        },

        next() {
            this.validate()
            if( this.plan.steps.find( plan => plan.hasError == true ) ) return
            else this.nextStep('step-5')
        },

        validate() {
            this.$emit('validateStep')
        }
    }    
}

</script>

<style lang="scss" scoped>
</style>
