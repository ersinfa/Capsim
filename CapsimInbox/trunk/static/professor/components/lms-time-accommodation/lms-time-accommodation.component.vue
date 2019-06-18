<template >
  <div v-if="isLMSSim == true">
    <div id="lms-time-accommodations">
        <notification :message="currentMessage" :isLoading="isLoading" :isWarning="isWarning" :isActive.sync="isActive" style="top: 65px; z-index: 999">
            <span slot="icon" class="glyphicon glyphicon-ok"></span>
        </notification>

      <h3> Time Accommodations </h3>
      <div class="form-inline">
        <div class="form-group">
          <label for="label1">SIS</label>
          <input type="text" class="form-control ml-15" id="label1" v-model="FK_lmsUserID" placeholder="999">
        </div>
        <div class="form-group ml-30">
          <label for="label2">Time Multiplier</label>
          <input type="email" class="form-control  ml-15" id="label2" v-model="timeMultiplier" placeholder="1.5">
        </div>
        <button @click="addRecord()" class="btn btn-success ml-30">Add</button>
      </div>
      <br/>
      <div class="col-md-6">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>SIS</th>
            <th>Time multiplier</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in allRecords">
            <td>{{ record.FK_lmsUserID }}</td>
            <td>{{ record.timeMultiplier }}</td>
            <td><div @click="removeRecord(record.FK_lmsUserID)" class="btn btn-danger"> Remove </div></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="clearfix"></div>
    </div>
  </div>
</template>
<script>
export default {
    name: "lms-time-accommodations",
      data: () => ({
        isLMSSim:false,
        FK_lmsUserID: '',
        timeMultiplier: null,
        allRecords:[],
    }),
    mixins: [require('../../mixins/courseSettings')],
    methods:{
        getIsLmsSim() {
            $.ajax({
                url: '/capsiminbox/professor/get-is-lms-sim',
                method: 'GET',
                contentType: 'application/json'
            })
            .done( (data) => this.isLMSSim = data )
            .catch( err => console.log(err) )
        }, 
        getAllRecords() {
            $.ajax({
                url: '/capsiminbox/professor/get-lms-student-time-multiplier',
                method: 'GET',
                contentType: 'application/json'
            })
            .done( (data) => this.allRecords = data )
            .catch( err => console.log(err) )
        }, 
        removeRecord(FK_lmsUserID) {
            this.showNotification()
            $.ajax({
                url: '/capsiminbox/professor/remove-lms-student-time-multiplier',
                method: 'DELETE',
                 data: JSON.stringify({
                  FK_lmsUserID: FK_lmsUserID
                }),
                contentType: 'application/json'
            })
            .done( (data) => {
              this.allRecords = this.allRecords.filter(record => record.FK_lmsUserID != FK_lmsUserID ) 
              this.updateNotification()
              })
            .catch( err => this.updateNotification(true) )
        }, 
        addRecord(){
            this.showNotification()
            $.ajax({
                url: '/capsiminbox/professor/add-lms-student-time-multiplier',
                method: 'POST',
                data: JSON.stringify({
                  FK_lmsUserID: this.FK_lmsUserID,
                  timeMultiplier: this.timeMultiplier
                }),
                contentType: 'application/json'
            })
            .done( (data) => {
              this.allRecords.push({FK_lmsUserID:this.FK_lmsUserID, timeMultiplier:this.timeMultiplier })
              this.FK_lmsUserID = ''
              this.timeMultiplier = null
              this.updateNotification()
            })
            .catch( err => this.updateNotification(true) )
        }
    },
    computed: {
    },
    created() {
        this.getIsLmsSim()
        this.getAllRecords()
    },
};
</script>
