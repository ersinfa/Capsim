<template>
  <div id="create-drive">
      <div class="panel panel-default">
          <div class="panel-heading">
              <h2>
                <back-button></back-button>
                Create Question group
              </h2>
          </div>
          <div class="panel-body">
              <div class="form-group">
                  <label for="name">Name</label>
                  <input v-model="name" type="text" class="form-control">
              </div>
              <div class="form-group">
                  <button @click="createQuestionGroup" class="btn mat btn-primary">Create</button>
              </div>
          </div>
      </div>
  </div>
</template>
<script>
export default {

  name: "create-question-group",

  data() {
    return {
        name: '',
    }
  },
  
  props: {
    versionKey: {
      required: true
    }
  },

  methods: {

      createQuestionGroup() {

          let payload = {
            name: this.name,
            FK_versionKey: this.versionKey
          }
          this.$store.dispatch('questionGroup/CREATE_RESOURCE', payload)
          .then( questionGroup => this.$router.push({ name: 'edit-question-group', params: { resourceKey: questionGroup.questionGroupKey } }) )
          .catch( () => alert('Error while creating your Question Group') )
      },

  }
}
</script>
