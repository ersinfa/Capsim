<template>
  <div id="version-role">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h1>
          <back-button></back-button>
          Company Information
        </h1>
      </div>
      <div class="panel-body">
        <div class="form-group">
          <label for="scenario">Situation: </label>
          <p>List all relevant company details that will help the participant understand the scenario prior to entering the assessment, including name, description, industry, and so on.</p>
          <wysiwyg id="scenario" v-model="company.scenario"></wysiwyg>
        </div>
        <div class="form-group">
          <label for="role">Role: </label>
          <p>What position or situation will the participants taking your assessment be in? Examples would be, Junior Consultant - Internal Audit or Manager - Product Design & Development.</p>
          <wysiwyg id="role" v-model="company.role"></wysiwyg>
        </div>
        <div class="form-group">
          <label for="pdfFile">PDF: </label>
          <p>Attach a PDF with your company details. This could include the company mission/vision, values, or key products.</p>
          <input id="pdfFile" @change="handleFile($event.target.files)" type="file" rows="8" cols="80">
        </div>
        <object v-if="company.pdfFile" width="100%" height="1200px" :data="`${$store.state.assetsPath}/capsiminbox/pdfs/${company.pdfFile}`"></object>
        <div class="form-group">
          <button @click="createRole" v-if="company.isNew" class="btn mat btn-primary pull-right">Create</button>
          <button @click="updateRole" v-else class="btn mat btn-primary pull-right">Update</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {

  name: "version-role",

  data() {
    return {
      company: {
        role: '',
        scenario: '',
        pdfFile: '',
        isNew: false
      }
    }
  },

  props: {
    resourceKey: {
      required: true
    }
  },

  created() {
    this.getRole()
  },

  methods: {

    getRole() {

      this.$store.dispatch('role/GET_RESOURCE', this.resourceKey)
      .then( companyInfo => this.company = companyInfo )
    },

    handleFile( files ) {
      const reader = new FileReader()
      reader.onload = ( e ) => this.company.newFile = e.target.result.replace(/^data:application\/\w+;base64,/, '')
      reader.readAsDataURL(files[0])
    },

    updateRole() {

      let payload = {
        ...this.company,
        newFile: this.company.newFile
      }

      this.$store.dispatch('role/SAVE_RESOURCE', { payload, resourceKey: this.company.roleKey })
      .then( role => this.company = role )
    },

    createRole() {

      let payload = {
        ...this.company,
        newFile: this.company.newFile,
        FK_versionKey: this.resourceKey
      }

      this.$store.dispatch('role/CREATE_RESOURCE', payload)
      .then( role => this.company = role )
    }
  }

}
</script>
