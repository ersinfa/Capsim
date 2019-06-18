<template>
  <div id='entry-questionnaire-list'>
    <div class="panel panel-default">

      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          Entry Questionnaire

          <router-link class="btn btn-primary mat pull-right" :to="{ name: 'create-questionnaire-question', params: { versionKey: versionKey } }">
            <span class="glyphicon glyphicon-plus"></span>
            Add Question
          </router-link>

        </h2>
      </div>

      <div class="panel-body">


        <table class="table">
          <thead>
            <th>Order</th>
            <th>Question</th>
            <th>Is Active</th>
          </thead>
          <draggable @sort="sortQuestions" :list="questionsToSort" :element="'tbody'">
            <tr v-for="question in questions" :key="question.questionKey">
              <td>{{ question.sort }}</td>
              <td>{{ question.nameTagKey }}</td>
              <td>{{ (question.isActive) ? 'Yes' : 'No' }}</td>
              <td>
                <router-link class="btn mat btn-primary" :to="{ name: 'show-questionnaire-question', params: { resourceKey: question.questionKey } }">
                  Show
                </router-link>
              </td>
              <td v-if="!versionActive">
                <router-link class="btn mat btn-success" :to="{ name: 'edit-questionnaire-question', params: { resourceKey: question.questionKey } }">
                  Edit
                </router-link>
              </td>
              <td v-if="!versionActive">
                <button class="btn mat btn-danger" @click="deleteQuestion(question.questionKey)">Delete</button>
              </td>
            </tr>
          </draggable>
        </table>

      </div>

    </div>
  </div>
</template>
<script>
import draggable from 'vuedraggable'

export default {

  name: 'entry-questionnaire-list',

  props: {
    versionKey: {
      required: true
    }
  },

  data: () => ({
    questions: []
  }),

  created() {
    this.getQuestions()
    .then( questions => this.questions = questions )
  },

  components: {
    draggable
  },

  methods: {

    getQuestions() {
      return this.$store.dispatch('questionnaire/FETCH_ALL', { FK_versionKey: this.versionKey })
    },

    deleteQuestion(questionKey) {
        this.$store.dispatch('questionnaire/DELETE_RESOURCE', questionKey)
        .then( () => this.questions = this.questions.filter( el => el.questionKey !== questionKey ) )
    },

    sortQuestions({ oldIndex, newIndex }) {

			let questionsToUpdate = null
			let question = this.questions[oldIndex]
			question.sort = newIndex + 1

			if( newIndex < oldIndex ) {
				questionsToUpdate = this.questions.slice(newIndex, oldIndex + 1).filter( el => el.questionKey !== question.questionKey )
				.map( (el, idx) => {
					el.sort = (newIndex + 2 + idx)
					return { questionKey: el.questionKey, sort: el.sort }
				})
			} else if( newIndex > oldIndex ) {
				let questionsToChange = this.questions.slice(oldIndex, newIndex + 1).filter( el => el.questionKey !== question.questionKey )
				questionsToUpdate = questionsToChange.reverse().map( (el, idx) => {
					el.sort = newIndex - idx
					return { questionKey: el.questionKey, sort: el.sort }
				})
			}

			questionsToUpdate.push({ questionKey: question.questionKey, sort: question.sort })

			this.saveOrder(questionsToUpdate)

		},

    saveOrder(questionsToUpdate) {

      $.ajax({
        url: '/capsiminbox/admin/api/entry-questions/save-order',
        method: 'post',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ questionsToUpdate })
      })
      .done( result => console.log(result) )
      .fail( err => console.log(err) )
    },
  },

  computed: {
    questionsToSort: {
      get() {
        return this.questions.sort( (e1, e2) => (e1.sort < e2.sort) ? -1 : (e1.sort > e2.sort) ? 1 : 0 )
      },
      set(val) {

      }
    }
  }
}
</script>
