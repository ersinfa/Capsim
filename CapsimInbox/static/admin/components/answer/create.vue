<template>
  <div id="show-question">

    <h4>Create Response</h4>
    <p>This is the text that will appear for participants.</p>

    <form>
      <div class="form-group">
        <label for="description">Description</label>
        <input id="description" class="form-control" type="text" v-model="answer.nameTagKey">
      </div>
    </form>

    <div v-if="skills.length > 0" class="form-inline">
      <h3 class="mt-30">Skills</h3>
      <p>If you want this response to add or subtract points, add a skill here and enter how many points you want this to be worth.</p>
      <div v-for="(skill, key) in answerToSkill">
        <div class="form-group">
          <select v-model="skill.FK_skillKey" class="form-control">
            <option v-for="sElem in skills" :value="sElem.skillKey">{{ sElem.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <input v-model="skill.points" type="text" class="form-control">
        </div>
        <div style="display: inline-block" class="form-froup">
          <button class="btn mat btn-danger" @click="deleteAnswerToSkill( skill.FK_skillKey )">Delete</button>
        </div>
        <div class="clearfix mt-20"></div>
      </div>
      <button class="btn mat btn-primary" @click.prevent="addSkill">Add Skill</button>
    </div>

    <div v-if="competencies.length > 0" class="form-inline">
      <h3 class="mt-30">Additional Competencies (optional)</h3>
      <p>If you want this response to add or subtract points, add a competency here and enter how many points you want this to be worth.</p>
      <div v-for="(competency, key) in answerToCompetency">
        <div class="form-group">
          <select v-model="competency.FK_competencyKey" class="form-control">
            <option v-for="sElem in competencies" :value="sElem.competencyKey">{{ sElem.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <input v-model="competency.points" type="text" class="form-control">
        </div>
        <div style="display: inline-block" class="form-froup">
          <button class="btn mat btn-danger" @click="deleteAnswerToCompetency( competency.FK_competencyKey )">Delete</button>
        </div>
        <div class="clearfix mt-20"></div>
      </div>
      <button class="btn mat btn-primary" @click.prevent="addCompetency">Add Competency</button>
    </div>

    <br>

    <button class="btn mat btn-success" @click.prevent="createAnswer">Create Answer</button>
  </div>

</template>
<script>

export default {

  name: 'create-answer',

  props: {
    versionKey: {
      required: true
    },
    questionKey: {
      required: true
    }
  },

  data() {
    return {
      skills: [],
      competencies: [],
      answerToSkill: [],
      answerToCompetency: [],
      answer: {
        nameTagKey: '',
        sequence: 0,
        FK_answerTypeKey: 1
      }
    }
  },

  created() {
    this.getCompetencies()
    this.getSkills()
  },

  methods: {

    addCompetency() {
      this.answerToCompetency.push({ FK_competencyKey: 0, points: 0 })
    },

    addSkill() {
      this.answerToSkill.push({ FK_skillKey: 0, points: 0 })
    },

    createAnswer() {

      let payload = {
        answer: Object.assign({}, this.answer, { FK_questionKey: this.questionKey }),
        answerToCompetency: this.answerToCompetency,
        answerToSkill: this.answerToSkill
      }

      this.$store.dispatch('answer/CREATE_RESOURCE', payload)
      .then( answer => this.$emit('answerCreated', answer) )
      .then( () => this.resetAnswer() )
    },

    deleteAnswerToCompetency(competencyKey) {
      this.answerToCompetency = this.answerToCompetency.filter( atc => atc.FK_competencyKey !== competencyKey )
    },

    deleteAnswerToSkill(skillKey) {
      this.answerToSkill = this.answerToSkill.filter( ats => ats.FK_skillKey !== skillKey )
    },

    getCompetencies() {

      $.ajax({
        url: '/capsiminbox/admin/api/competencies',
        method: 'get',
        data: {
          FK_versionKey: this.versionKey
        },
        dataType: 'json'
      })
      .done( competencies => this.$set(this, 'competencies', competencies) )
      .fail( err => console.log(err) )
    },

    getSkills() {

      $.ajax({
        url: '/capsiminbox/admin/api/skills',
        method: 'get',
        data: {
          FK_versionKey: this.versionKey
        },
        dataType: 'json'
      })
      .done( skills => this.$set(this, 'skills', skills) )
      .fail( err => console.log(err) )
    },

    resetAnswer() {
      this.answerToCompetency = []
      this.answerToSkill = []
	  this.answer.sequence = 0
	  this.answer.nameTagKey = ''
    }

  }

}
</script>
<style lang="scss" scoped>
.question-body {
  border: 1px solid #c6c6c6;
  background-color: #eeeeee;
  border-radius: 5px;
}
</style>
