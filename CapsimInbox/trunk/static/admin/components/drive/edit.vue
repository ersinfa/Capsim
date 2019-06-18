<template>
    <div id="drive-edit">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h2>
                  <back-button></back-button>
                  Edit Drive Folder
                </h2>
            </div>
            <div class="panel-body">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input class="form-control" v-model="folder.name" type="text">
                </div>
                <div class="form-group">
                    <button @click="updateFolder" class="btn mat btn-primary" >Update</button>
                </div>

                <hr>

                <div class="page-header">
                    <h3>Files</h3>
                    <p>Upload and create files to be added to Folders created in the Drive. Files can be documents, images or videos.</p>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Timer(Min)</th>
                            <th>Link</th>
                            <th colspan="2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <file @deleteFile="deleteFile" @updateFile="updateFile" :show-only="false" v-for="file in folder.fileToFileFolder" :file="file.file" :fileTypes="fileTypes"></file>
                        <!-- <file @deleteFile="deleteFile" @updateFile="updateFile" :show-only="false" v-for="file in folder.files" :file="file" :fileTypes="fileTypes"></file> -->
                    </tbody>
                </table>

                <hr>

                <h3>Add File</h3>
                <div>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input v-model="newFile.displayName" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="file-type">File Type</label>
                        <select v-model="newFile.FK_fileTypeKey" class="form-control">
                            <option :value="fileType.fileTypeKey" v-for="fileType in fileTypes"> {{ fileType.name }} </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Timer (optional):</label>
                        <p>Set the time you want this file to appear, in the case you want participants to have access after the assessment is already in progress.</p>
                        <input v-model="newFile.timer" class="form-control">
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

    name: "drive-edit",

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
            fileTypes: [],
            newFile: {
                FK_fileFolderKey: this.resourceKey,
                FK_fileTypeKey: 0
            }
        }
    },

    created() {

      this.getFileTypes()
      .then( fileTypes => this.fileTypes = fileTypes )
      .then( () => this.$store.dispatch('folder/GET_RESOURCE', this.resourceKey) )
      .then( folder => this.$set(this, 'folder', folder) )
      .catch( err => console.log(err) )
    },

    methods: {

        updateFolder() {
            $.ajax({
                url: `/capsiminbox/admin/api/folders/${this.folder.fileFolderKey}`,
                method: 'put',
                data: JSON.stringify({
                    name: this.folder.name
                }),
                contentType: 'application/json'
            })
            .done( () => alert('Folder Updated') )
            .fail( err => alert('An error occurred while updating the folder') )
        },

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
            $.ajax({
                url: `/capsiminbox/admin/api/files/${ fileKey }`,
                method: 'delete',
                dataType: 'json'
            })
            .done( () => this.folder.fileToFileFolder = this.folder.fileToFileFolder.filter( file => file.FK_fileKey !== fileKey ) )
            .catch( () => alert('Error while deleting file') )
        },

        updateFile(fileKey) {
            let file = this.folder.fileToFileFolder.find( file => file.FK_fileKey == fileKey ).file
            delete file.fileType
            delete file.fileKey
            $.ajax({
                url: `/capsiminbox/admin/api/files/${fileKey}`,
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
                url: '/capsiminbox/admin/api/files',
                method: 'post',
                data: JSON.stringify({
                    ...this.newFile,
                    FK_versionKey: this.folder.FK_versionKey
                }),
                dataType: 'json',
                contentType: 'application/json'
            })
            .done( newFile => this.handleSuccessUpload(newFile) )
            .catch( err => alert("Error while uploading the file") )
        },

        handleSuccessUpload(newFile) {
            this.folder.fileToFileFolder.push({file:newFile,FK_fileFolderKey:this.resourceKey,FK_fileKey:newFile.fileKey})
            this.newFile = {
                FK_fileFolderKey: this.resourceKey
            }
        }

    }
}
</script>
