<template>
    <div id="show-question">

        <div  v-if="question.hasOwnProperty('questionKey')" class="panel panel-default">
            <div class="panel-heading">
                <h2>
                  <back-button></back-button>
                  {{ question.subjectTagKey }}
                </h2>
            </div>

            <div class="panel-body">

              <question-form 
                @addAuthor="addAuthor" 
                :version-key="versionKey" 
                :authors="authors" 
                :question="question" 
                :answerDependencies="answerDependencies" 
                :deleteAnswerKey="deleteAnswerKey"
                :addAnswerKey="addAnswerKey">
               </question-form>

              <div class="mt-20">
                <button class="btn mat btn-primary pl-15" @click.prevent="updateQuestion">Update Question</button>
              </div>

              <div>

              <div class="page-header">
                <h3>Files (Attachments)</h3>
              </div>
              <table class="table">
							<thead>
								<tr>
									<th>Name</th>
								</tr>
							</thead>
							<tbody>
                 <file @deleteFile="deleteFile" @updateFile="updateFile" :show-only="false" v-for="file in questionFiles" :file="file.file" :fileTypes="fileTypes"></file>
							</tbody>
						</table>
            <div class="page-header">
              <h3>Add File (Attachment)</h3>
            </div>
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
         
                    <div class="page-header" v-if="question.isWrittenResponse == 0">
                    <h3>Responses</h3>
                    </div>

                    <table class="table mb-40" v-if="question.isWrittenResponse == 0">
                    <thead>
                        <tr>
                        <th>Response Key</th>
                        <th>Description</th>
                        <th colspan="2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="answer in question.answers">
                        <td>{{ answer.answerKey }}</td>
                        <td>{{ answer.nameTagKey }}</td>
                        <td><router-link class="btn mat btn-primary" :to="{ name: 'show-answer', params: { resourceKey: answer.answerKey, edittable: true } }">Show</router-link></td>
                        <td><button @click="deleteAnswer(answer.answerKey)" class="btn mat btn-danger">Delete</button></td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                <answer @answerCreated="addAnswer" :version-key="versionKey" :question-key="question.questionKey" v-if="question.isWrittenResponse == 0"></answer>

            </div>
        </div>
    </div>
</template>
<script>
export default {

    name: "edit-question",

    props: {
        resourceKey: {
            required: true
        }
    },

    components: {
        answer: require('../answer/create.vue'),
        questionForm: require('./form.vue'),
        file: require('./file.vue')
    },

    data() {
      return {
        question: {
          FK_questionDisplayTypeKey: 1,
          FK_questionTypeKey: 1,
          subjectTagKey: '',
          descriptionTagKey: '',
          FK_authorKey: 0,
          timer: 0,
          isImportant: 0,
          dependsOn: null,
          maxAnswerCount: null,
          sequence: 0,
          isWrittenResponse: '',
          dependsOn_answerKeyArray: ''
        },
        authors: [],
        html: '',
        fileTypes: [],
        isReEntry: null,
        questionFiles: [],
        answerKeyArray: [],
        answerDependencies: [],
        newFile: {
          FK_questionKey: this.resourceKey,
          FK_fileTypeKey: 0
        }
      }
    },

    created() {
        this.getQuestion()
        .then( question => this.setQuestion(question) )
        .then( () => this.getAnswerKeys() )
        .then( () => this.getAuthors() )
        .then(() => this.getFileTypes() )
        .then( fileTypes => this.fileTypes = fileTypes )
        .then( () => this.getQuestionFiles() )
        .then( questionFiles => this.questionFiles = questionFiles )
        .catch( err => console.log(err) )
    },

    //disabling because this is broken: need to map version from state and use it instead of resource key
    // mounted(){
    //     return this.$store.dispatch('version/GET_RESOURCE', this.resourceKey)
    //     .then( version => { this.$set(this, 'isReEntry', version.versionConfigJson.reEntry) })
    // },

    computed: {
        timer: {
            get() {
                return this.question.timer/60000
            },
            set(val) {
                this.question.timer = val * 60000
            }
        },

        versionKey() {
          return this.question.questionToVersion.FK_versionKey
        },
    },

    methods: {

        addAnswer(answer) {
          this.question.answers.push(answer) 
        },

        addAuthor(author) {
            this.authors.push(author)
        },

        getAnswerKeys(){
            this.$store.dispatch('dependsOn/GET_RESOURCE', this.question.questionKey)
            .then(answerDependencies => this.answerDependencies = answerDependencies )
        },

        addAnswerKey(answerKey){
           this.$store.dispatch('dependsOn/CREATE_RESOURCE', {FK_questionKey: this.question.questionKey, FK_answerKey: answerKey})
           .then(() => this.getAnswerKeys() ) 
           
        },

        deleteAnswerKey(FK_questionKey, FK_answerKey){
             $.ajax({
                url: '/capsiminbox/admin/api/dependsOn',  
                method: 'delete',
                data: {
                    FK_questionKey,
                    FK_answerKey
                },
                dataType: 'json'
            })
            .done( () => this.getAnswerKeys() )
            .fail( err => console.log(err) )
        },

        deleteAnswer( answerKey ) {
          this.$store.dispatch('answer/DELETE_RESOURCE', answerKey)
          .then( () => this.question.answers = this.question.answers.filter( answer => answer.answerKey !== answerKey ) )
        },

        setQuestion( question ) {
			       this.question = question 
            return question
        },

        getAuthors( versionKey ) {
            $.ajax({
                url: '/capsiminbox/admin/api/authors',  
                method: 'get',
                data: {
                    FK_versionKey: this.versionKey
                },
                dataType: 'json'
            })
            .done( authors => this.authors = authors )
            .fail( err => console.log(err) )
        },

        getQuestion() {
          return this.$store.dispatch('question/GET_RESOURCE', this.resourceKey)
        },

        updateQuestion() {
            
          let payload = {
            FK_questionDisplayTypeKey: this.question.FK_questionDisplayTypeKey,
            FK_questionTypeKey: this.question.FK_questionTypeKey,
            FK_authorKey: this.question.FK_authorKey,
            isImportant: Number(this.question.isImportant),
            subjectTagKey: this.question.subjectTagKey,
            descriptionTagKey: this.question.descriptionTagKey,
            timer: this.question.timer,
            sequence: this.question.sequence,
            isWrittenResponse: this.question.isWrittenResponse,
            isSmartThreading: this.question.isSmartThreading,
            failsafe: this.question.failsafe,
            triggeredInCycle: this.question.triggeredInCycle,
			maxAnswerCount: this.question.maxAnswerCount          }

          this.$store.dispatch('question/SAVE_RESOURCE', { payload, resourceKey: this.resourceKey })
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

        getQuestionFiles() {
          return new Promise( (resolve, reject) => {
            $.ajax({
              url: `/capsiminbox/admin/api/files/fileToQuestion/${this.resourceKey}`,
              method: 'get',
              dataType: 'json'
            })
            .done( questionFiles => resolve(questionFiles)  )
            .catch( err => reject(err) )
          })
        },

        deleteFile(fileKey) {
            $.ajax({
                url: `/capsiminbox/admin/api/files/fileToQuestion/${ fileKey }`,
                method: 'delete',
                dataType: 'json'
            })
            .done( () => this.questionFiles = this.questionFiles.filter( file => file.FK_fileKey !== fileKey ) )
            .catch( () => alert('Error while deleting file') )
        },
      
        updateFile(fileKey) {
            let file = this.questionFiles.find( file => file.FK_fileKey == fileKey ).file
            delete file.FK_fileType
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
                url: '/capsiminbox/admin/api/files/fileToQuestion',
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
            this.questionFiles.push({file:newFile,FK_versionKey:this.versionKey,FK_fileKey:newFile.fileKey})
            this.newFile = {
                FK_versionKey: this.versionKey
            }
        }

    }

}
</script>
