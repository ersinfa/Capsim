import notification from '../../shared_components/Notification.vue'

module.exports = {

  data() {

    return {
      sessionData: data,
      notifications: {
        success: 'Your record was updated',
        failure: 'Your record failed to update'
      },
      currentMessage: "",
      isActive: false,
      isLoading: false,
      isWarning: false
    }
  },

  components: {
    notification
  },

  computed: {

    endDateTime() {
      // return this.$moment.utc(this.$store.state.endDateTime).format('MM/DD/YYYY hh:mm a')
      return this.localClassEndDate
    },
    
    startDateTime() {
      // return this.$moment.utc(this.$store.state.startDateTime).format('MM/DD/YYYY hh:mm a')
      return this.localClassStartDate
    },

    reportAvailableDate() {
      return this.localreportAvailableDate
    },

    endConfig() {
      return {
        minDate: this.$moment(this.startDateTime, 'MM/DD/YYYY hh:mm'),
        sideBySide: true
      }
    },

    reportConfig() {
      return {
        minDate: this.$moment(this.startDateTime).subtract(10, 'minutes').format('MM/DD/YYYY hh:mm'),
        maxDate: this.$moment(this.endDateTime, 'MM/DD/YYYY hh:mm'),
        sideBySide: true
      }
    },

    startConfig() {
      return {
        maxDate: this.$moment(this.endDateTime, 'MM/DD/YYYY'),
        sideBySide: true
      }
    },

    isExam(){
      if(this.$store.state){
        return this.$store.state.isExam; 
      }
    },

    sectionSettings(){
      if (this.$store.state.settings) {
        return this.$store.state.settings
      }
    },

    timeAMPM() {
      return this.$store.state.timeAMPM
    },

    dstPref() {
      return this.$store.state.dstPref
    },

    worldtimeKey() {
      return this.$store.state.worldtimeKey
    },

    localClassStartDate() {
      return this.$store.state.localClassStartDate
    },

    localClassEndDate() {
      return this.$store.state.localClassEndDate
    },

    localreportAvailableDate() {
      return this.$store.state.reportAvailableDate
    }

  },

  methods: {

    updateEnd(e) {
      // this.dispatchUpdate('UPDATE_SECTION', { key: 'endDateTime', value: e.date.format('MM/DD/YYYY hh:mm a') })
      this.dispatchUpdate('UPDATE_SECTION_RAW', { 
        endDateTime: e.date.format('MM/DD/YYYY hh:mm a'), 
        startDateTime: this.startDateTime,
        worldtimeKey: this.worldtimeKey,
        dstPref: this.dstPref,
        timeAMPM: this.timeAMPM
      })
    },

    updateStart(e) {
      // this.dispatchUpdate('UPDATE_SECTION', { key: 'startDateTime', value: e.date.format('MM/DD/YYYY hh:mm a') })
      this.dispatchUpdate('UPDATE_SECTION_RAW', { 
        startDateTime: e.date.format('MM/DD/YYYY hh:mm a'), 
        endDateTime: this.endDateTime,
        worldtimeKey: this.worldtimeKey,
        dstPref: this.dstPref,
        timeAMPM: this.timeAMPM
      })
    },
    // refactor
    updateWorldTime(e) {
      this.dispatchUpdate('UPDATE_SECTION', { key: 'worldtimeKey', value: e })
      this.$store.dispatch('UPDATE_LOCAL_STATE', { worldtimeKey: e})

      this.$store.dispatch('UPDATE_SECTION_RAW', { 
        startDateTime: this.startDateTime, 
        endDateTime: this.endDateTime,
        worldtimeKey: this.worldtimeKey,
        dstPref: this.dstPref,
        timeAMPM: this.timeAMPM
      })
      this.$store.dispatch('UPDATE_SECTION_RESULTS_RAW', { 
        resultsavailable2: this.reportAvailableDate,
        worldtimeKey: this.worldtimeKey,
        dstPref: this.dstPref
      })
    
    },

    updateReport(e) {
      // this.dispatchUpdate('UPDATE_SIM', { key: 'resultsavailable2', value: e.date.format('MM/DD/YYYY hh:mm a') })
      this.dispatchUpdate('UPDATE_SECTION_RESULTS_RAW', { 
        resultsavailable2: e.date.format('MM/DD/YYYY hh:mm a'),
        worldtimeKey: this.worldtimeKey,
        dstPref: this.dstPref
      })

    },

    dispatchUpdate(action, params) {
      this.showNotification()
      this.$store.dispatch(action, params)
      .then( () => this.updateNotification() )
      .catch( () => this.updateNotification(true) )
    },

    showNotification() {
      this.isWarning = false
      this.isLoading = true
      this.isActive = true
    },

    updateNotification( isWarning = false ) {
      setTimeout( () => {
        this.currentMessage = ( isWarning ) ? this.notifications['failure'] : this.notifications['success']
        this.isLoading = !this.isLoading
        this.isWarning = isWarning
      }, 1000)
    }
  }

}
