<template>
    <div id="upload-file">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h2>
                  Upload File
                </h2>
            </div>
            <div class="panel-body">
                <div>
                    <div class="form-group">
                        <label for="name">File Name</label>
                        <input v-model="newFile.displayName" class="form-control">
                    </div>
                     <div class="form-group">
                        <label for="input-file">File input</label>
                        <input @change="handleFile($event.target.files)" type="file" id="input-file" ref="input-file">
                    </div>
                    <div class="form-group">
                        <button @click="uploadFile" class="btn mat btn-primary">Upload File</button>
                    </div>
                </div>
            </div>
            <div v-if="nameMissing" class="alert alert-danger" role="alert">Please enter a file description</div>
            <div v-if="fileMissing" class="alert alert-danger" role="alert">Please choose a file to upload</div>
            <div v-if="fileTooLarge" class="alert alert-danger" role="alert">File must be less than 10 MB</div>
            <div v-if="fileTypeIncorrect" class="alert alert-danger" role="alert">File must be a PDF</div>
            <div v-if="fileUploaded" class="alert alert-info" role="alert">File Uploaded!</div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'capsim-student-portal-files',

    data() {
    return { 
        newFile: {
            FK_fileTypeKey: 3,
            FK_fileStatusKey: 1,
            FK_userTypeKey: 1
        },
        nameMissing: false,
        fileMissing: false,
        fileTooLarge: false,
        fileTypeIncorrect: false,
        fileUploaded: false
    }
},


    methods: {
        uploadFile() {
            if(this.$refs["input-file"].files.length == 0){
                this.fileMissing = true
                return
            } else {this.fileMissing = false}
            if(!this.newFile.displayName){
                this.nameMissing = true
                return
            } else {this.nameMissing = false}
            if(this.$refs["input-file"].files[0].size > 10000000 ){
                this.fileTooLarge = true
                return
            } else {this.fileTooLarge = false}
            if(this.$refs["input-file"].files[0].name.slice(-3) != "pdf" ){
                this.fileTypeIncorrect = true
                return
            } else {this.fileTypeIncorrect = false}
            this.nameMissing = false
            this.fileMissing = false
            let cycle =  this.$store.getters.selectedAssessment.cycle
            let file = this.newFile
            file.FK_cycleKey = cycle
            $.ajax({
                url: '/capsiminbox/student/upload-file',
                method: 'post',
                data: JSON.stringify({
                    ...file
                }),
                dataType: 'json',
                contentType: 'application/json'
            })
            .done( newFile => this.handleSuccess(newFile) )
            .catch( err => alert("Error while uploading the file") )  
        },

        handleFile( files ) {
            this.fileUploaded = false
            this.newFile.fileFormat = files[0].name.match(/\.[0-9a-z]+$/i)
            const reader = new FileReader()
            reader.onload = ( e ) => this.newFile.file = e.target.result.split(',')[1]
            reader.readAsDataURL(files[0])
        },

        handleSuccess(newFile) {
            this.$store.dispatch('GET_FILES')
            this.$refs["input-file"].value = ""
            this.newFile.displayName = ""
            this.fileUploaded = true;
        },

        viewFile(){
            console.log(this.$refs["input-file"].files[0])
        }
    }
}   

</script>
