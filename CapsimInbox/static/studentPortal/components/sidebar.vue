<template lang="html">
    <div id="capsim-student-portal-sidebar" class="col-sm-3 col-md-2 sidebar">
        <ul class="nav nav-sidebar">
            <li><router-link to="/student/dashboard">Dashboard</router-link></li>
            <li v-if="isExam == 1"><router-link to="/student/tutorials">Tutorial</router-link></li>
            <li><router-link to="/student/account">My Account</router-link></li>
            <li><a href="/CapsimInbox/student/courses">Course Page</a></li>
        </ul>
    </div>
</template>

<script>
export default {
    name:'capsim-student-portal-sidebar',
    computed: {
      isExam(){
            return this.$store.state.session.isExam
        },
    }
}
</script>
<style lang="scss">

</style>


