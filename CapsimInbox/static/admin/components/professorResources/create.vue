<template>
  <div id="create-drive">
      <div class="panel panel-default">
          
          <div class="panel-heading">
            <h2>
              <back-button></back-button>
              Professor Resources
            </h2>
          </div>
          <div class="panel-body">
              <h3>Files</h3>
              <table class="table">
							<thead>
								<tr>
									<th>Name</th>
								</tr>
							</thead>
							<tbody>
                 <file @deleteFile="deleteFile" @updateFile="updateFile" :show-only="false" v-for="file in professorResources" :file="file.file" :fileTypes="fileTypes"></file>
							</tbody>
						</table>

              <h3>Add File</h3>
              <div class="form-group">
                  <label for="name">Name</label>
                  <input v-model="newFile.displayName" type="text" class="form-control">
              </div>
              <div class="form-group">
                  <label for="file-type">File Type</label>
                  <select v-model="newFile.FK_fileTypeKey" class="form-control">
                      <option :value="fileType.fileTypeKey" v-for="fileType in fileTypes"> {{ fileType.name }} </option>
                  </select>
              </div>
               <div v-if="newFile.FK_fileTypeKey == 2" class="form-group">
                  <label for="video-url">Video URL:</label>
                  <input class="form-control" type="text" v-model="newFile.fileName">
              </div>
              <div v-else class="form-group">
                  <label for="input-file">File input</label>
                  <input @change="handleFile($event.target.files)" type="file" id="input-file">
              </div>
              <div class="form-group">
                  <button @click="uploadFile" class="btn mat btn-primary">Upload File</button>
              </div> 
          </div>
          </div>
      </div>
  </div>
</template>
<script>
export default {

  name: "create-professor-resources",

  data() {
    return {
        versionKey: this.$route.query.versionKey,
        fileTypes: [],
        professorResources: [],
        newFile: {
          FK_fileTypeKey: 0
        }
    }
  },
   created() {

      this.getFileTypes()
      .then( fileTypes => this.fileTypes = fileTypes )
      .then( () => this.$store.dispatch('professorResources/GET_RESOURCE', this.versionKey) )
      .then( professorResources => this.$set(this, 'professorResources', professorResources) )
      .catch( err => console.log(err) )
    },

    components: {
      file: require('./file.vue')
    },

  methods: {

      handleFile( files ) {
        this.newFile.fileFormat = files[0].name.match(/\.[0-9a-z]+$/i)
        const reader = new FileReader()
        reader.onload = ( e ) => this.newFile.file = e.target.result.split(',')[1]
        reader.readAsDataURL(files[0])
      },
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
        },
      
        deleteFile(fileKey) {
            console.log(fileKey)
            $.ajax({
                url: `/capsiminbox/admin/api/professor-resources/`,
                method: 'delete',
                data: {
                    "fileKey":fileKey,
                    "FK_versionKey": this.versionKey
                },
                dataType: 'json'
            })
            .done( () => this.professorResources = this.professorResources.filter( file => file.FK_fileKey !== fileKey ) )
            .catch( () => alert('Error while deleting file') )
        },

        updateFile(fileKey) {
            let file = this.professorResources.find( file => file.FK_fileKey == fileKey ).file
            delete file.FK_fileType
            delete file.fileKey
            $.ajax({
                url: `/capsiminbox/admin/api/professor-resources/${fileKey}`,
                method: 'put',
                data: JSON.stringify({
                    ...file
                }),
                contentType: 'application/json',
                dataType: 'json'
            })
            .done( () => alert('File updated') )
            .catch( () => alert('Error while updating file') )
        },

        uploadFile() {
            $.ajax({
                url: '/capsiminbox/admin/api/professor-resources/',
                method: 'post',
                data: JSON.stringify({
                    ...this.newFile,
                    FK_versionKey: this.versionKey
                }),
                dataType: 'json',
                contentType: 'application/json'
            })
            .done( newFile => this.handleSuccessUpload(newFile) )
            .catch( err => alert("Error while uploading the file") )
        },

        handleSuccessUpload(newFile) {
            this.professorResources.push({file:newFile,FK_versionKey:this.versionKey,FK_fileKey:newFile.fileKey})
            this.newFile = {
                FK_versionKey: this.versionKey
            }
        }
  }
}
</script>
