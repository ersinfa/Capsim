<template>
    <div id="capsim-student-file-dashboard">
        <h1>Submission Status</h1>  
        <div class="panel panel-default"> 
            <div class="panel-body">
                <template v-if="files.length > 0"> 
                    <table class="table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>File Description</th>
                                    <th>Upload Date</th>
                                    <th>Grade</th>
                                    <th>Round</th>
                                    <th>Professor Comments</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <template>
                                    <tr v-for="file in files">
                                        <td>{{file.fileStatus.description}}</td>
                                        <td>{{file.displayName}}</td>                         
                                        <td>{{file.fileUploadDate.slice(0, 10)}}</td>
                                        <td v-if="file.grade != undefined" >{{file.grade}} / 100</td>
                                        <td v-else></td>
                                        <td>{{file.FK_cycleKey}}</td>
                                        <td>{{file.professorComments}}</td>
                                        <td>
                                            <a :href="`${assetsPath}/capsiminbox/pdfs/${file.fileName}`" target="_blank">
                                                <button class="btn mat btn-success">
                                                    View
                                                </button>
                                            </a>
                                            <button 
                                                v-if="file.fileStatus.fileStatusKey == 1" 
                                                @click="deleteFile(file._pivot_FK_userFileKey)" 
                                                class="btn mat btn-danger">
                                                Delete
                                            </button>
                                        </td>                         
                                    </tr>
                                </template>
                            </tbody>    
                    </table>
                </template>
                <template v-else>
                    <h4>No files to display</h4>
                </template>    
            </div>
        </div>
        <Upload v-if="files.length <= 10"></Upload>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import Upload from './Upload.vue'

export default {

    components: {
        Upload
    },

    name: 'File-Dashboard',
  
    beforeRouteEnter(to, from, next) {
        next( vm => { 
            vm.$store.dispatch('GET_FILES')
            // vm.$store.dispatch('GET_ASSESSMENTS')
        })
    },

    methods: {
        deleteFile(fileKey) {
            $.ajax({
                url: `/capsiminbox/student/delete-file/${ fileKey }`,
                method: 'delete',
                dataType: 'json'
            })
            .done( () => this.$store.dispatch('GET_FILES') )
            .catch( () => alert('Error while deleting file') )
        },
    },

    computed: {
        ...mapState({
            session: state => state.session,
            files: state => state.allFiles,
            assetsPath: state => state.assetsPath,
            // versionSettings: ((state) => {
            //     if (Array.isArray(state.allAssessments) && state.allAssessments.length > 0) return state.allAssessments.filter((item) => state.session.simID == item.simID )[0].versionSettings
            // })
        }),
        
    }    
}
</script>

<style lang="scss" scoped>

</style>