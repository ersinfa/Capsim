<template>

  <div class="panel panel-primary" v-if="competencyComponent">
    <h2 class="ml-10">{{ competencyComponent.title }}</h2>
    <div class="panel-body">
      <div class="row">
      <template v-if="description">
        <div v-html="description" class="col-md-6">
        </div>
        <div class="col-md-6">
          <chart class="mt-20"></chart>
        </div>
      </template>
      </div>
    </div>
  </div>
</template>

<script>
import chart from './chartCompetencies.vue';
export default {

  components: {
    chart
  },

  computed: {

    description() {
      if(this.competencyComponent){
        let description = this.competencyComponent.description
        Object.keys( this.competencies ).forEach( key => {
          const regex = new RegExp('{' + key + '}', 'g')
          description = description.replace(regex, Math.round(this.competencies[key]))
        })
        return description
      }else{
        return null; 
      }
    },

    competencyComponent() {
      if(this.$store.getters.reportComponents){
        return this.$store.getters.reportComponents.competency
      }
    },

    competencies() {
      return this.$store.state.report.competencies
    }

  }
}

</script>
<style scoped lang="scss">
.panel-body {
  padding: 0 15px;
}

.col-md-6 {
  border-right: 1px solid #e3e3e3;
}

.col-md-6 {
  padding-top: 15px;
  &:first-of-type {
    border-right: 1px solid #f4f4f4;
  }
}
</style>
