<template>
  <div id="competency-index">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          Create New Competency
        </h2>
      </div>
      <div class="panel-body">
		<p>
			Create an additional skill or competency to assess participants. These will not be self-assessed prior to the actual assessment.
		</p>
        <form>
          <div class="form-group">
            <label for="name">Name</label>
            <input id="name" class="form-control" type="text" v-model="competency.name">
          </div>

          <button @click.prevent="createCompetency" class="btn mat btn-primary">Create Competency</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script>

export default {

  name: "create-competency",

  data() {
    return {
      FK_versionKey: this.$route.query.versionKey,
      competency: {
          name: '',
          description: '',
          developmentalTactic: ''
      }
    }
  },

  methods: {

    createCompetency() {

      let payload = {
        FK_versionKey: this.FK_versionKey,
        name: this.competency.name
      }

      let routeTo = { name: 'edit-version', params: { resourceKey: this.FK_versionKey }, hash: '#competencies' }

      this.$store.dispatch('competency/CREATE_RESOURCE', payload)
      .then( () => this.$router.push(routeTo) )
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
