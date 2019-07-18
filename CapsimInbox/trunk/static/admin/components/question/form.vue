<template>
  <div id="question-form">

    <modal id="author-modal" @confirm="createAuthor" :confirm-text="'Create'" :show-close="false">
      <h4 slot="title">Create Author</h4>
      <form slot="body">
        <p v-if="authorHasErrors" class="text-danger">Please complete all fields before creating the author.</p>
        <custom-input v-model="author.nameTagKey" :label="'Name:'" :id="'name'"></custom-input>
        <custom-input v-model="author.title" :label="'Title:'" :id="'title'"></custom-input>
      </form>
    </modal>

    <form>

      <div class="form-group mb-10">
        <label for="display-type">Email or Message? </label>
        <select class="form-control w-20" v-model.number="question.FK_questionDisplayTypeKey">
          <option value="1">Email</option>
          <option value="2">Message</option>
        </select>
      </div>

      <div class="form-group mb-10">
        <label for="answer-type">Answer Type: Multiple Choice or Written? </label>
        <select class="form-control w-20" v-model.number="question.isWrittenResponse">
          <option value="0">Multiple Choice</option>
          <option value="1">Written</option>
        </select>
      </div>
      <div class="row">
        <div class='col-md-6'>
          <div class="form-group mb-10">
            <label for="question-type">Single or Multi answer question? (Multi answer not supported for written answers) </label>
            <select class="form-control w-40" v-model.number="question.FK_questionTypeKey">
              <option value="1">Single answer</option>
              <option v-if="question.isWrittenResponse == 0" value="2">Multi answer</option>
            </select>
          </div>
        </div>
        <div class='col-md-6'>
          <div class="form-group mb-10">
            <label for="answer-type">Maximum Answer Selection</label>
            <select class="form-control w-40" v-model="question.maxAnswerCount">
              <option value="0">Default</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="question.FK_questionDisplayTypeKey == 1" class="form-group">
        <label for="subject">Subject: </label>
        <p>Not required for messages.</p>
        <input class="form-control w-80" type="text" v-model="question.subjectTagKey">
      </div>

      <div class="form-inline mb-10">
        <div class="form-group w-100">
          <label for="author">Author: </label>
          <div class="clearfix"></div>
          <select v-model="question.FK_authorKey" class="form-control w-50" id="author">
            <option v-for="author in authors" :value="author.authorKey">
              {{ author.nameTagKey }} - {{ author.title }}
            </option>
          </select>
          <button @click.prevent="showAddAuthor" class="btn mat btn-primary">Add Author</button>
        </div>
      </div>

      <div class="form-group mb-20">
        <label class="mr-10" for="important">Priority Email: </label>
        <switcher class="mt-10" :selected="question.isImportant" v-model="question.isImportant"></switcher>
        <p>If marked as priority, this email will add to the Priority Bonus.</p>
      </div>

      <div v-if="question.FK_questionDisplayTypeKey == 1" class="form-group mb-20">
        <label for="sequence">Sequence (optional): </label>
        <p>In what order this email will appear.</p>
        <input v-model.number="question.sequence" class="form-control w-20" id="sequence">
      </div>

      <div class="form-group">
        <label for="timer">Timer (optional): </label>
        <p>In minutes, when this email will appear during the assessment. If you want to have an email or message appear during the assessment, enter the time here.</p>
        <input v-model.number="timer" class="form-control w-20" id="timer">
      </div>

      <div>
        <label for="description">Email / Message Body :</label>
        <wysiwyg id="description" v-model="question.descriptionTagKey"></wysiwyg>
      </div>


      <div>
          <br>
          <div v-if='question.questionKey'>
            <label class="mr-10">Email/Message Threading:</label>
              <div class="form-inline">
                <p>Add Answer Key that you would like to trigger this email/message:</p>
                <input id="tree-answer" class="form-control w-20" type="text" v-model.number="responseToAdd">
                <button class="btn mat btn-primary" @click.prevent="addAnswerKey(responseToAdd)">Add</button> 
              </div>
            <br>

            <p v-if="answerDependencies && answerDependencies.length > 1" >Existing Answer Keys that will trigger this email/message:</p>
            <div class="form-inline" style="margin-bottom: 10px" v-for='dependency in answerDependencies'>
                <label style="width: 60px;">{{dependency.FK_answerKey}}</label>
                <button class="btn mat btn-danger" @click.prevent="deleteAnswerKey(dependency.FK_questionKey, dependency.FK_answerKey)">Delete</button>
                <br>
            </div>
          </div>
      </div>


       <div class="form-group mb-20">
        <label class="mr-10" for="important">Smart Threading: </label>
        <switcher class="mt-10" :selected="question.isSmartThreading" v-model="question.isSmartThreading"></switcher>
        <p>If enabled, answers to this email that were selected in other questions will be filtered out.</p>
      </div>

       <div class="form-group mb-20" v-if="question.isSmartThreading">
        <label class="mr-10" for="important">Fail Safe </label>
        <input class="form-control w-20" type="text" v-model="question.failsafe">
        <p>Enter the question key of the corresponding smart threading question that should trigger this email if all of corresponding questions's answers have been picked.</p>
      </div>


      <div class="form-group mb-20">
        <!-- <option class="mt-10" :selected="question.isSmartThreading" v-model="question.isSmartThreading"></option> -->
        <label for="display-type">Cycle Triggered In:</label>
        <p>Used for Re-entry versions, to schedule questions in certain cycles. If no value is selected, email will be triggered in first cycle.</p>
        <select class="form-control w-10" :selected="question.triggeredInCycle" v-model.number="question.triggeredInCycle">
          <option selected value=""></option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>

    </form>
    <hr>
  </div>
</template>
<script>
export default {
  name: 'question-form',
  props: {
    question: {
      type: Object,
      required: true
    },

    versionKey: {
      required: true
    },

    authors: {
      type: Array,
      require: true
    },

    answerDependencies: {
      type: Array,
      require: true
    },

    deleteAnswerKey: {
      type: Function,
      require: true
    },

    addAnswerKey: {
      type: Function,
      require: true
    }
  },

  computed: {
	  timer: {
		  get() {
			  return this.question.timer/60000
		  },
		  set(val) {
			  this.question.timer = val * 60000
		  }
    }
  },

  data() {
    return {
      authorHasErrors: false,
      responseToAdd: '',
      author: {
        nameTagKey: '',
        title: '',
        FK_versionKey: this.versionKey   
      }
    }
  },

  methods: {

    showAddAuthor() {
      $('#author-modal').modal('show')
    },

    createAuthor() {
      this.authorHasErrors = !Object.keys(this.author).every( k => this.author[k] !== '' )

      if(this.authorHasErrors) return

      this.$store.dispatch('author/CREATE_RESOURCE', this.author)
      .then( author => this.$emit('addAuthor', author) )
      .then( () => $('#author-modal').modal('hide') )
      .catch( () => alert('Error while creating the author.') )
    }
  }
}
</script>
