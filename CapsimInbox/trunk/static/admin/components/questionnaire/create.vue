<template>
  <div id="create-questionnaire-question">
    <div class="panel panel-default">

      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          Create Questionnaire Question
        </h2>
      </div>

      <div class="panel-body">

        <custom-input class="w-70" v-model="question.nameTagKey" :label="'Question:'" :id="'question'"></custom-input>

        <div class="form-group">
          <label for="is-active">Is Active:</label>
          <switcher class="mt-10" :id="'is-active'" :selected="question.isActive" v-model="question.isActive"></switcher>
        </div>

        <custom-input class="w-10" v-model="question.sort" :label="'Order:'" :id="'order'"></custom-input>

        <button class="btn btn-success mat" @click="createQuestion">Create Question</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {

  name: 'create-questionnaire-question',

  props: {
    versionKey: {
      required: true
    }
  },

  data: () => ({
    question: {
      nameTagKey: '',
      isActive: true,
      sort: null
    }
  }),

  methods: {

    createQuestion() {

      const payload = {
        ...this.question,
        FK_versionKey: this.versionKey
      }

      const pushTo = (resourceKey) => ({ name: 'edit-questionnaire-question', params: { resourceKey } })

      this.$store.dispatch('questionnaire/CREATE_RESOURCE', payload)
      .then( question => this.$router.push(pushTo(question.questionKey)) )
    }
  }


}
</script>
