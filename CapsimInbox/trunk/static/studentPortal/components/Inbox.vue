<template>
    <div class="col-md-12 inbox">
        <h1>Inbox</h1>
        <p class="help-text" v-html="role.scenario"></p>
        <div class="col-md-12 text-center">
            <a v-if="reEntry && studentFiles.length > 0 && studentFiles[0].FK_fileStatusKey == 3" href="/capsiminbox/webapp" class="enter-inbox btn btn-lg btn-success mat mt-20">Re-enter Inbox</a>
            <a v-else-if="!isAssessmentCompleted" href="/capsiminbox/webapp" @click.native="setSelectedKey(key)" class="enter-inbox btn btn-lg btn-success mat mt-20">Enter Inbox</a>
            <span v-else-if="isAssessmentCompleted" class="completed-inbox mat mt-20 p-10"><span class="glyphicon glyphicon-ok"> </span>  Assessment Completed</span>
        </div>

        <br>
        <button v-if="isAssessmentCompleted" @click="nextStep" class="btn btn-success mat pull-right">Next</button>
        <button v-if="!isAssessmentCompleted" @click="previousStep" class="btn btn-info-dark-outline border-radius">Previous</button>

        <modal @closed="surveyClosed" :show-okay="false" id="survey">
            <h4 slot="title">Thanks for completing CapsimInbox!</h4>
            <p slot="body">
                Would you be willing to share 1 minute of your time to provide feedback on your CapsimInbox experience? Thanks!
                <a target="_blank" :href="$store.state.surveyLink">Click here</a>
            </p>
        </modal>
    </div>
</template>
<script>
import modal from '../../shared_components/Modal.vue'
import { mapState } from 'vuex'

export default {

    name: "inbox",

    mixins: [require('../mixins/steps')],

    components: { modal },

    data() {
        return {
            showNext: true,
            breadcrumbs: [],
            currentStep: 1,
            next: 'Report',
            previous: 'Onboarding',
            steps: {
                1: 'Inbox'
            },
			role: {}
        }
    },

    computed: {
        selectedAssessment(){
            return this.$store.getters.selectedAssessment
        },
        reEntry(){
            if(this.selectedAssessment){
                return this.selectedAssessment.versionSettings.reEntry
            }
        },
        studentFiles(){
            return this.selectedAssessment.studentFiles || []
        },
        isAssessmentCompleted() {
            if(this.selectedAssessment){
                return this.$safeGet( this.selectedAssessment.settings, 'assessment.completed', false )
            }
        },
        isComplete() {
            if(this.selectedAssessment){
                return this.$safeGet( this.selectedAssessment.settings, `pages[${this.$route.name}]`, false ) && this.isSurveyCompleted()
            }
        },
    },

    beforeRouteEnter(to, from, next) {
        next( vm => {
                //route back to Dashboard if no selected assessment on the page such as in the event of a page refresh
                if(!vm.$store.state.selectedStsKey){
                    vm.$router.push({ name: "Dashboard"})
                }
                let stsKey = vm.$store.state.selectedStsKey
                vm.$store
                    .dispatch('UPDATE_SESSION', stsKey )
                    .then(()=>{
                        vm.$nextTick( () => {
                            if( vm.isAssessmentCompleted ) {
                                (!vm.isSurveyCompleted()) && $('#survey').modal('toggle')
                                return
                            }
                        })
                    })   
        })
    },

	created() {
          this.getRole()
  	},

    methods: {
        surveyClosed() {
            this.$store.dispatch('SET_SETTING', { key: 'survey', value: true, configName: 'popups' })
        },

        isSurveyCompleted() {
            return this.$safeGet(this.settings, 'popups.survey', false)
        },

		getRole() {
			$.ajax({
				url: '/capsiminbox/student/role',
				method: 'get',
				dataType: 'json'
			})
			.done( role => this.role = role )
			.fail( err => console.log(err) )
        },
        
        // setSelectedKey: function(){
        //    this.$store.state.selectedStsKey = selectedKey
        // }
    }

}
</script>
<style lang="scss" scoped>
// @import "../../../assets/sass/colors";

.enter-inbox {
    // background-color: $third-color;
    color: #ffffff;
    zoom: 2;
}

.completed-inbox {
    background-color: #108137;
    color: #ffffff;
    zoom: 1.5;
}
</style>
