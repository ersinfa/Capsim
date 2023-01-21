<template>
	<div class="competencies-chart" style="height: 350px"></div>
</template>

<script>

export default {

	name: "competencies-chart",

	mounted() {
		this.buildChart();
	},

	methods: {
		buildChart() {
			let chartWidth = (this.$store.state.isPrint) ? (this.$el.parentElement.offsetWidth/3) : this.$el.parentElement.offsetWidth - 15
			let chartOptions = {
				credits: {
					enabled: false
				},
				chart: {
					type: 'column',
					width: chartWidth,
					spacingRight: 30
				},
				title: {
					text: null
				},
				xAxis: {
					visible: false
				},
				yAxis: {
					min: 0,
					max: 100,
					title: {
						text: 'Percentage (%)'
					}
				},
				tooltip: {
					headerFormat: '',
					pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
					'<td style="padding:0"><b>{point.y} %</b></td></tr>',
					footerFormat: '</table>',
					shared: false,
					useHTML: true
				},
				plotOptions: {
					column: {
						pointPadding: 0.8,
						borderWidth: 0,
						pointWidth: 25
					}
				},
				series: this.series
			}

			this.target = new Highcharts.chart(this.$el, chartOptions)
		},
	},

	computed: {
		series() {
			return Object.keys(this.competencies)
					.map( key => ({
						name: key.split(' ').map( st => st[0] ).join('').toUpperCase(),
						data: [Math.round(this.competencies[key])]
					}))
		},
		competencies() {
			return this.$store.state.report.competencies
		}
	}
}


</script>
<style lang="css">
.index-chart {
	height: 300px;
	margin-left: auto;
	margin-right: auto;
}
</style>
