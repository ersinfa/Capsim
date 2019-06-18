<template lang="html">
  <div ref="chartContainer">{{series}}</div>
</template>

<script>
export default {

  name: 'columnChart',

  props: {

    series: {
      required: true
    },
    categories:{
      required: true
    }
  },

  computed: {

    
  },

  methods: {
    buildChart () {
      const chartOptions = {
        chart: {
          type: 'column',
          renderTo: this.$refs.chartContainer,
          height:250
        },
        colors:['#8bbc21'],
        title:{
          text: ""
        },
        credits:{enabled:false},
        plotOptions: {
          series: {
            shadow:false,
            borderWidth:0,
          },
           column: {
            dataLabels: {
                enabled: true,
                format:"{point.y}%"
            },
            enableMouseTracking: false
        }
        },
        xAxis:{
           categories: this.categories,
           
        },
        yAxis:{
          // labels: { format: '${value}'},
          lineColor:'#999',
          lineWidth:1,
          tickColor:'#666',
          tickWidth:1,
          tickLength:3,
          gridLineColor:'#ddd',
          title:{
            text: null
          },
          max:100
        },
        series: this.series
      }

      this.target = new Highcharts.chart(this.$el, chartOptions)
    }
  },

  mounted() {
    this.buildChart()
  }
}
</script>
