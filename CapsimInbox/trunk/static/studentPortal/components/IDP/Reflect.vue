<!-- INBOX -->
<template>
      <div v-if="data && !isExam">
          <h1><strong>Reflect</strong></h1>
          <div class="lead">Your chosen skill: <b>{{skillsInfo[data.selectedSkill].name}}</b> </div>

          <p>{{skillsInfo[data.selectedSkill].description}}</p>

          <p><b>Describe 2-3 reasons why this skill is relevant to your career</b></p>
          <div v-for="(val, elem) in reflect.inputs1" :class="['form-group mb-15', { 'has-error': checkErrors(elem, 'inputs1') }]">
            <textarea  v-model="val.text" class="form-control" aria-label='Describe reason why this skill is relevant to your career'></textarea>
            <span v-if="checkErrors(elem, 'inputs1')" class="text-danger help-block">{{ validationMessage }}</span>
          </div>

          <br/>
          <p><b> Describe 2-3 situations where you might use this skill in your life, school, job, or anywhere else.</b></p>
          <div v-for="(val, elem) in reflect.inputs2" :class="['form-group mb-15', { 'has-error': checkErrors(elem, 'inputs2') }]">
            <textarea  v-model="val.text" class="form-control" aria-label='Describe situation where you might use this skill in your life, school, job, or anywhere else.'></textarea>
            <span v-if="checkErrors(elem, 'inputs2')" class="text-danger help-block">{{ validationMessage }}</span>
          </div>
          <br/>
          <div @click="next" class="btn btn-primary mat pull-right">Next</div>
          <div @click="$emit('nextStep', 'step-1')" class="btn btn-info-dark-outline pull-left border-radius">Back</div>
      </div>

  <!-- END INBOX -->
  <!-- MODX --> 
      <div v-else-if="data && isExam">
          <h1><strong>Reflect</strong></h1>
          <div class="lead">Your chosen {{ description }}: <b>{{ reflectedSkill.competencyName }}</b> </div>

          <!-- <p>{{skillsInfo[data.selectedSkill].description}}</p> -->

          <p><b>Describe 2-3 reasons why this {{ description }} is relevant to your career</b></p>
          <div v-for="(val, elem) in reflect.inputs1" :class="['form-group mb-15', { 'has-error': checkErrors(elem, 'inputs1') }]">
            <textarea  v-model="val.text" class="form-control" aria-label='Describe reason why this skill is relevant to your career'></textarea>
            <span v-if="checkErrors(elem, 'inputs1')" class="text-danger help-block">{{ validationMessage }}</span>
          </div>

          <br/>
          <p><b> Describe 2-3 situations where you might use this {{ description }} in your life, school, job, or anywhere else.</b></p>
          <div v-for="(val, elem) in reflect.inputs2" :class="['form-group mb-15', { 'has-error': checkErrors(elem, 'inputs2') }]">
            <textarea  v-model="val.text" class="form-control" aria-label='Describe situation where you might use this skill in your life, school, job, or anywhere else.'></textarea>
            <span v-if="checkErrors(elem, 'inputs2')" class="text-danger help-block">{{ validationMessage }}</span>
          </div>
          <br/>
          <div @click="next" class="btn btn-success pull-right">Next</div>
          <div @click="$emit('nextStep', 'step-1')" class="btn btn-info-dark-outline pull-left border-radius">Back</div>
      </div>

</template>
  <!-- END MODX -->
<script>
import { mapGetters } from 'vuex'

export default {

    name: "Reflect",

    props: ['nextStep','data'],

    computed: {
        reflect() {
            return this.data.reflect
        },
        ...mapGetters([
            'idpScore',
            'skillsInfo',
        ]),
        reflectedSkill () {
          let skill = this.skillsInfo[this.data.selectedSkill]
          if (skill) return skill
          return this.idpScore.filter(score => {
            return score.competencyKey == this.data.selectedSkill
          })[0]
        },
        isExam(){
            return this.$store.state.session.isExam == 1
        }
    },

    methods: {

      clearValidation() {
        Object.keys( this.hasError ).forEach( key => this.hasError[key] = false )
      },

      next() {
        this.validate()
        .then( () => this.$emit('nextStep', 'step-3') )
        .catch( errors => this.hasError = errors  )
      },

      validate() {
        return new Promise( (resolve, reject) => {
          let rejectPromise
          let errors = {}
          Object.keys( this.reflect ).forEach( key => {
            let hasError = this.reflect[key][0].text == ""
            if( hasError == true ) rejectPromise = true
            errors[key] = hasError
          })
          return (rejectPromise) ? reject(errors) : resolve()
        })
      },

      checkErrors(elem, key) {
        return elem == 0 && this.hasError[key]
      }
    },

    data: () => ({
      hasError: {
        inputs1: false,
        inputs2: false
      },
      description: 'Subject Area',
      validationMessage: "Required Field"
    }),

    activated() {
      this.clearValidation()
    }
}

</script>

<style lang="scss" scoped>
</style>
