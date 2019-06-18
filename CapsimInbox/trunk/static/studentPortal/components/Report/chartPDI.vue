<template>
	<div class="index-chart"></div>
</template>

<script>

export default {
	// name : "Chart",
	props : {
		data : {
			required: true
		},
		xCategories : {
			required: true
		},
		yCategories : {
			required: true
		},
	},
	data() {
		return {
			// target: undefined
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
					type: 'heatmap',
					plotBorderWidth: 1,
					width: chartWidth
				},

				title: {
					text: ''
				},

				xAxis: {
					categories: this.xCategories,
				},

				yAxis: {
					categories: this.yCategories,
					title: null
				},

				colorAxis: {
					min: 0,
					minColor: '#FFFFFF',
					maxColor: Highcharts.getOptions().colors[0]
				},

				legend: {
					enabled: false,
				},

				tooltip: {
					enabled: false,
					// formatter: function () {
					//     return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> sold <br><b>' +
					//         this.point.value + '</b> items on <br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
					// }
				},
				series: [{
					name: 'Sales per employee',
					borderWidth: 1,
					data: this.data,
					dataLabels: {
						color: '#000000'
					}
				}]
			}
			this.target = new Highcharts.chart(this.$el, chartOptions)
		},
	},

	beforeDestroy: function() {
		this.target.destroy();
	}
}


</script>
<style scoped lang="css">
.index-chart {
	height: 300px;
	margin-left: auto;
	margin-right: auto;
}
</style>
