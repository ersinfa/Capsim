<template>
    <div class="panel panel-primary">
		<h2 class="ml-10">Written Responses</h2>
		<div class="panel-body">
			<div class="row">
				<div class="col-md-6" v-if="score" style="text-align: center;">
					<h1>{{score}} / 100</h1>
				</div>
				<div class="col-md-6">
					<div class="lead" v-html='message'></div>
				</div>
			</div>
		</div>
    </div>
</template>

<script>

import chart from './chartWrittenResponse.vue';
export default {
    name: "WrittenResponse",
    components : {chart},
    props:{
        score:{
            required: true
        },
        message:{
            required: true
        }
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
