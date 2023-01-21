<template >
    <div id="capsim-professor-exam-settings">
        <notification :message="'Course successfully updated'" :isLoading="isLoading" :isActive.sync="isActive" :style="{ 'z-index': '999' }">
            <span class="glyphicon glyphicon-ok mr-5" slot="success-icon"></span>
        </notification>
        <h3> Exam Settings </h3>
        <div class="form-horizontal" v-if="examSettings">
            <div class="form-group">
                <label for="exam-title" class="col-sm-3 control-label">Exam Name: </label>
                <div class="col-sm-6">
                    <input style="max-width: 220px; display: inline;" v-model.number="examSettings.simTitle" class="form-control" id="exam-title">
                </div>
            </div>
            <div class="form-group">
                <label for="course-title" class="col-sm-3 control-label">Exam Time: </label>
                <div class="col-sm-6">
                    <input style="max-width: 120px; display: inline;" v-model.number="examSettings.time" type="text" class="form-control" id="exam-time">
                    <label>Minutes</label>
                </div>
            </div>
            

            <div class="form-group">
                <label for="dashboard-access-start" class="col-sm-3 control-label">Exam Access Start Date: </label>
                <div class="col-sm-6">
                    <div class="input-group">
                        <date-picker @dp-hide="updateAcessStart"  :value="accessDates.accessStartDate" :wrap="true"></date-picker>
                        <div class="input-group-addon"> <span class="glyphicon glyphicon-calendar"></span> </div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="dashboard-access-end" class="col-sm-3 control-label">Exam Access End Date: </label>
                <div class="col-sm-6">
                    <div class="input-group">
                        <date-picker @dp-hide="updateAcessEnd" :value="accessDates.accessEndDate" :wrap="true"></date-picker>
                        <div class="input-group-addon"> <span class="glyphicon glyphicon-calendar"></span> </div>
                    </div>
                </div>
            </div>
            <div class="form-group">
              <label for="reports-date" class="col-sm-3 control-label">Reports Available: </label>
              <div class="col-sm-6">
                <div class="input-group">
                  <date-picker @dp-hide="updateReport" :config="reportConfig" :value="reportAvailableDate" :wrap="true"></date-picker>
                  <div class="input-group-addon"> <span class="glyphicon glyphicon-calendar"></span> </div>
                </div>
              </div>
            </div>
            <div class="form-group">
                <label for="exam" class="col-sm-3 control-label">Exam Password: </label>
                <div class="col-sm-6">
                    <input style="max-width: 120px; display: inline;" v-model.number="examSettings.password" :type="typePassword" class="form-control" id="exam">
                    <button class="btn btn-info-light ml-30" @click="(typePassword == 'password'? typePassword='text' : typePassword = 'password')">Show password</button>
                    <button class="btn btn-default-outline ml-30" @click="generateStudentsPassword()"> Random Password for each student</button>
                </div>
            </div>
            <div class="form-group">
                <label for="randomize-answers" class="col-sm-3 control-label">Don't Randomize Answer Choices: </label>
                <div class="col-sm-6">
                    <div class="checkbox">
                        <label>
                            <input v-model.number="examSettings.isNotRandomizeAnswers" type="checkbox"  id="randomize-answers" @click="updateSetting()">
                        </label>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import { debounce } from 'lodash'
export default {
    name: "capsim-professor-exam-settings",
      data: () => ({
        typePassword:'password'
    }),
    mixins: [require('../../mixins/courseSettings')],
    watch: {
        'examSettings.time': function (oldValue, newVlaue) {
            // Check if set to a region key
            if (parseInt(newVlaue)) this.updateSetting()
        },
        'examSettings.password': function (oldValue, newVlaue) {
           if (newVlaue) this.updateSetting()
        },
        'examSettings.simTitle': function (oldValue, newVlaue) {
           if (newVlaue) this.updateSetting()
        }
    },
    methods:{
        updateAcessStart(e) {
            this.accessDates.accessStartDate = e.date.format('MM/DD/YYYY hh:mm a')
            this.updateSetting()
        },
        updateAcessEnd(e) {
            this.accessDates.accessEndDate = e.date.format('MM/DD/YYYY hh:mm a')
            this.updateSetting()
        }, 
        updateSetting: debounce( function() {
            let  { accessStartDate, accessEndDate } = this.accessDates
            // Unbind data from vue 
            const dashboardAccess = this.accessDates
            const body = Object.assign({}, this.examSettings, { dashboardAccess })
            this.isLoading = true
            this.isActive = true
            $.ajax({
                url: '/capsiminbox/professor/update-section-settings',
                method: 'PUT',
                data: JSON.stringify(body),
                contentType: 'application/json'
            })
            .done( (data) => setTimeout( () => { this.isLoading = !this.isLoading }, 1000 ) )
            .catch( err => console.log(err) )
        }, 1000 ),
        generateStudentsPassword: debounce( function() {
          this.isLoading = true
          this.isActive = true
          $.ajax({
            url: '/capsiminbox/professor/generateStudentsPassword',
            method: 'post',
            contentType: 'application/json'
          })
          .done( () => setTimeout( () => { this.isLoading = !this.isLoading }, 1000 ) )
          .catch( err => console.log(err) )
        }, 500 ),
    },
    computed: {
        ...mapState({
            session: state => state.session,
            accessDates: state => state.settings.dashboardAccess,
        }),
        examSettings () {
            if (this.sectionSettings) return this.sectionSettings
            return null
        },
        accessConfig() {
            return {
                minDate: this.$moment(this.startDateTime, 'MM/DD/YYYY hh:mm'),
                maxDate: this.$moment(this.endDateTime, 'MM/DD/YYYY hh:mm'),
                sideBySide: true
            }
        }
    },
    created() {
        this.$store.dispatch('GET_SECTION_SETTINGS')
    },
};
</script>
