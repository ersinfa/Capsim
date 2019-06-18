<template lang="html">
  <div>
    <notification :isLoading="isLoading" :isActive.sync="isActive" :isWarning="isWarning" :message="message"></notification>

    <!--<router-link :to="{ name: 'Welcome'}" class="btn btn-primary mt-8 mat">
					<span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span>
					Return
    </router-link>-->

    <h1>Account</h1>
    <!-- Personal Information -->
    <div class="panel panel-default">
      <div class="panel-body">
        <div class="form-horizontal col-sm-10">
          <p class="lead"><b>Personal Information</b></p>
          <div class="form-group">
            <label for="first-name" class="col-sm-3 control-label">First Name: </label>
            <div class="col-sm-6">
              <input type="text" class="form-control" id="first-name" v-model="personal.firstname">
            </div>
          </div>
          <div class="form-group">
            <label for="last-name" class="col-sm-3 control-label">Last Name: </label>
            <div class="col-sm-6">
              <input type="text" class="form-control" id="last-name" v-model="personal.lastname">
            </div>
          </div>
          <div class="form-group">
            <label for="user-id" class="col-sm-3 control-label">User ID: </label>
            <div class="col-sm-6">
              <input type="text" class="form-control" id="user-id" v-model="personal.username">
            </div>
          </div>
          <div class="form-group">
            <label for="email" class="col-sm-3 control-label">Email: </label>
            <div class="col-sm-6">
              <input v-model="personal.email" type="text" class="form-control" id="email">
            </div>
          </div>
          <div class="form-group">
            <label for="phone" class="col-sm-3 control-label">Phone: </label>
            <div class="col-sm-6">
              <input v-model="personal.phone" type="text" class="form-control" id="phone">
            </div>
          </div>
          <div class="form-group">
            <div class="col-sm-offset-3 col-sm-9">
              <button v-on:click="updateAccount()" type="submit" name="Update" class="btn btn-primary mat" >Update Personal Info</button>
            </div>
          </div>
        </div>
      </div>
    </div><!-- ./Personal Information -->

    <!-- Password -->
     <div class="alert alert-danger" role="alert" style="margin-top: 50px" v-if="showPasswordError">
          {{ passwordErrorMessage }}
        </div>
    <div class="panel panel-default">
      <div class="panel-body">
        <p class="lead"><b>Password</b></p>
        <div class="form-horizontal col-sm-10">
          <div class="form-group">
            <label for="current-password" class="col-sm-3 control-label">Current Password: </label>
            <div class="col-sm-6">
              <input v-model="password.currentPassword" type="password" class="form-control" id="current-password">
            </div>
          </div>
          <div class="form-group">
            <label for="new-password" class="col-sm-3 control-label">New Password: </label>
            <div class="col-sm-6">
              <input v-model="password.newPassword" type="password" class="form-control" id="new-password">
            </div>
          </div>
          <div class="form-group">
            <label for="confirm-new-password" class="col-sm-3 control-label">Confirm New Password: </label>
            <div class="col-sm-6">
              <input v-model="password.newPasswordConfirm" type="password" class="form-control" id="confirm-new-password">
            </div>
          </div>
          <div class="form-group">
            <label for="password-hint" class="col-sm-3 control-label">Password Hint: </label>
            <div class="col-sm-6">
              <input v-model="password.hint" type="text" class="form-control" id="password-hint">
            </div>
          </div>
          <div class="form-group">
            <div class="col-sm-offset-3 col-sm-9">
              <button v-on:click="updatePassword()" type="submit" name="Update" class="btn btn-primary mat" >Update Password</button>
            </div>
          </div>
        </div>
        <div class="clearfix"></div>


      </div>

    </div><!-- ./Password -->

  </div>
</template>

<script>

import notification from '../../shared_components/Notification.vue'

export default {
  name: 'MyAccount',
   data() {
    return {
     personal: {
       firstname: null,
       lastname: null,
       username: null,
       email: null,
       phone: null
     },
     password: {
       currentPassword: null,
       newPassword: null,
       newPasswordConfirm: null,
       hint: null
     },
     isActive: false,
     isLoading: false,
     isWarning: false,
     message: 'Account successfully updated',
     showPasswordError: false,
     passwordErrorMessage: ""
    }
  },
  components: {
    notification
  },

  beforeRouteEnter (to, from, next) {

    next(vm => {
       $.ajax({
          url: '/CapsimInbox/student/getAccount',
          method: "GET",
          dataType: 'json'
        })
        .done( data =>  {
          vm.$set( vm.$data.personal, 'firstname', data.firstname )
          vm.$set( vm.$data.personal, 'lastname', data.lastname )
          vm.$set( vm.$data.personal, 'username', data.username )
          vm.$set( vm.$data.personal, 'email', data.email )
          vm.$set( vm.$data.personal, 'phone', data.phone )

          vm.$set( vm.$data.password, 'hint', data.hint )
          })
        .fail( err => reject(err) )
      })
    },

  methods: {

    updateAccount() {
      this.isLoading = true
      this.isActive = true
      $.ajax({
        url: '/capsiminbox/student/update-account',
        method: 'PUT',
        data: JSON.stringify(this.personal),
        contentType: 'application/json'
      })
      .done( () => setTimeout( () => { this.isLoading = !this.isLoading; this.isWarning = false }, 1000 ) )
      .catch( err => console.log(err) )
    },

    updatePassword() {
      if(this.validPasswordForm()){
        this.isLoading = true
        this.isActive = true
        $.ajax({
          url: '/capsiminbox/student/update-password',
          method: 'PUT',
          data: JSON.stringify(this.password),
          contentType: 'application/json'
        })
        .done( () =>  setTimeout( () => { this.isLoading = !this.isLoading; this.isWarning = false }, 1000 ) )
        .catch( err => {
          if (err.status == 401){
            setTimeout( () => {
              this.showPasswordError = true
              this.passwordErrorMessage = 'Current Password is incorrect.'
              this.isLoading = !this.isLoading
              this.isWarning = true
              }, 1000 )

          }
        })
      }
    },

    validPasswordForm(){
      this.showPasswordError = false;
      this.passwordErrorMessage = "";
      let isEmpty = (
          this.password.currentPassword == ''
        || this.password.currentPassword == null
        || this.password.newPassword == ''
        || this.password.newPassword == null
        || this.password.newPasswordConfirm == ''
        || this.password.newPasswordConfirm == null
      )
      if (isEmpty){
        this.showPasswordError = true
        this.passwordErrorMessage = 'Please fill required fields.'
        return false
      }

      let isPasswordMatch = ( this.password.newPassword == this.password.newPasswordConfirm )
      if (!isPasswordMatch){
        this.showPasswordError = true
        this.passwordErrorMessage = 'New Password and Confirm New Password doesn\'t match.'
        return false
      }
      return true
    }

  }

}
</script>

<style lang="css">
.notification-box {
  position: absolute;
  top: 15px !important;
  right: 200px !important;
  box-shadow: 0 0 2px #424242 !important;
  width: auto;
  z-index: 9999;
  padding: 10px !important;
}

</style>
