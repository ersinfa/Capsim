<template>
    <div id="home">
        <div class="col-md-4 col-md-offset-4 col- mt-50">
            <h1>Login</h1>
            <login-form></login-form>
        </div>
    </div>
</template>

<script>

export default {

    name: 'home',

    components: {
        loginForm: require('./loginForm.vue')
    },

    beforeCreate() {
        if( this.$store.getters.authenticated ) return this.$router.push({ path: '/capsiminbox/admin/versions' })
    }

}
</script>

<style lang="scss" scoped>
</style>
