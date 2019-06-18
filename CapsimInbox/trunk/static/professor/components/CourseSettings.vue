<template lang="html">
  <div class="course-settings">
    <notification :message="'Course successfully updated'" :isLoading="isLoading" :isActive.sync="isActive" :style="{ 'z-index': '999' }">
        <span class="glyphicon glyphicon-ok mr-5" slot="success-icon"></span>
    </notification>
    <h1>Course Settings</h1>
    <div class="panel panel-default">
      <div class="panel-body">

        <div class="mb-30 col-md-6">
          <h3>Course Information</h3>
          <div class="form-horizontal">
            <div class="form-group">
              <label for="course-title" class="col-sm-3 control-label">Course Title: </label>
              <div class="col-sm-6">
                <input v-model="courseTitle" type="text" class="form-control" id="course-title">
              </div>
            </div>
          </div>

          <h3>Course Schedule</h3>

          <div class="form-horizontal">
            <div class="form-group">
              <label for="country-select" class="col-sm-3 control-label">Choose Country: </label>
              <div class="col-sm-6">
                <select class="form-control" id="country-select"  v-model="selectedCountry">
                    <option disabled value="">Select Country</option>
                    <option v-for="country in countries" >
                        {{ country.country }}
                    </option>
                </select> 
              </div>
            </div>
          </div>  

          <div class="form-horizontal">
            <div class="form-group">
              <label for="country-select" class="col-sm-3 control-label">Choose Region: </label>
              <div class="col-sm-6">
                <select class="form-control" id="country-select"  v-model="selectedRegion">
                    <option disabled value="">Select Region</option>
                    <option v-for="region in regionCollection" :value="region.worldtimeKey">
                        {{ region.region }}
                    </option>
                </select> 
              </div>
            </div>
          </div>  


          <div class="pl-15 form-horizontal">
            <div class="form-group">
              <label class="col-sm-3 control-label">Time Change: </label>
              <div class="col-sm-9">
                <div class="radio">
                  <label>
                    <input v-model.number="selectedDstpref" type="radio" name="timeChange" value="1" id="dstpref-switch">
                    Next Scheduled shift to {{ tzDetails.switchType }} Time is on {{ tzDetails.switchDate }}
                  </label>
                </div>
                <div class="radio">
                  <label>
                    <input v-model.number="selectedDstpref" type="radio" name="dstpref-st" value="0" id="dstpref-st">
                    Stay on Standard Time
                  </label>
                </div>
                <div class="radio">
                  <label>
                    <input v-model.number="selectedDstpref" type="radio" name="dstpref-dt" value="2" id="dstpref-dt">
                    Stay on Daylight Time
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="form-horizontal">
            <div class="form-group">
              <label for="start-date" class="col-sm-3 control-label">Start Date: </label>
              <div class="col-sm-6">
                <div class="input-group">
                  <date-picker @dp-hide="updateStart" :config="startConfig" :value="startDateTime" :wrap="true"></date-picker>
                  <div class="input-group-addon"> <span class="glyphicon glyphicon-calendar"></span> </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="end-date" class="col-sm-3 control-label">End Date: </label>
              <div class="col-sm-6">
                <div class="input-group">
                  <date-picker @dp-hide="updateEnd" :config="endConfig" :value="endDateTime" :wrap="true"></date-picker>
                  <div class="input-group-addon"> <span class="glyphicon glyphicon-calendar"></span> </div>
                </div>
              </div>
            </div>

            <div class="form-group" v-if="isExam !=1">
              <label for="reports-date" class="col-sm-3 control-label">Reports Available: </label>
              <div class="col-sm-6">
                <div class="input-group">
                  <date-picker @dp-hide="updateReport" :config="reportConfig" :value="reportAvailableDate" :wrap="true"></date-picker>
                  <div class="input-group-addon"> <span class="glyphicon glyphicon-calendar"></span> </div>
                </div>
              </div>
            </div>
          </div>

          <h3>Course Enrollment</h3>
          <div class="pl-15 form-horizontal">
            <div class="form-group">
              <label class="col-sm-3 control-label">Course Enrollment: </label>
              <div class="col-sm-9">
                <div class="radio">
                  <label>
                    <input v-model.number="courseEnrollment" type="radio" name="enrollment" value="1" id="enrollment-open">
                    Registration into this course is "OPEN"
                  </label>
                </div>
                <div class="radio">
                  <label>
                    <input v-model.number="courseEnrollment" type="radio" name="enrollment" value="2" id="enrollment-closed">
                    Registration into this course is "CLOSED"
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- <ExamSettings v-if="isExam == 1" /> -->

           <div class="row mt-30">
              <label for="regUrl">
                Use this link to help your students register for  {{ thisProduct }}
              </label>
              <div class="input-group">
                <input ref="regUrl" id="regUrl" :value="courseRegistrationUrl" type="text" readonly="readonly" class="form-control" aria-describedby="copy-button">
                <button @click="copyLink" class="btn btn-default-outline mt-5" id="copy-button">{{ linkCopied ? 'Link Copied' : 'Copy Link' }}</button>
              </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'

export default {

  name: 'CourseSettings',

  data: () => ({
    courseTitle: data.courseTitle,
    courseEnrollment: data.enrollmentKey,
    clockTime: data.timeAMPM,
    countries: [],
    tzDetails: {
      switchType: '',
      switchDate: ''
    },
    selectedCountry: {},
    selectedDstpref: data.dstPref,
    selectedRegion: {},
    selectedAMPM: 0,
    linkCopied: false,
    regions: [],
  }),
  

  mixins: [require('../mixins/courseSettings')],

  watch: {
    courseTitle() {
      this.updateTitle()
    },

    clockTime() {
      this.updateClockTime()
    },

    courseEnrollment() {
      this.updateEnrollment()
    },

    selectedCountry() {
      this.getRegionList()
    },

    selectedRegion(oldValue, newVlaue) {
      // Check if set to a region key
      if (parseInt(newVlaue)) {
        this.updateWorldTime(this.selectedRegion)
      }
    },

    selectedDstpref(value) {
      this.dispatchUpdate('UPDATE_SECTION', { 
        key: 'dstPref', 
        value: value
      })
    }

  },
  computed: {

    courseRegistrationUrl() {
      return `https://${this.$store.state.portalUrl}/StudentRegApp_v2010/index.cfm?simID=${this.sessionData.simID}`
    },

    // Append the city list to region like it does in teammate 
    regionCollection () {
      return this.regions.map(region => this.hasCityList(region))
    },

    thisProduct () {
      if(this.isExam == 1){
        return 'their exam'
      } else {
        return 'CapsimInbox'
      }
    }

  },

  methods: {

    hasCityList: (region) => {
      if (region.region) {
        if (region.city_list) {
          region.region = `${region.region} (${region.city_list})`
        }
      } else {
        region.region = 'No region'
      }
      return region
    },

    copyLink() {
      this.$refs.regUrl.select()
      this.linkCopied = document.execCommand('copy', false)
      setTimeout(() => this.linkCopied = false, 5000)
    },

    updateTitle: debounce( function() {
      this.isLoading = true
      this.isActive = true
      $.ajax({
        url: '/capsiminbox/professor/update-section',
        method: 'PUT',
        data: JSON.stringify({ key: 'courseTitle', value: this.courseTitle }),
        contentType: 'application/json'
      })
      .done( () => setTimeout( () => { this.isLoading = !this.isLoading }, 1000 ) )
      .catch( err => console.log(err) )
    }, 500 ),

    updateClockTime: debounce( function() {
      this.isLoading = true
      this.isActive = true
      $.ajax({
        url: '/capsiminbox/professor/update-section',
        method: 'PUT',
        data: JSON.stringify({ key: 'timeAMPM', value: this.clockTime }),
        contentType: 'application/json'
      })
      .done( () => setTimeout( () => { this.isLoading = !this.isLoading }, 1000 ) )
      .catch( err => console.log(err) )
    }, 500 ),

    updateEnrollment: debounce( function() {
      this.isLoading = true
      this.isActive = true
      $.ajax({
        url: '/capsiminbox/professor/update-sim',
        method: 'PUT',
        data: JSON.stringify({ key: 'enrollmentKey', value: this.courseEnrollment }),
        contentType: 'application/json'
      })
      .done( () => setTimeout( () => { this.isLoading = !this.isLoading }, 1000 ) )
      .catch( err => console.log(err) )
    }, 500 ),

    getCountryDetails: debounce( function() {
      $.ajax({
        url: '/capsiminbox/professor/countryDetails',
        method: 'POST',
        data: JSON.stringify({ worldtimeKey: this.worldtimeKey }),
        contentType: 'application/json'
      })
      .done((details) => {
        this.selectedCountry = details.country
        this.selectedRegion = details.worldtimeKey
      })
      .catch( err => console.log(err) )
    }, 500 ),

    getCountryList: debounce( function() {
      $.ajax({
        url: '/capsiminbox/professor/countryList',
        method: 'GET',
        dataType: 'json'
      })
      .done((countries) => this.countries = countries)
      .catch( err => console.log(err) )
    }, 500 ),

    getRegionList: debounce( function() {
      $.ajax({
        url: '/capsiminbox/professor/regionList',
        method: 'POST',
        data: JSON.stringify({ country: this.selectedCountry }),
        contentType: 'application/json'
      })
      .done((regions) => this.regions = regions)
      .catch( err => console.log(err) )
    }, 500 ),

    getTZDetails: debounce( function() {
      $.ajax({
        url: '/capsiminbox/professor/tzDetails',
        method: 'POST',
        data: JSON.stringify({ worldtimeKey: this.worldtimeKey }),
        contentType: 'application/json'
      })
      .done((tzDetails) => this.tzDetails = tzDetails)
      .catch( err => console.log(err) )
    }, 500 )

  },

  created() {
    this.$store.dispatch('GET_SECTION_SETTINGS')
    this.getCountryDetails()
    this.getCountryList()
    this.getTZDetails()
  },

  components: { 
    // ExamSettings 
  }

}
</script>



