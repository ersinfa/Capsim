<template>
	<div class="panel panel-primary">
		<h2 class="ml-10">Overall Performance</h2>
		<div class="m-15">
			<chart class="mt-20" :score="score"></chart>
			<!-- Fix -->
			<template v-if="versionKey == 70">
				<h3 class="text-center mt-30">{{ score | badPercent }}</h3>
				<div class="lead" v-html="message"></div>
			</template>
			<template v-else>
				<h3 class="text-center mt-30">{{ score | getOrdinal }}</h3>
				<div class="lead" v-html="message"></div>
			</template>
		</div>
	</div>
</template>

<script>
import chart from './chartOverall.vue';

export default {

	name: "OverallScore",

	components: {chart},

	props:{
		score:{
			required: true
		},
		message:{
			required: true
		}, 
		scoreFilter:{}
	},
	// Fix verisonKey checks, no time. 
	computed: {
        versionKey(){
            if(this.$store.state){
                return this.$store.state.versionKey; 
            }
        }, 
	},

	filters: {
		getOrdinal(n) {
			const s = ["th","st","nd","rd"]
			const v = n % 100
			return `${n+(s[(v-20)%10]||s[v]||s[0])} Percentile`
		},
		// Fix, prop filter showing undefnined, have to do  
		// getOrdinal(n) {
		// 	return this.scoreFilter(n)
		// }
		badPercent(n){
			return `${n}%` 
		}
	}
}

</script>

<style lang="scss" scoped>

</style>
