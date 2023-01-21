<template>
  <div id="competency-index">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h2>
          <back-button></back-button>
          {{ competency.name }}
        </h2>
      </div>
      <div class="panel-body">
        <form>
          <div class="form-group">
            <label for="name">Name</label>
            <input id="name" class="form-control" type="text" v-model="competency.name">
          </div>
          <button @click.prevent="update" class="btn mat btn-primary">Update</button>
        </form>
      </div>
      <template v-if="competency.developmentalTactic">
        <div class="panel-body">
            <hr>
            <h4>Developmental Tactic</h4>
            <p v-html="competency.developmentalTactic"></p>
        </div>
      </template>
    </div>
  </div>
</template>
<script>

export default {

  name: "show-competency",

  props: {
    resourceKey: {
      required: true
    }
  },

  data() {
    return {
      competency: {},
      resourceUrl: `/capsiminbox/admin/api/competencies/${this.resourceKey}`
    }
  },

  methods: {
    getCompetency() {
      $.ajax({
        url: this.resourceUrl,
        method: 'get',
        dataType: 'json'
      })
      .done( data => this.competency = data )
      .catch( err => console.log(err) )
    },

    update() {
      $.ajax({
        url: this.resourceUrl,
        method: 'put',
        data: {
          name: this.competency.name,
        }
      })
      .done( data => console.log(data) )
      .fail( err => console.log(err) )
    }
  },

  created() {
    this.getCompetency()
  }
}
</script>
<style lang="scss" scoped>
</style>
