<template>
  <div id="create-drive">
      <div class="panel panel-default">
          <div class="panel-heading">
              <h2>
                <back-button></back-button>
                Create Drive Folder
              </h2>
          </div>
          <div class="panel-body">
            <p>Create a folder for your attachments within the Drive Files that participants can select to view any related company information. Drive Files can be seen by participants on the left side of the email interface.</p>
              <div class="form-group">
                  <label for="name">Name</label>
                  <input v-model="name" type="text" class="form-control">
              </div>
              <div class="form-group">
                  <button @click="createFolder" class="btn mat btn-primary">Create</button>
              </div>
          </div>
      </div>
  </div>
</template>
<script>
export default {

  name: "create-drive",

  data() {
    return {
        name: '',
        versionKey: this.$route.query.versionKey
    }
  },

  methods: {

      createFolder() {

          let payload = {
            name: this.name,
            FK_versionKey: this.versionKey
          }

          this.$store.dispatch('folder/CREATE_RESOURCE', payload)
          .then( folder => this.$router.push({ name: 'edit-folder', params: { resourceKey: folder.fileFolderKey } }) )
          .catch( () => alert('Error while creating your Folder') )
      },

  }
}
</script>
