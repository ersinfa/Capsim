<template>
    <div class="panel panel-primary">
		<h2 class='ml-10'>Key Indexes</h2>
		<div class="panel-body">
			<div class="row">
				<div class="col-md-6">
                    <h3>Prioritization Index</h3>
                    <chart class="mt-20" :score="keyIndexesScores.Prioritization"></chart>
                    <div class="lead" v-html="prioritizationMsg"></div>
                    <div class="lead" v-html="prioritizationPercentileMsg"></div>
				</div>
				<div class="col-md-6">
                    <h3>Procrastination Index</h3>
                    <chart class="mt-20" :score="7 - keyIndexesScores.Procrastination"></chart>
                    <div class="lead" v-html="procrastinationMsg"></div>
                    <div class="lead" v-html="procrastinationPercentileMsg"></div>
				</div>
			</div>
		</div>
    </div>
</template>

<script>

import chart from './chartKeyIndexes.vue';
export default {
    name: "KeyIndexes",
    components : {chart},
    props:{
        keyIndexesScores:{
            required: true
        }
    },
    data(){
        return {
            prioritizationMsg:`There were 7 emails or messages in CapsimInbox that were both highly important and time-urgent to address. <b>You correctly prioritized and addressed ${this.keyIndexesScores.Prioritization} of these 7.</b>`,
            procrastinationMsg: `There were 7 specific situations in CapsimInbox that gave you the option to delay the problem at hand.<b>You correctly avoided procrastination in ${7 - this.keyIndexesScores.Procrastination} of these 7.`,
            prioritizationPercentileMsg:`Your prioritization index score was at the ${this.getOrdinal(this.keyIndexesScores.PrioritizationPercentile)}, which means you prioritized better than ${this.keyIndexesScores.PrioritizationPercentile}% of the CapsimInbox database.`,
            procrastinationPercentileMsg: `Your procrastination index score was at the ${this.getOrdinal(100 - this.keyIndexesScores.ProcrastinationPercentile)}, which means you avoided procrastination more than ${100 - this.keyIndexesScores.ProcrastinationPercentile}% of the CapsimInbox database.`
        }
    },
    methods:{
        getOrdinal(n) {
			const s = ["th","st","nd","rd"]
			const v = n % 100
			return `${n+(s[(v-20)%10]||s[v]||s[0])} Percentile`
		},
    }
}

</script>

<style lang="scss" scoped>

.panel-body {
	padding: 0 15px;
}

.col-md-6 {
	padding: 0 15px 0 15px;
	&:first-of-type {
		border-right: 1px solid #e3e3e3;
	}
}
</style>
