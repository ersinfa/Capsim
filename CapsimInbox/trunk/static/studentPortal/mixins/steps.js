// For student walkthrough

module.exports = {

  computed: {
    isComplete() {
      // if(this.hasOwnProperty("settings")){
        return this.$safeGet( this.settings, `pages[${this.$route.name}]`, false )
      // }
      // else {
        // return false
      // }
    },

    settings() {
      //return this.$store.state.settings
      return this.$store.getters.selectedAssessment.settings 
    },

    skipWelcomeVideo(){
      return this.$store.state.session.skipWelcomeVideo
    }
  },

  methods: {
    nextStep() {
      let step = this.steps[this.currentStep+1]
      if(this.skipWelcomeVideo && step == 'Welcome' ){
        step = null
      }
      if(!step){
        this.$store.dispatch('SET_SETTING', { key: this.$route.name, value: true })
        .then( () => this.$router.push({ name: this.next }) )
        .catch( (err) => console.log(err))
      }else{
        // this.breadcrumbs.push(step)
        this.currentStep++
      }
    },

    previousStep() {
      let step = this.steps[this.currentStep-1]
      if(!step){
        this.$store.dispatch('SET_SETTING', { key: this.previous, value: false, skipWelcomeVideo: false })
        .then( () => this.$router.push({ name: this.previous }) )
        .catch( (err) => console.log(err))
      }else{
        // this.breadcrumbs.pop()
        this.currentStep--
      }     
    }
  },

  beforeRouteEnter(to, from, next) {
    next( vm => {
      if( vm.isComplete ) {
        return vm.$router.push({ name: vm.next })
      }
        // vm.breadcrumbs = []

        if(vm.next == from.name){
          vm.currentStep = Object.keys(vm.steps).length

          if(vm.skipWelcomeVideo && from.name == 'Self Assessment'){
            vm.currentStep = 1
          }
        // for(let i = 0; i < steps.length; i++){
        //   vm.breadcrumbs.push(vm.steps[1+i])
        // }
      } else {
        vm.currentStep = 1
        // vm.breadcrumbs.push(vm.steps[1])
      }
    })
  }

}
