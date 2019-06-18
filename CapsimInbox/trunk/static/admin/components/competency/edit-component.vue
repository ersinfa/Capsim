<template>
  <div id="edit-competency-component">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          Edit Competency Component
        </h2>
      </div>
      <div class="panel-body">
        <form>
          <custom-input v-model="competencyComponent.title" :label="'Component Title'" :id="'component-title'"></custom-input>
          <div class="form-group">
            <label for="description">Description: </label>
            <wysiwyg id="comp-description" v-model="competencyComponent.description"></wysiwyg>
            <p class="help-block"><strong>Note: </strong>In order to show the value for a competency, add the desired competency in the editor above in the following way: {name of competency}</p>
          </div>
          <div style="text-align: right;">
            <button class="btn mat btn-success" @click.prevent="update">Update Component</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
export default {

  name: 'edit-competency-component',

  props: {
    versionKey: {
      required: true
    }
  },

  data() {
    return {
        reportComponentsJson: {
          competency: {
            title: '',
            description: ''
          }
        }
      }
  },

  created() {

    let template = {
      reportComponentsJson: {
        competency: {
          title: '',
          description: ''
        }
      }
    }

    this.getVersion()
    .then( version => {
      if( version.reportComponentsJson.competency ) {
        this.$set( this, 'reportComponentsJson', version.reportComponentsJson )
      }
    })
    .catch( err => alert(err.toString()) )
  },

  computed: {

    competencyComponent: {

      get() {
        return this.reportComponentsJson.competency
      },

      set(value) {
        this.reportComponentsJson.competency = value
      }
    }
  },

  methods: {

    getVersion() {

      return new Promise( (resolve, reject) => {
        $.ajax({
          url: `/capsiminbox/admin/api/versions/${this.versionKey}`,
          method: 'get',
          dataType: 'json'
        })
        .done( version => resolve(version) )
        .fail( err => reject(err) )
      })
    },

    update() {

      $.ajax({
        url: `/capsiminbox/admin/api/versions/${this.versionKey}`,
        method: 'put',
        contentType: 'application/json',
        data: JSON.stringify(this.$data)
      })
      .done( data => console.log(data) )
      .fail( err => console.log(err) )

    }
  }

}
</script>
