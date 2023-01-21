<template>
  <div id="show-version" class="panel panel-default">

    <loader v-if="isLoading"></loader>
    <template v-else>

    <div class="panel-heading">
      <h2>
        <back-button></back-button>
        {{ versionObject.versionName }}
      </h2>
    </div>

    <div v-if="versionObject.versionKey" class="panel-body">

      <div class="row">
        <div class="col-md-12">
          <div class="page-header">
            <h3>Assessment Length</h3>
          </div>
          <p>Determine how much time (in minutes) that participants will have to complete the assessment.</p>
          <strong>Timer: </strong>{{ versionObject.timer }}
        </div>
      </div>

      <!-- Skills and competencies -->

      <div class="row">

        <div id="skills" class="col-md-12 mb-20">
          <div class="page-header">
            <h3>
              Assessment Measures
            </h3>
          </div>
          <p>Set the skills on which participants will be assessed. Most assessments measure 5 skills.</p>
        </div>

        <div class="col-md-12 mb-20">
          <h4>Skills</h4>
          <p>
            Participants will complete a self-assessment on these measures before they begin your assessment.
          </p>
        </div>

        <div class="col-md-12 mb-30">
          <skill-list :version-active="1" :skills="versionObject.skills"></skill-list>
        </div>

        <div id="competencies" class="col-md-12 mb-20">
          <h4>Additional Competencies(optional)</h4>
          <p>List any additional competencies you would like to measure. Participants will NOT complete a self-assessment on these measures.</p>
        </div>

        <div class="col-md-12">
          <competencies-list :version-active="1" :competencies="versionObject.competencies"></competencies-list>
        </div>

      </div>

      <!-- End of skills and competencies -->


      <!-- Authors, questions and drive folders -->

      <div class="row">

        <div class="col-md-12">
          <div class="page-header">
            <h3>Assessment Content</h3>
          </div>
          <p>
            Create the content that will make up your assessment. This includes the scenario your participants will enter into, the participant's role in the scenario, emails and messages that participants will receive, email/message authors, and email attachments.
          </p>
        </div>

        <div class="col-md-12 mb-20">
          <h4>Scenario</h4>
          <p>Create the scenario around the assessment. Typically this includes the company your participants will work in and their role in the company.</p>
          <router-link class="btn mat btn-primary" :to="{ name: 'show-role-version', params: { resourceKey: versionObject.versionKey }}">
            Show
          </router-link>
        </div>

        <div class="col-md-12 mb-10">
          <h4 class="mb-15">Authors</h4>
          <p>
            Create names and positions for the authors of the emails and messages in the assessment. These are the people that send your participants emails and messages. Responses to these authors are what determines correct and incorrect answers.
          </p>
        </div>

        <div class="col-md-12 mb-30">
          <authors-list  :authors="versionObject.authors" :version-active="1"></authors-list>
        </div>

        <div id="questions" class="col-md-12 mb-10">
          <h4 class="mb-15">Emails/Messages</h4>
          <p>
            Create the emails and IMs that fill up your participants' inboxes. For each email or IM, you can create responses that earn full and/or partial credit. On average, each email/message will take between 1-3 minutes on average.
          </p>
        </div>

        <div class="col-md-12 mb-30">
          <questions-list :emails="emails" :messages="messages" :authors="versionObject.authors" :version-active="1">
          </questions-list>
        </div>

        <div id="drive" class="col-md-12 mb-10">
          <h4 class="mb-15">Attachments</h4>
          <p>
            Add any files or images that participants will need to use in order to correctly answer your emails or messages. These typically include organizational charts, budgets, or historical data.
          </p>
        </div>

        <div class="col-md-12">
          <folders-list :folders="versionObject.folders" :version-active="1"></folders-list>
        </div>

      </div>

      <!-- End of authors, questions and drive folders -->

      <!-- Time Bonus and Priority Bonus -->

      <div class="row">
        <div class="col-md-12">
          <div class="page-header">
            <h3>
              Assessment Scoring Bonuses (optional)
            </h3>
          </div>
          <p>
            Customize your scoring with bonus options for time completion and priority responses.
          </p>
        </div>

        <div class="col-md-12">
          <h4>Time Bonus</h4>
          <p>
            Add the option to give additional points to participants who complete the assessment in a certain time. If, on average, your assessment takes 45 minutes, you may want to reward participants that complete the assessment in 35 minutes or less (around 20% faster than normal).
          </p>
        </div>

        <div class="col-md-12 mb-30">

          <form class="form-inline">

            <div class="form-group">
              <strong>Up to {{ range1 }} minutes</strong>
            </div>
            -
            <div class="form-group ml-10">
              <strong> Multiplier {{ versionObject.timeBonusJson.multiplier1 }} x </strong>
            </div>

            <div class="clearfix mb-10"></div>

            <div class="form-group">
              <strong>Up to {{ range2 }} minutes</strong>
            </div>
            -
            <div class="form-group ml-10">
              <strong> Multiplier {{ versionObject.timeBonusJson.multiplier2 }} x </strong>
              <span>(i.e. entering 1.1 would give participants a 10% boost in this range)</span>
            </div>

          </form>

        </div>


        <div class="col-md-12">
          <h4>Priority Bonus</h4>
          <p>
            Add the option to give additional points to participants who answer important emails or IMs first to reward their organization skills. Typically, participants have between 3-7 priority emails/IMs in a list of 20 total.
          </p>
        </div>

        <div class="col-md-12">
          <table v-if="Object.keys(versionObject.priorityBonusJson).length > 0" class="table">
            <thead>
              <tr>
                <th>Points</th>
                <th>Answered</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!isNaN(key)" v-for="(obj, key) in versionObject.priorityBonusJson">
                <td> {{ obj.points }} </td>
                <td> {{ obj.answered }} </td>
                <td> {{ obj.max }} </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-primary">No Priority Bonus assigned to this version</p>
        </div>

      </div>

      <!-- End of Time Bonus and Priority Bonus -->

      <!-- Product information, demo, survey, and combined scoring. -->

      <div class="row">

        <div class="col-md-12">

          <div class="page-header">
            <h4>Product Information</h4>
          </div>

          <div class="mb-20">
            <span>
              <a :href="`${$store.state.assetsPath}/capsiminbox/images/CapsimInbox_Logo_mainLogo_${versionObject.versionKey}.png`" target="_blank" class="btn mat btn-info">Main Logo Link</a>
            </span>

            <span>
              <a :href="`${$store.state.assetsPath}/capsiminbox/images/CapsimInbox_Logo_assessment_${versionObject.versionKey}.png`" target="_blank" class="btn mat btn-info">Assessment Logo Link</a>
            </span>
          </div>

          <div class="mb-20">
            <strong>Is Sellable: </strong> {{ versionObject.isSellable ? 'Yes' : 'No' }}
          </div>

          <div class="mb-20">
            <strong>Description: </strong>
            <div class="well" v-html="versionObject.description"></div>
          </div>

          <div class="mb-20">
            <strong> Demo URL: </strong> {{ versionObject.demoUrl }}
          </div>

          <div class="mb-20">
            <strong>Demo Email: </strong> {{ versionObject.demoEmail }}
          </div>

          <div class="mb-20">
            <strong>Survey Link: </strong> {{ versionObject.surveyLink }}
          </div>

          <div class="mb-20">
            <div class="form-group">
              <label for="combine-scoring">Combine Scoring With: </label>
              <select disabled v-model="versionObject.combineScoringJson" multiple class="form-control w-50" id="combine-scoring">
                <option v-for="version in allVersions" :value="version.versionKey">{{ version.versionName }}</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      <!-- End Product information, demo, survey, and combined scoring. -->

    </div>
  </template>
  </div>
</template>
<script>

export default {

  name: 'show-version',

  props: {
    resourceKey: {
      required: true
    }
  },

  components: {
    skillList: require('../skill/list.vue'),
    competenciesList: require('../competency/list.vue'),
    questionsList: require('../question/list.vue'),
    authorsList: require('../author/list.vue'),
    foldersList: require('../drive/list.vue')
  },

  data() {
    return {
      resourceUrl: `/capsiminbox/admin/api/versions/${this.resourceKey}`,
      versionObject: {
        timeBonusJson: {},
        priorityBonusJson: {}
      },
      questions: [],
      allVersions: [],
      isLoading: true
    }
  },

  methods: {

    getVersion() {
      return new Promise( (resolve, reject) => {
        $.ajax({
          url: this.resourceUrl,
          method: 'GET',
          dataType: 'json'
        })
        .done( data => resolve( data ) )
        .catch( err => reject( err ) )
      })
    },

    getVersions() {
      return new Promise( (resolve, reject) => {
        $.get('/capsiminbox/admin/api/versions')
        .done( versions => resolve(this.getValidVersions(versions)) )
        .catch( err => reject(err) )
      })
    },

    getValidVersions(versions) {
      const mainSkills = this.versionObject.skills.map( s => s.name )
      const validVersions = versions.filter( v => {
        let isValid = false

        if( v.versionKey == this.resourceKey ) return false
        else if( v.skills.length > 0 ) isValid = v.skills.map( s => s.name ).every( name => mainSkills.indexOf(name) > -1 )

        return isValid
      })
      return validVersions
    }

  },

  computed: {

    emails() {
      return this.versionObject.questions.filter( question => question.FK_questionDisplayTypeKey === 1 )
      .sort( (e1, e2) => (e1.sequence < e2.sequence) ? -1 : (e1.sequence > e2.sequence) ? 1 : 0 )
    },

    messages() {
      return this.versionObject.questions.filter( question => question.FK_questionDisplayTypeKey === 2 )
    },

    range1: {
      get() {
        return this.versionObject.timeBonusJson.range1/60000
      },

      set(val) {
        this.versionObject.timeBonusJson.range1 = val * 60000
      }
    },

    range2: {
      get() {
        return this.versionObject.timeBonusJson.range2/60000
      },

      set(val) {
        this.versionObject.timeBonusJson.range2 = val * 60000
      }
    },
  },

  mounted() {

    this.getVersion()
    .then( version => { this.$set(this, 'versionObject', version); this.$set(this, 'questions', version.questions) })
    .then( () => this.getVersions() )
    .then( versions => this.$set(this, 'allVersions', versions) )
    .then( () => setTimeout( () => this.isLoading = false, 500 ) )
    .catch( err => console.log(err) )
  },

}
</script>
<style lang="scss" scoped>

  h3 {
    font-weight: 800;
  }
</style>
