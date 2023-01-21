<template>
  <div id="sim-admin">
      <div class="panel panel-default">
          <div class="panel-heading">
              <h2>Change Sim Version</h2>
          </div>
          <div class="panel-body">
              <form class="col-md-4">
                  <p v-if="errorMessage" class="text-danger">
                      {{ errorMessage }}
                  </p>
                  <div class="form-group">
                      <label for="simID">Sim ID: </label>
                      <input v-model="simId" class="form-control" type="text">
                  </div>
                  <div class="form-group">
                      <label for="version-key">Version: </label>
                      <select v-model="versionKey" class="form-control">
                          <option v-for="version in versions" :value="version.versionKey">{{ version.versionName }}</option>
                      </select>
                  </div>
                  <button @click.prevent="changeVersion" class="btn mat btn-primary">Change Version</button>
              </form>
          </div>
      </div>
  </div>
</template>
<script>
export default {

  name: "sim-admin",

  data: () => ({
     versions: [],
     simId: '',
     versionKey: null,
     errorMessage: null
  }),

  created() {
    this.getVersions()
  },

  methods: {

      changeVersion( simId, versionKey ) {

          this.errorMessage = null

          $.ajax({
              url: '/capsiminbox/admin/api/remote/change-version',
              method: 'post',
              data: {
                  simId: this.simId,
                  versionKey: this.versionKey
              },
              dataType: 'json'
          })
          .done( data => {
            this.$store.dispatch('NOTIFY', {
              message: 'Sim successfully updated',
              isWarning: false
            })
          })
          .fail( err => {
            this.$store.dispatch('NOTIFY', {
              message: err.responseJSON.message,
              isWarning: true
            })
          })
      },

      getVersions() {
          $.ajax({
              url: '/capsiminbox/admin/api/versions',
              method:  'get',
              dataType: 'json'
          })
          .done( versions => this.$set(this, 'versions', versions) )
          .catch( err => console.log(err) )
      }
  }

}
</script>
