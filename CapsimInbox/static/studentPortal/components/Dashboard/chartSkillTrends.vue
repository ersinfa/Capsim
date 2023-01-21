<template>
	<div class="skills-trend-chart" style="min-width: 110px; margin: 0 auto"></div>
</template>

<script>

export default {

    name: "skills-trend-chart",

    props : {
		score : {
            required: true
		}
	},
    data() {
		return {
			target: undefined
		}
	},
	mounted() {
		this.buildChart();
	},
	methods: {
		buildChart() {
			let chartOptions = {
					chart: {
                        type: 'line',
                         margin: [0, 100, 0, 100]
                    },
                    title: {
                        text: ''
                    },
                    xAxis: {
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                        lineColor: 'transparent',
                        labels: {
                            enabled: false
                        },
                        minorTickLength: 0,
                        tickLength: 0
                    },
                    yAxis: {
                        min: 0,
                        max: 100,
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                        gridLineColor: 'transparent',
                        lineColor: 'transparent',
                        labels: {
                            enabled: false
                        },
                        title: {
                            text: ''
                        },
                        minorTickLength: 0,
                        tickLength: 0
                    },
                    tooltip: {
                        backgroundColor: {
                        linearGradient: [0, 0, 0, 60],
                        stops: [
                            [0, '#FFFFFF'],
                            [1, '#E0E0E0']
                        ]
                        },
                        borderWidth: 1,
                        borderColor: '#AAA',
                        formatter: function() {
                            return this.point.name;
                        }
                    },
                    plotOptions: {
                        line: {
                            dataLabels: {
                                enabled: true
                            }
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    series: [{
                        data: this.score.scores,
                        color: "#003F55"
                    }],
                    credits: {
                        enabled: false
                    }
			}
			this.target = new Highcharts.chart(this.$el, chartOptions)
		},
	}

}


</script>
<style lang="css">
.skills-trend-chart {
	height: 100px;
    max-width: 600px;
	margin-left: auto;
	margin-right: auto;

}

</style>
