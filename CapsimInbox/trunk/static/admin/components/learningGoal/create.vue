<template>
  <div id="learningGoal-index">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          Create New Learning Goal
        </h2>
      </div>
      <div class="panel-body">
		<p>
			Set the learning goals on which participants will be assessed. Most assessments measure 5 learning goals. Participants will complete a self-assessment on these measures before they begin your assessment.
		</p>
        <form>
          <div class="form-group">
            <label for="name">Name: </label>
            <input id="name" class="form-control" type="text" v-model="learningGoal.name">
          </div>
          <div class="form-group">
            <label for="description">Description: </label>
            <textarea rows="4" id="description" class="form-control" type="text" v-model="learningGoal.description">
            </textarea>
          </div>


          <button @click.prevent="createlearningGoal" class="btn mat btn-primary">Create learningGoal</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
export default {

  name: "create-learningGoal",

  data() {
    return {
      FK_versionKey: this.$route.query.versionKey,
      learningGoal: {
          name: '',
          description: ''
      }
    }
  },

  methods: {

    createlearningGoal() {

      let payload = {
        FK_versionKey: this.FK_versionKey,
        name: this.learningGoal.name,
        description: this.learningGoal.description
      }

      let routeTo = { name: 'edit-version', params: { resourceKey: this.FK_versionKey }, hash: '#learningGoals' }

      this.$store.dispatch('learningGoal/CREATE_RESOURCE', payload)
      .then( () => this.$router.push(routeTo) )
    }
  }
}
</script>
