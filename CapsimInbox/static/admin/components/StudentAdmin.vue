<template>
    <div id="student-admin">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h2>Reset Student</h2>
            </div>
            <div class="panel-body">
                <form class="col-md-6 form-inline">
                    <div class="form-group mr-20">
                        <label for="search-param">Student Last Name: </label>
                        <input v-model="searchParam" class="form-control" type="text" id="search-param">
                        <button @click.prevent="searchStudent" class="btn mat btn-primary ml-20">
                          <span v-show="isLoading" class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
                          Search
                        </button>
                    </div>
                </form>
                <div class="clearfix"></div>
                <table class="table mt-40">
                    <thead>
                        <tr>
                            <th>Last Name</th>
                            <th>First Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Industry ID</th>
                            <th>University</th>
                            <th>Professor</th>
                            <th>Reset</th>
                            <th>Reprocess</th>
                            <th>Process</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="student in students">
                            <td>{{ student.LastName }}</td>
                            <td>{{ student.FirstName }}</td>
                            <td>{{ student.username }}</td>
                            <td>{{ student.email }}</td>
                            <td>{{ student.simID }}</td>
                            <td>{{ student.schoolname }}</td>
                            <td>{{ student.professorLastName + ' ' + student.professorFirstName }}</td>
                            <td><button class="btn mat btn-primary" @click="resetStudent(student.stsKey)">Reset</button></td>
                            <td><button class="btn mat btn-primary" @click="reprocessStudent(student.stsKey,student.versionKey)">Reprocess</button></td>
                            <td><button class="btn mat btn-primary" @click="processStudent(student.stsKey,student.versionKey)">Process</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
<script>
export default {

    name: "student-admin",

    data: () => ({
        students: [],
        searchParam: '',
        isLoading: false
    }),

    methods: {
        searchStudent() {

            this.isLoading = true

            $.ajax({
                url: '/capsiminbox/admin/api/students',
                method: 'get',
                data: {
                    q: this.searchParam
                },
                dataType: 'json'
            })
            .done( students => {
              this.isLoading = false
              this.students = students
            })
            .fail( err => console.log(err) )
        },

        resetStudent(stsKey) {

            $.ajax({
                url: '/capsiminbox/admin/api/students/reset',
                method: 'post',
                data: JSON.stringify({
                    stsKey: parseInt(stsKey)
                }),
                contentType: 'application/json'
            })
            .done( data => {
              this.$store.dispatch('NOTIFY', {
                message: 'Student has been reset successfully',
                isWarning: false
              })
            })
            .fail( err => {
              this.$store.dispatch('NOTIFY', {
                message: 'There was a problem while resetting student.',
                isWarning: true
              })
            })
        },

        reprocessStudent(stsKey,versionKey) {

            $.ajax({
                url: '/capsiminbox/admin/api/students/reprocess',
                method: 'post',
                data: JSON.stringify({
                    stsKey: parseInt(stsKey),
                    versionKey: parseInt(versionKey)
                }),
                contentType: 'application/json'
            })
            .done( data => {
                if(data == 1){
                this.$store.dispatch('NOTIFY', {
                    message: 'Student has been reprocessed successfully',
                    isWarning: false
                })
              }else{
                  this.$store.dispatch('NOTIFY', {
                    message: 'Student has to complete inbox before reprocessing.',
                    isWarning: true
                })
              }
            })
            .fail( err => {
              this.$store.dispatch('NOTIFY', {
                message: 'There was a problem while reprocessed student.',
                isWarning: true
              })
            })
        },
        processStudent(stsKey,versionKey) {
            $.ajax({
                url: '/capsiminbox/admin/api/students/process',
                method: 'post',
                data: JSON.stringify({
                    stsKey: parseInt(stsKey),
                    versionKey: parseInt(versionKey)
                }),
                contentType: 'application/json'
            })
            .done( data => {
                this.$store.dispatch('NOTIFY', {
                    message: 'Student has been processed successfully',
                    isWarning: false
                })
            })
            .fail( err => {
              this.$store.dispatch('NOTIFY', {
                message: 'There was a problem while reprocessed student.',
                isWarning: true
              })
            })
        }
    }

}
</script>
<style lang="scss" scoped>

.glyphicon-refresh-animate {
    -animation: spin .9s infinite linear;
    -ms-animation: spin .9s infinite linear;
    -webkit-animation: spinw .9s infinite linear;
    -moz-animation: spinm .9s infinite linear;
}

@keyframes spin {
    from { transform: scale(1) rotate(0deg);}
    to { transform: scale(1) rotate(360deg);}
}

@-webkit-keyframes spinw {
    from { -webkit-transform: rotate(0deg);}
    to { -webkit-transform: rotate(360deg);}
}

@-moz-keyframes spinm {
    from { -moz-transform: rotate(0deg);}
    to { -moz-transform: rotate(360deg);}
}

</style>
