<template>
  <div id="login-form" class="mat p-20">
      <form>
          <div class="form-group">
            <label for="email">Email address</label>
            <input v-model="form.username.value" type="email" class="form-control" id="email" placeholder="Email">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input v-model="form.password.value" type="password" class="form-control" id="password" placeholder="Password">
          </div>
          <div class="errors">
              <div v-for="error in errors" class="text-danger">
                  {{ error.message }}
              </div>
          </div>
          <button @click.prevent="triggerLogin" class="btn mat btn-success">Login</button>
      </form>
  </div>
</template>
<script>
export default {

  name: "login-form",

  data: () => ({
      form: {
          username: {
              value: '',
              validate() {
                  return this.value.length > 0
              }
          },
          password: {
              value: '',
              validate() {
                  return this.value.length > 0
              }
          },
      },
      errors: []
  }),

  methods: {

      triggerLogin() {
          this.errors = []
          this.validateForm()
          .then( () => this.login() )
          .then( () => this.$router.push({ name: 'list-versions' }) )
          .catch( err => (err.status == 401) && this.errors.push({ message: 'Invalid Credentials' }) )
      },

      login() {
          return this.$store.dispatch('LOGIN',
              {
                  username: this.form.username.value,
                  password: this.form.password.value
              })
      },

      validateForm() {
          return new Promise( (resolve, reject) => {
              Object.keys(this.$data.form)
              .forEach( input => (!this.$data.form[input].validate()) && this.errors.push({ message: `Please enter a valid ${input}` }) )
              return (this.errors.length > 0) ? reject() : resolve()
          })
      }
  }

}
</script>
<style lang="scss" scoped>
    #login-form {
        background-color: #e5e5e5;
        border: 1px solid #b5b5b5;
        border-radius: 5px;
    }
</style>
