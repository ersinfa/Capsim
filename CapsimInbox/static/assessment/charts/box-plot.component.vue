<template>
    <div id="capsim-webapp-box-plot-chart"></div>
</template>
<script>
import initialOptions from './box-plot.options';
export default {
    name: 'capsim-webapp-box-plot-chart',
    data () {
        return {
            options: initialOptions
        };
    },
    props: {
        series: {
            type: Array,
            default: []
        }
    },
    computed: {
        chart () {
            const series = this.series
            return Object.assign({}, this.options, { series });
        }
    },
    mounted () {
        this.target = new Highcharts.chart(this.$el, this.chart); // eslint-disable-line new-cap
    }
};
</script>

