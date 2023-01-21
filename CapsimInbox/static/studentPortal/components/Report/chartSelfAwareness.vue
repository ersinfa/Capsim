<template>
	<div class="awareness-chart"></div>
</template>

<script>
export default {
	// name : "Chart",
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
			let chartWidth = (this.$store.state.isPrint) ? (this.$el.parentElement.offsetWidth/3) : this.$el.parentElement.offsetWidth - 30
			let chartOptions = {
				credits: {
					enabled: false
				},
				chart: {
					type: 'solidgauge',
					width: chartWidth
				},
				title: null,
				pane: {
					center: ['50%', '85%'],
					size: '160%',
					startAngle: -90,
					endAngle: 90,
					background: {
						backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
						innerRadius: '60%',
						outerRadius: '100%',
						shape: 'arc'
					}
				},
				tooltip: {
					enabled: false
				},
				yAxis: {
					stops: [
						[0.2, '#DF5353'], // red
						[0.5, '#DDDF0D'], // yellow
						[0.9, '#55BF3B'] // green
					],
					lineWidth: 0,
					labels: {
						y: 16
					},
					minorTickInterval: null,
					tickAmount: 7,
					min: 0,
					max: 6,
					tickmarkPlacement: 'on',

				},
				plotOptions: {
					solidgauge: {
						dataLabels: {
							// y: 0,
							y: 0,
							borderWidth: 0,
							useHTML: true
						}
					}
				},
				series: [{
					name: 'Self Awareness',
					data: [this.score],
					dataLabels: {
						format: '<h3><b>{y}</b></h3>'
					},
				}]

			}
			this.target = new Highcharts.chart(this.$el, chartOptions)
		},
	},
	beforeDestroy: function() {
		this.target.destroy();
	},
}
</script>
<style lang="css">
.awareness-chart {
	height: 200px;
	margin-left: auto;
	margin-right: auto;
}
</style>
