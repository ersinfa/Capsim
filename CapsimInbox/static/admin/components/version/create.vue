<template>
  <div id="create-version">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          Create Assessment
        </h2>
      </div>
      <div class="panel-body">
        <div class="col-md-12">
          <p>
            Welcome to the Assessment Builder! This tool will help you create custom assessments measuring any topic, using the CapsimInbox model as a template. To get started, name your module. On the following pages, you will be walked through each step of building your assessment.
          </p>
        </div>
        <div class="col-md-6 col-sm-12">
          <form>
            <div class="form-group">
              <label for="name">Name</label>
              <input id="name" class="form-control" type="text" v-model="versionName">
            </div>
            <div class="clearfix"></div>
            <button @click.prevent="createVersion" class="btn mat btn-primary">Create</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {

  name: 'create-version',

  data: () => ({
    versionName: '',
    isActive: 0
  }),

  methods: {
    createVersion() {

      const payload = {
        versionName: this.versionName,
        isActive: 0
      }

      this.$store.dispatch('version/CREATE_RESOURCE', payload)
      .then( version => this.$router.push({ name: 'edit-version', params: { resourceKey: version.versionKey } }) )
      .catch( err => alert( 'There was a problem while processing your request.' ) )
    }
  }
}
</script>
