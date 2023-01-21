<template>
    <div class="col-md-12" id="interface-breakdown">

        <!-- <ol class="breadcrumb">
            <li v-for="breadcrumb in breadcrumbs">{{ breadcrumb }}</li>
        </ol> -->

        <div v-show="currentStep === 1" class="step-1">
          <h1>Your Role</h1>
          <div v-html="role.role"></div>
          <template v-if='!hideWelcomePDF'>
            <h2>Your Company</h2>
            <br>
            <object v-if="role.pdfFile" width="100%" height="1200px" :data="`${$store.state.assetsPath}/capsiminbox/pdfs/${role.pdfFile}`"></object>
          </template>  
        </div>

        <div v-if="currentStep === 2">
          <iframe id="rehearsal" src="/capsiminbox/rehearsal" style="width: 100%;height: 800px;border: 1px solid #fff;"></iframe>
        </div>

        <div class="mt-20">
          <button v-show="showNext" @click="nextStep" class="btn btn-success mat pull-right">Next</button>
        </div>
        <div class="mt-20">
          <button @click="previousStep" class="btn btn-info-dark-outline border-radius">Previous</button>
        </div>
 
    </div>
</template>
<script>
export default {

    name: "interface-breakdown",

    mixins: [ require('../mixins/steps') ],

    data: () => ({
        breadcrumbs: [],
        showNext: true,
        next: 'Inbox',
        previous: 'Self Assessment',
        currentStep: 1,
        steps: {
            1: 'Your Role',
            2: 'Onboarding'
        },
        role: {}
    }),


    created() {
        // this.breadcrumbs.push(this.steps[1])
        this.getRole()
    },

    computed: {
        isAssessmentCompleted() {
            if(this.$store.getters.selectedAssessment){
                return this.$safeGet(this.$store.getters.selectedAssessment.settings, 'assessment.completed', false) 
            }    
        },

        hideWelcomePDF() {
            if(this.$store.getters.selectedAssessment){
                return this.$safeGet(this.$store.getters.selectedAssessment.versionSettings, 'hideWelcomePDF', false) 
            }    
        },
    },

    beforeRouteEnter(to, from, next) {
        next(vm => {
            if(!vm.$store.state.selectedStsKey){
                vm.$router.push({ name: "Dashboard"})
            } 
            (vm.isAssessmentCompleted) ? vm.$router.push({ name: vm.next }) : true
        })
    },
    methods: {

      getRole() {
        $.ajax({
          url: '/capsiminbox/student/role',
          method: 'get',
          dataType: 'json'
        })
        .done( role => this.role = role )
        .fail( err => console.log(err) )
      }
    }
}
</script>
<style lang="scss" scoped>
.img-responsive {
    border: 1px solid #e1e1e1;
}


</style>
