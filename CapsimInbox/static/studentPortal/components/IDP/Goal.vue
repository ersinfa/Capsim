<template>
    <!-- INBOX -->
    <div v-if="data && !isExam">
      <h1><strong>Set Goal</strong></h1>

      <p class="lead">Your Chosen Skill: <b>{{skillsInfo[data.selectedSkill].name}}</b> </p>
      <p class="lead">Your Current Proficiency: <b>{{idpScore.find( score => score.skillKey == data.selectedSkill ).score}}</b> </p>

      <br>
      <div :class="['form-group mb-25', { 'has-error': checkErrors('accomplishDate') }]">
        <label class="control-label" for="accomplish-date"> By when do you want to accomplish your skill development?</label>
          <div class="input-group col-md-3">
            <date-picker id="accomplish-date" v-model="accomplishDate" :config="dateConfig" :wrap="true"></date-picker>
            <div class="input-group-addon">
              <span class="glyphicon glyphicon-calendar"></span>
            </div>
          </div>


        <span v-if="checkErrors('accomplishDate')" class="help-block">{{ validationMessage }}</span>
      </div>

      <div :class="['form-group mb-25', { 'has-error': checkErrors('accomplishPercentage') }]">
        <label class="control-label" for="accomplish-percentage"> What percent improvement do you want to see?</label>
        <div class="input-group" style="width: 200px">
          <input type="number" id="accomplish-percentage" class="form-control"  v-model.number="accomplishPercentage">
          <span class="input-group-addon">%</span>
        </div>
        <span v-if="checkErrors('accomplishPercentage')" class="help-block">{{ validationMessage }}</span>
      </div>

      <div :class="['form-group mb-25', { 'has-error': checkErrors('evaluate') }]">
        <p class="control-label"><b>How will you evaluate your progress?</b></p>
        <div class="checkbox" v-for="n in evaluations">
          <label>
            <input v-model="evaluate" type="checkbox" :value="n.name"> {{ n.name }}
          </label>
        </div>
        <span v-if="checkErrors('evaluate')" class="help-block">{{ validationMessage }}</span>
      </div>

      <br/>
      <p><b>Your Goal Statement:</b></p>
      I will improve my <b> {{skillsInfo[data.selectedSkill].name}} </b> by {{ accomplishPercentage }}% no later than {{ accomplishDate }} as evaluated by
      {{ goal.evaluate.join(', ') }}.


      <br/><br/>
      <div @click="next" class="btn btn-primary mat pull-right">Next</div>
      <div @click="nextStep('step-2')" class="btn btn-info-dark-outline pull-left border-radius">Back</div>

    </div>
  <!-- END INBOX -->
  <!-- MODX -->
    <div v-else-if="data && isExam">
      <h1><strong>Set Goal</strong></h1>
      
      <p class="lead">Your Chosen {{ description }}: <b> {{ reflectedSkill.competencyName }} </b> </p>
      <p class="lead">Your Current Score: <b> {{ roundScore(parentCompetencyScore) }}% </b> </p>
      <!-- <p class="lead">Your Chosen Skill: <b>{{skillsInfo[data.selectedSkill].name}}</b> </p>
      <p class="lead">Your Current Proficiency: <b>{{idpScore.find( score => score.skillKey == data.selectedSkill ).score}}</b> </p> -->
      
      <br>
      <div :class="['form-group mb-25', { 'has-error': checkErrors('accomplishDate') }]">
        <label class="control-label" for="accomplish-date"> By when do you want to accomplish your development?</label>
          <div class="input-group col-md-3">
            <date-picker id="accomplish-date" v-model="accomplishDate" :config="dateConfig" :wrap="true"></date-picker>
            <div class="input-group-addon">
              <span class="glyphicon glyphicon-calendar"></span>
            </div>
          </div>


        <span v-if="checkErrors('accomplishDate')" class="help-block">{{ validationMessage }}</span>
      </div>

      <div :class="['form-group mb-25', { 'has-error': checkErrors('accomplishPercentage') }]">
        <label class="control-label" for="accomplish-percentage"> What percent improvement do you want to see?</label>
        <div class="input-group" style="width: 200px">
          <input type="number" id="accomplish-percentage" class="form-control"  v-model.number="accomplishPercentage">
          <span class="input-group-addon">%</span>
        </div>
        <span v-if="checkErrors('accomplishPercentage')" class="help-block">{{ validationMessage }}</span>
      </div>

      <div :class="['form-group mb-25', { 'has-error': checkErrors('evaluate') }]">
        <p class="control-label"><b>How will you evaluate your progress?</b></p>
        <div class="checkbox" v-for="n in evaluations">
          <label>
            <input v-model="evaluate" type="checkbox" :value="n.name"> {{ n.name }}
          </label>
        </div>
        <span v-if="checkErrors('evaluate')" class="help-block">{{ validationMessage }}</span>
      </div>

      <br/>
      <p><b>Your Goal Statement:</b></p>
      I will improve in <b> {{ reflectedSkill.competencyName  }} </b> by {{ accomplishPercentage }}% no later than {{ accomplishDate }} as evaluated by
      {{ goal.evaluate.join(', ') }}.
      <!-- <p><b>Your Goal Statement:</b></p>
      I will improve my <b> {{skillsInfo[data.selectedSkill].name}} </b> by {{ accomplishPercentage }}% no later than {{ accomplishDate }} as evaluated by
      {{ goal.evaluate.join(', ') }}. -->

      <br/><br/>
      <div @click="next" class="btn btn-success pull-right">Next</div>
      <div @click="nextStep('step-2')" class="btn btn-info-dark-outline pull-left border-radius">Back</div>
    </div>
  <!-- END MODX -->
 </template> 

<script>
import { mapGetters } from 'vuex'

export default {

  name: "Goal",

  props: ['nextStep','data'],

  data() {
    let _this = this
    return {
      validationMessage: 'Required Field',
      dateConfig: {
        format: 'MM/DD/YYYY',
        minDate: new Date()
      },
      evaluations:[
        { name: 'CapsimInbox' },
        { name: 'Peer Feedback' },
        { name: 'Manager Feedback' },
        { name: 'Self-evaluation' }
      ],
      hasError: {
        accomplishDate: {
          val: false,
          validate: function() {
            this.val = _this.accomplishDate == ""
          }
        },
        accomplishPercentage: {
          val: false,
          validate: function() {
            this.val = _this.accomplishPercentage == ""
          }
        },
        evaluate: {
          val: false,
          validate: function() {
            this.val = _this.evaluate.length == 0
          }
        }
      }
    }

  },

  computed: {

    accomplishDate: {
      get() {
        return this.goal.accomplishDate
      },

      set(val) {
        this.goal.accomplishDate = val
      }
    },

    accomplishPercentage: {
      get() {
        return this.goal.accomplishPercentage
      },
      set(val) {
        this.goal.accomplishPercentage = val
      }
    },

    evaluate: {
      get() {
        return this.goal.evaluate
      },

      set(val) {
        this.goal.evaluate = val
      }
    },

    goal() {
      return this.data.goal
    },

    ...mapGetters([
      'idpScore',
      'skillsInfo',
      'reportCompetencies'
    ]),

    reflectedSkill() {
      let skill = this.skillsInfo[this.data.selectedSkill]
      if (skill) return skill
      return this.idpScore.filter(score => {
        return score.competencyKey == this.data.selectedSkill
      })[0]
    },

    parentCompetencyScore () {
        return this.$safeGet(this.reportCompetencies, this.reflectedSkill.competencyName, 0)
    },

    isExam(){
        return this.$store.state.session.isExam == 1
    }
  },

  methods: {

    next() {
      this.validate()
      .then( () => this.nextStep('step-4') )
      .catch( () => ({}) )

    },

    validate() {
      return new Promise( (resolve, reject) => {
        let hasErrors
        Object.keys( this.hasError ).forEach( key => {
          let dataObject = this.hasError[key]
          dataObject.validate()
          if( dataObject.val ) hasErrors = true
        })
        return (hasErrors) ? reject() : resolve()
      })
    },

    roundScore(score){
        if(score % 1 !== 0){
            const factor = Math.pow(10, 1)
            return (Math.round(score * factor) / factor)
        }
        return score
    },

    checkErrors( key ) {
      return this.hasError[key].val
    }

  }
}

</script>

<style lang="scss" scoped>
  .checkbox {
    color: black;
  }
</style>
