<template>
  <div id="create-question">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          New Email or Message
        </h2>
      </div>

      <div class="panel-body">

        <question-form @addAuthor="addAuthor" :version-key="versionKey" :authors="authors" :question="question"></question-form>

        <div class="mt-20">
          <button :class="['btn mat btn-primary pl-15', { disabled: question.FK_authorKey == 0 }]" @click.prevent="saveQuestion">Save</button>
          <span v-show="question.FK_authorKey == 0" class="text-danger">Please select a valid author.</span>
        </div>

      </div>
    </div>
  </div>
</template>
<script>

export default {

  name: "create-question",

  data() {
    return {
      authors: [],
      question: {
        sequence: 0,
        FK_questionDisplayTypeKey: 1,
        subjectTagKey: '',
        descriptionTagKey: '',
        FK_authorKey: 0,
        timer: 0,
        isImportant: 0,
        dependsOn: null,
        FK_questionGroupKey: this.$route.query.questionGroupKey
      }
    }
  },

  props: {
    versionKey: {
      required: true
    }
  },

  components: {
    answer: require('../answer/create.vue'),
    questionForm: require('./form.vue')
  },

  methods: {

    addAuthor(author) {
      this.authors.push(author)
    },

    getAuthors() {
      $.ajax({
        url: '/capsiminbox/admin/api/authors',
        method: 'get',
        data: {
          FK_versionKey: this.versionKey
        },
        dataType: 'json'
      })
      .done( authors => this.authors = authors )
      .fail( err => console.log(err) )
    },

    saveQuestion() {

      if( this.question.FK_authorKey == 0 ) return

      let payload = Object.assign({}, this.question, { versionKey: this.versionKey })

      this.$store.dispatch('question/CREATE_RESOURCE', payload)
      .then( question => this.$router.push({ name: 'edit-question', params: { resourceKey:  question.questionKey } }) )
    }
  },

  created() {
    this.getAuthors()
  }

}
</script>
