<template>
    <div class="panel">
		<h2 class="ml-10">Self Awareness</h2>
		<div class="panel-body">
			<div class="row">
				<div class="col-md-6" v-if="score">
					<chart class="mt-20" :score="score"></chart>
				</div>
			 	<div class="col-md-6">
					<div class="lead" v-html="message"></div>
				</div>
			</div>
		</div>
    </div>
</template>

<script>

import chart from './chartSelfAwareness.vue';
export default {
    name: "SelfAwareness",
    components : {chart},
    props:{
        score:{
            required: true
        },
        message:{
            required: true
        },
    }
}

</script>

<style lang="scss" scoped>

.panel-body {
	padding: 0 15px;
}

.col-md-6 {
	padding: 15px 15px;
	&:first-of-type {
		border-right: 1px solid #e3e3e3;
	}
}
</style>
