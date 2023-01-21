<template>
  <div id="drive-show">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          Drive Folder: {{ folder.name }}
        </h2>
      </div>
      <div class="panel-body">


        <div class="page-header">
          <h3>Files</h3>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Timer(Min)</th>
              <th>Sequence</th>
              <th>Link</th>
              <th colspan="2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <file :show-only="true" v-for="file in folder.fileToFileFolder" :file="file.file" :fileTypes="fileTypes"></file>
            <!-- <file :show-only="true" v-for="file in folder.files" :file="file" :fileTypes="fileTypes"></file> -->
          </tbody>
        </table>

      </div>
    </div>
  </div>
</template>
<script>
export default {

  name: "drive-show",

  props: {
    resourceKey: {
      required: true
    }
  },

  components: {
    file: require('./file.vue')
  },

  data() {
    return {
      folder: {},
      fileTypes: []
    }
  },

  created() {

    this.getFileTypes()
    .then( fileTypes => this.fileTypes = fileTypes )
    .then( () => this.$store.dispatch('folder/GET_RESOURCE', this.resourceKey) )
    .then( folder => this.$set(this, 'folder', folder) )
    .catch( () => alert('Error while processing your request') )
  },

  methods: {

    getFileTypes() {

      return new Promise( (resolve, reject) => {
        $.ajax({
          url: '/capsiminbox/admin/api/folders/get/file-types',
          method: 'get',
          dataType: 'json'
        })
        .done( fileTypes => resolve(fileTypes) )
        .catch( err => reject(err) )
      })
    }
  }
}
</script>
