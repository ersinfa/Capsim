<template>
    <div id="list-version" class="panel panel-default">

      <loader v-if="isLoading"></loader>
      <template v-else>

        <modal id="delete-version-modal" :closeText="'No'" :confirmText="'Yes'" @confirm="deleteVersion">
            <h4 class="text-danger" slot="title">Are you sure you want to delete this version?</h4>
            <p slot="body">{{ versionToDelete.versionName }}</p>
        </modal>

        <modal id="auth-modal" :size="'sm'" :showClose="false" :confirmText="'Submit'" @confirm="handleModalSubmit">
            <h3 slot="title">Authenticate</h3>
            <form slot="body">
                <div :class="['form-group', { 'has-error': this.errors.username }]">
                    <input v-model="form.username.val" placeholder="Enter email" type="text" class="form-control">
                    <span v-show="this.errors.username" class="help-block">Invalid Email</span>
                </div>
                <div :class="['form-group', { 'has-error': this.errors.password }]">
                    <input v-model="form.password.val" placeholder="Enter password" type="password" class="form-control">
                    <span v-show="this.errors.password" class="help-block">Invalid Password</span>
                </div>
                <p v-show="errors.server" class="text-danger">Invalid Credentials</p>
            </form>
        </modal>

        <div class="panel-heading">
            <h1>Versions List <router-link class="btn mat btn-primary pull-right" :to="{ name: 'create-version' }">Create Version</router-link></h1>
        </div>

        <div class="panel-body">
          <table class="table">
                 <thead>
                     <tr>
                         <th>Name</th>
                         <th colspan="3">Actions</th>
                         <th>Activate/Deactivate</th>
                         <th>Author</th>
                         <th>Department</th>
                     </tr>
                 </thead>
                 <tbody>
                     <tr v-for="version in versionsList">
                         <td>{{ version.versionName }}</th>
                         <td><router-link class="btn mat btn-success btn-sm" :to="{ name: 'show-version', params: { resourceKey: version.versionKey }}">Show</router-link></td>
                         <td><router-link v-if="!version.isActive" class="btn mat btn-primary btn-sm" :to="{ name: 'edit-version', params: { resourceKey: version.versionKey }}">Edit</router-link></td>
                         <td><button v-if="!version.isActive" class="btn mat btn-danger btn-sm" @click="showDeleteWarning(version)">Delete</button></td>
                         <td><switcher :customEvent="'changed'" :selected="version.isActive" :emitOnMount="false" :value="version.isActive" @input="setVersionToToggle(version)"></switcher></td>
                         <td v-if="version.editor.length > 0">{{version.editor[0].FirstName}} {{version.editor[0].LastName}}</td>
                         <td v-else></td>
                         <td v-if="version.department.length > 0">{{version.department[0].Department}}</td>
                         <td v-else></td>
                     </tr>
                 </tbody>
             </table>
        </div>

      </template>
    </div>
</template>
<script>
export default {

    name: "list-version",

    data: () => ({
        versionsList: [],
        form: {
            username: {
                val: '',
                validate() {
                    return this.val.length > 3
                }
            },
            password: {
                val: '',
                validate() {
                    return this.val.length > 6
                }
            }
        },
        errors: {},
        versionToToggle: {},
        isLoading: true,
        versionToDelete: {}
    }),

    methods: {

        cleanup() {

            this.errors = {}
            this.versionToToggle = {}

            Object.keys(this.form).forEach(key => this.form[key].val = '')

            $('#auth-modal').modal('hide')
        },

        confirmAuth() {
            return new Promise( (resolve, reject) => {
                this.$set(this.errors, 'server', false)
                $.ajax({
                    url: '/capsiminbox/admin/authenticate',
                    method: 'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        username: this.form.username.val,
                        password: this.form.password.val
                    })
                })
                .done( () => resolve() )
                .fail( err => {
                    this.$set(this.errors, 'server', true)
                    reject(err)
                })
            })
        },

        deleteVersion() {

            $('#delete-version-modal').modal('hide')

            $.ajax({
                url: `/capsiminbox/admin/api/versions/${this.versionToDelete.versionKey}`,
                method: 'delete',
                dataType: 'json'
            })
            .done( () => {
              this.removeVersion(this.versionToDelete.versionKey)
              setTimeout( () => this.versionToDelete = {}, 500 )
              this.$store.dispatch('NOTIFY', {
                    message: 'Version was successfully deleted',
                    isWarning: false
              })
            })
            .fail( err => {
                console.log( err )
                this.$store.dispatch('NOTIFY', {
                    message: 'There was a problem while deleting version.',
                    isWarning: true
                })
            })
        },

        handleModalSubmit() {
            this.validateInput()
            .then( () => this.confirmAuth() )
            .then( () => this.toggleVersionActive() )
            .then( version => this.updateVersionItem(version) )
            .then( () => this.cleanup() )
            .catch( err => ({ err }) )
        },

        removeVersion(versionKey) {
            this.versionsList = this.versionsList.filter( version => version.versionKey !== versionKey )
        },

        updateVersionItem(version) {
            let versionInList = this.versionsList.find( el => el.versionKey == version.versionKey )
            versionInList.isActive = Number(version.isActive)
            return {}
        },

        setVersionToToggle(version) {
            this.versionToToggle = version
            $('#auth-modal').modal('show')
        },

        showDeleteWarning(version) {
          this.versionToDelete = version
          $('#delete-version-modal').modal('show')
        },

        toggleVersionActive() {
            return new Promise( (resolve, reject) => {
                $.ajax({
                    url: '/capsiminbox/admin/api/versions/toggle-active',
                    method: 'POST',
                    data: {
                        isActive: Number(!this.versionToToggle.isActive),
                        versionKey: this.versionToToggle.versionKey
                    }
                })
                .done( data => resolve(data) )
                .fail( err => reject(err) )
            })
        },

        validateInput() {
            return new Promise( (resolve, reject) => {
                this.$set(this.$data, 'errors', {})
                Object.keys(this.form).forEach( input => this.$set(this.errors, input, !this.form[input].validate()) )
                return ( Object.keys(this.errors).filter( key => this.errors[key] ).length > 0) ? reject() : resolve()
            })
        }
    },

    mounted() {
        $.ajax({
            url: '/capsiminbox/admin/api/versions',
            method: 'GET',
            dataType: 'json'
        })
        .done( data => {
          this.$set(this, 'versionsList', data);
          setTimeout( () => this.isLoading = false, 500)
        })
        .catch( err => console.log(err) )
    }
}
</script>
<style lang="scss" scoped>
</style>
