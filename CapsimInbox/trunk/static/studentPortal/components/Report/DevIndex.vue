<template>
    <div class="panel panel-primary">
			<h2 class="ml-10">Development Index</h2>
		<div class="panel-body">
			<div class="row">
				<div class="col-md-7">
					<chart class="mt-20" :data="chartdata.data" :xCategories="chartdata.xCategories" :yCategories="chartdata.yCategories"></chart>
				</div>
				<div class="col-md-5">
					<div class="lead" v-html="message"></div>
				</div>
			</div>
		</div>
    </div>
</template>

<script>
import chart from './chartPDI.vue';
export default {

    props:{
        chartdata:{
            required: true
        },
        message:{
            required: true
        },
    },

    components: {
        chart
    }
}

</script>
<style scoped lang="scss">

	.panel-body {
		padding: 0 15px;
	}

	.col-md-7 {
		border-right: 1px solid #e3e3e3;
	}

	.col-md-5 {
		padding-top: 15px;
		&:first-of-type {
			border-right: 1px solid #f4f4f4;
		}
	}
</style>
