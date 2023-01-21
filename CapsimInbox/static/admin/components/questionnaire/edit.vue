<template>
  <div id="edit-questionnaire-question">
    <div class="panel panel-default">

      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          Edit Questionnaire Question
        </h2>
      </div>

      <div class="panel-body">

        <custom-input class="w-70" v-model="question.nameTagKey" :label="'Question:'" :id="'question'"></custom-input>

        <div class="form-group">
          <label for="is-active">Is Active:</label>
          <switcher class="mt-10" :id="'is-active'" :selected="question.isActive" v-model="question.isActive"></switcher>
        </div>

        <custom-input :type="'number'" class="w-10" v-model="question.sort" :label="'Order:'" :id="'order'"></custom-input>

        <button class="btn btn-success mat" @click="updateQuestion">Update Question</button>

        <div class="page-header">
          <h3>Answers</h3>
        </div>

        <answers :answers.sync="question.entryAnswers" :questionKey="resourceKey"></answers>
      </div>
    </div>
  </div>
</template>
<script>
export default {

  name: 'edit-questionnaire-question',

  props: {
    resourceKey: {
      required: true
    }
  },

  components: {
    answers: require('./answers.vue')
  },

  data: () => ({
    question: {
      nameTagKey: '',
      isActive: true,
      sort: null
    }
  }),

  created() {
    this.getQuestion()
    .then( question => this.question = question )
  },

  methods: {

    updateQuestion() {

      const payload = {
        nameTagKey: this.question.nameTagKey,
        isActive: this.question.isActive,
        sort: this.question.sort
      }

      this.$store.dispatch('questionnaire/SAVE_RESOURCE', { payload, resourceKey: this.resourceKey })
    },

    getQuestion() {
      return this.$store.dispatch('questionnaire/GET_RESOURCE', this.resourceKey)
    }
  }


}
</script>
