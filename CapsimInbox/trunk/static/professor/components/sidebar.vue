<template>
  <div class="col-sm-3 col-md-2 sidebar">
    <ul class="nav nav-sidebar">
      <li><router-link to="/professor/dashboard">Dashboard</router-link></li>
      <li><router-link to="/professor/course-settings">Course Settings</router-link></li>
      <li>
        <template v-if="isExam !== 1">
          <router-link to="/professor/skill-scores">
            Skill Scores
          </router-link>
        </template>
      </li>
      <template v-if="isExam === 1">
        <li><router-link to="/professor/exam-reports">Reports</router-link></li>
      </template>
      <li><a href="/CapsimInbox/professor/courses">My Courses</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  computed: {
    isExam(){
        return this.$store.state.isExam; 
    },
  }
}
</script>
<style lang="scss">
.textShrink {
  font-weight: 400 !important;
}
.sidebar {
  box-shadow: 1px 3px 4px rgba(0,0,0,.2);
  position: fixed;
  top: 60px;
  bottom: 0;
  left: 0;
  z-index: 998;
  display: block;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #003F54;

  ul {
    li {
      border-bottom: 2px solid rgb(226, 220, 221);
      a {
        font-weight: 600;
        padding: 20px 10px 20px 30px;
        font-size: 1.8rem;
        color: white;
        &:hover, &.active {
          background-color: white;
          color: black;
        }
      }
    }
  }
}

</style>
