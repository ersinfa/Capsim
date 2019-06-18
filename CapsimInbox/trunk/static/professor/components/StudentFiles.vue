<template>
    <div id="capsim-student-file-dashboard">
        <h1>Submission Status</h1>  
        <div class="panel panel-default"> 
            <div class="panel-body">
                <template v-if="files.length > 0"> 
                    <table class="table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Submission File</th>
                                    <th>Upload Date</th>
                                    <th>Round</th>
                                    <th>Submission Status</th>
                                    <th>Grade (1 - 100)</th>
                                    <th>Professor Comments</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="(file, i) in files">
                                     <tr>
                                        <td>{{studentName}}</td>
                                        <td><a :href="`${assetsPath}/capsiminbox/pdfs/${file.fileName}`" target="_blank">{{file.displayName}}</a></td>                         
                                        <td>{{file.fileUploadDate.slice(0, 10)}}</td> 
                                        <td>{{file.FK_cycleKey}}</td>
                                        <template v-if="submittedStatuses[i]==1">
                                                <td>
                                                    <select  class="form-control" v-model="file.FK_fileStatusKey">
                                                        <option :value=2>Approve</option>
                                                        <option :value=3>Reject</option>
                                                    </select>
                                                </td>
                                                <td><input  style="max-width: 70px; margin-left:10px;" class="form-control" type="number" v-model="file.grade[0]" value='file.grade[0]' ></td>
                                                <td><textarea class="form-control" type="text" v-model="file.professorComments" value='file.professorComments'></textarea></td> 
                                                <td>
                                                    <button @click.prevent="submit(i)" class="btn mat btn-success ml-20" >
                                                        <span class="glyphicon"></span>
                                                        Submit
                                                    </button>
                                                </td>
                                                <Modal :id="`Modal-${i}`" :key="i" @confirm="handleModalConfirm(i, file.userFileKey)" confirmText="Yes" closeText="No" confirmClass="btn-success" closeClass="btn-danger">
                                                    <div slot="body">
                                                        Are you sure you want to {{file.FK_fileStatusKey == 2 ? "Approve " : "Reject "}} this submission?
                                                    </div>    
                                                </Modal>           
                                        </template> 
                                        <template v-else>
                                            <td>{{file.FK_fileStatusKey == 2 ? "Approved" : "Rejected" }}</td>    
                                            <td>{{file.grade[0]}}</td>                         
                                            <td>{{file.professorComments}}</td>
                                            <td>
                                                <button @click.prevent="edit(i, file.userFileKey)" class="btn mat btn-primary ml-20" >
                                                    <span class="glyphicon"></span>Edit
                                                </button>
                                            </td>
                                        </template>                             
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
    </div>
</template>

<script>
import { mapState } from 'vuex'
import Modal from '../../shared_components/Modal.vue'

export default {

     components: {
        Modal
    },

    name: "StudentFiles",

    data() {
        let files = this.$store.state.report.find(item => item.stsKey == this.$route.params.stsKey).files
        let submittedStatuses = {}
        let studentName = this.$store.state.report.find(item => item.stsKey == this.$route.params.stsKey).name
        if(files) files.forEach((file, i)=>{ 
            if(!file.grade) file.grade = ['']
            submittedStatuses[i] = file.FK_fileStatusKey
        })
        return {
            submittedStatuses,
            files,
            studentName
        } 
    },

    created(){
        //redirect back to daskboard if no files present
        if(this.$store.state.report.length==0) this.$router.push({ name: "Dashboard"})
    },

    beforeRouteEnter(to, from, next) {
        next( vm => { 
           // vm.$store.dispatch('GET_FILES')
        })
    },

    methods: {
        submit(i, userFileKey) {
            let modalID = "#Modal-" + i
            $(modalID).modal('show')
        },

        edit(i, userFileKey){
            this.submittedStatuses[i]=1
        },

        handleModalConfirm(i, userFileKey){
            let modalID = "#Modal-" + i
            $(modalID).modal('hide')
            let grade = Math.floor(this.files[i].grade[0] / 1)
            let professorComments = this.files[i].professorComments
            let FK_fileStatusKey = this.files[i].FK_fileStatusKey
            if(grade > 100) grade = 100
            if(grade < 0) grade = 0
            this.submittedStatuses[i]=FK_fileStatusKey
            $.ajax({
                url: `/capsiminbox/professor/update-file/${userFileKey}`,
                method: 'put',
                data: {
                    grade,
                    professorComments,
                    FK_fileStatusKey
                },
                dataType: 'json',
            })
            .fail( err => {
                console.log(err)
            })
        },
    },

    computed: {
        ...mapState({
            assetsPath: state => state.assetsPath,
            report: state => state.report          
        })
    }    
}
</script>

<style lang="scss" scoped>

</style>