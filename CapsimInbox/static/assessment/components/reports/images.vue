<template>
  <div class="text-center" :style="{ height: pageHeight }" style="overflow-y: auto;">
    <img v-if="$store.state.isExam == 1" :src="`/capsiminbox/images/${$route.params.id}`" :alt="altText" style="max-width: 1200px">
  </div>
</template>

<script>
    export default {
        name: 'images',
        props:['id'],
        data() {
          return {
            windowHeight: 0,
          }
        },
        methods: {
          
        },
        computed: {
          pageHeight() {
              return `${this.windowHeight}px`
          },
          altText() {
              return (this.$route.params.id == 'scatterplot.png'? "Scatter Plot Graph" : this.$route.params.id == 'boxplot.png'?  'Box Plot Graph' :  (this.$route.params.id == 'supplydemand.jpg')? 'Supply/Demand Diagram' : "Graph")
          },
        },
         beforeRouteEnter (to, from, next) {
          document.title = (to.params.id == 'scatterplot.png')? 'Scatter Plot' : (to.params.id == 'boxplot.png')? 'Box Plot' : (to.params.id == 'supplydemand.jpg')? 'Supply/Demand Diagram': "MODEX"
          next()
        },
        mounted() {
          this.windowHeight = window.innerHeight
          this.$nextTick(() => {
              window.addEventListener('resize', () => {
                  this.windowHeight = window.innerHeight
              });
          })
        }
    }
</script>