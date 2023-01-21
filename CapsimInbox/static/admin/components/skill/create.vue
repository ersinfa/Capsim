<template>
  <div id="skill-index">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          Create New Skill
        </h2>
      </div>
      <div class="panel-body">
		<p>
			Set the skills on which participants will be assessed. Most assessments measure 5 skills. Participants will complete a self-assessment on these measures before they begin your assessment.
		</p>
        <form>
          <div class="form-group">
            <label for="name">Name: </label>
            <input id="name" class="form-control" type="text" v-model="skill.name">
          </div>
          <div class="form-group">
            <label for="description">Description: </label>
            <textarea rows="4" id="description" class="form-control" type="text" v-model="skill.description">
            </textarea>
          </div>

          <div class="form-group">
            <label for="developmental-tactic">Developmental Tactic (optional): </label>
			<p>What can participants do to improve on this skill? This will be presented to participants in the Individual Development Plan following the assessment.</p>
            <wysiwyg id="developmental-tactic" v-model="skill.developmentalTactic"></wysiwyg>
          </div>

          <button @click.prevent="createSkill" class="btn mat btn-primary">Create Skill</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
export default {

  name: "create-skill",

  data() {
    return {
      FK_versionKey: this.$route.query.versionKey,
      skill: {
          name: '',
          description: '',
          developmentalTactic: ''
      }
    }
  },

  methods: {

    createSkill() {

      let payload = {
        FK_versionKey: this.FK_versionKey,
        name: this.skill.name,
        description: this.skill.description,
        developmentalTactic: this.skill.developmentalTactic
      }

      let routeTo = { name: 'edit-version', params: { resourceKey: this.FK_versionKey }, hash: '#skills' }

      this.$store.dispatch('skill/CREATE_RESOURCE', payload)
      .then( () => this.$router.push(routeTo) )
    }
  }
}
</script>
