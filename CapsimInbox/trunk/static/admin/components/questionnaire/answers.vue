<template>
  <div id="entry-answers">

    <table class="table">
        <thead>
          <th>Order</th>
          <th>Answer</th>
          <th colspan="2">Actions</th>
        </thead>
        <draggable @sort="sortAnswers" :list="answersToSort" :element="'tbody'">
          <tr v-for="answer in answers" :key="answer.answerKey">
            <td>{{ answer.sort }}</td>
            <td>{{ answer.nameTagKey }}</td>
            <td><button @click="answerToEdit = answer" class="btn btn-primary mat">Edit</button></td>
            <td><button @click="deleteAnswer(answer.answerKey)" class="btn btn-danger mat">Delete</button></td>
          </tr>
        </draggable>
    </table>

    <div v-if="answerToEdit">
      <custom-input v-model="answerToEdit.nameTagKey" :id="'edit-answer'" :label="'Edit Answer:'"></custom-input>
      <div>
        <button @click="updateAnswer" class="btn btn-success mat">Update Answer</button>
        <button @click="answerToEdit = null" class="btn btn-success mat">Cancel</button>
      </div>
    </div>

    <div v-else>
      <custom-input v-model="newAnswer" :id="'new-answer'" :label="'New Answer:'"></custom-input>
      <button @click="addAnswer" class="btn btn-success mat">Create Answer</button>
    </div>

  </div>
</template>
<script>
import draggable from 'vuedraggable'

export default {

  name: 'entry-answers',

  props: {

    answers: {
      type: Array,
      required: true,
       default: () => ([])
    },

    questionKey: {
      required: true
    }
  },

  components: {
    draggable
  },

  data() {
    return {
      answerToEdit: null,
      newAnswer: ''
    }
  },

  methods: {

    deleteAnswer(answerKey) {
      this.$store.dispatch('questionnaire/DELETE_ANSWER', answerKey)
      .then( () => this.$emit('update:answers', this.answers.filter( e => e.answerKey !== answerKey )) )
    },

    addAnswer() {

      let payload = {
        nameTagKey: this.newAnswer,
        FK_questionKey: this.questionKey,
        sort: this.answers.length + 1
      }

      this.$store.dispatch('questionnaire/CREATE_ANSWER', payload)
      .then( answer => this.$emit('update:answers', this.answers.concat(answer)) )
      .then( () => this.newAnswer = '' )
    },

    updateAnswer() {

      let payload = {
        nameTagKey: this.answerToEdit.nameTagKey
      }

      this.$store.dispatch('questionnaire/SAVE_ANSWER', { payload, resourceKey: this.answerToEdit.answerKey })
      .then( () => this.answerToEdit = null )
    },

    sortAnswers({ oldIndex, newIndex }) {

			let answersToUpdate = null
			let answer = this.answers[oldIndex]
			answer.sort = newIndex + 1

			if( newIndex < oldIndex ) {
				answersToUpdate = this.answers.slice(newIndex, oldIndex + 1)
        .filter( el => el.answerKey !== answer.answerKey )
				.map( (el, idx) => {
					el.sort = (newIndex + 2 + idx)
					return { answerKey: el.answerKey, sort: el.sort }
				})
			} else if( newIndex > oldIndex ) {
				answersToUpdate = this.answers.slice(oldIndex, newIndex + 1)
        .filter( el => el.answerKey !== answer.answerKey )
				.reverse().map( (el, idx) => {
					el.sort = newIndex - idx
					return { answerKey: el.answerKey, sort: el.sort }
				})
			}

			answersToUpdate.push({ answerKey: answer.answerKey, sort: answer.sort })

			this.saveOrder(answersToUpdate)

		},

    saveOrder(answersToUpdate) {

      $.ajax({
        url: '/capsiminbox/admin/api/entry-answers/save-order',
        method: 'post',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ answersToUpdate })
      })
      .done( result => console.log(result) )
      .fail( err => console.log(err) )
    }
  },

  computed: {

    answersToSort: {

      get() {
        return this.answers.sort( (e1, e2) => (e1.sort < e2.sort) ? -1 : (e1.sort > e2.sort) ? 1 : 0 )
      },

      set(val) {}
    }
  }

}
</script>
