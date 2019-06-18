<template lang="html">
  <div class="panel panel-default">
      <nav class="hidden-print ribbon">
          <ul class="steps student" v-if="$route.name != 'IDP Builder' && $route.name != 'Report'">
              <li v-for="route in routes" :class="{ active: isActive(route.name) }" v-if="route.name != 'IDP Builder' && route.name != 'Report'">
                <!--<template v-if="canRouteTo(route)">
                  <router-link class="p-15" :to="{ name: route.name }">{{ route.meta.displayName }}</router-link>
                </template>
                <template>
                  <a class="p-15" href="#">{{ route.meta.displayName }}</a>
                </template>-->
                <template>
                  <p class="p-15" href="#">{{ route.meta.displayName }}</p>
                </template>
              </li>
          </ul>
      </nav>
      <div class="panel-body">
          <transition>
              <keep-alive>
                  <router-view></router-view>
              </keep-alive>
          </transition>
      </div>
  </div>
</template>

<script>
export default {

  name: 'Walkthrough',

  computed: {
      routes() {
          let routes = {}
          let walkthroughRoute = this.$router.options.routes.find( route => route.name === "Walkthrough" )
          walkthroughRoute.children.forEach( route => (route.name !== undefined) ? routes[route.name.toLowerCase()] = route : '' )
          return routes
      }
  },

  methods: {

    //   canRouteTo( route ) {
          //if(this.$store.getters.selectedAssessment.hasOwnProperty("settings")){
            // return (this.$safeGet(this.$store.getters.selectedAssessment.settings, 'assessment.completed', false) )
                    // ? ( route.name === 'Report' || route.name === 'IDP Builder' ) ? true : false
                    // : false
          //}
    //   },

      isActive( routeName ) {
          return this.$route.name === routeName
      }
  }
}
</script>

<style lang="scss" scoped>

@media print {
  .panel {
    box-shadow: none;
    border: none;
    .panel-body {
        padding: 0 !important;
    }
  }
}
</style>
