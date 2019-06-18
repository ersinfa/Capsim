<template>
	<div class="panel panel-primary">
		<h2 class="ml-10">Skill Gap</h2>
		<div class="panel-body">
			<div class="lead">
				<div class="mb-5">
					Legend of bar
				</div>
				<div v-if="versionKey !== 70">
					<circle-icon :radius="10" :color="'#003f54'"></circle-icon> Self-Assessment Score
				</div>
				<div>
					<rect-icon :size="20" :color="'#003f54'"></rect-icon> Inbox Assessment Score
				</div>
			</div>
			<table class="lead">
				<template v-for="skill in skills">
					<tr v-if="isPrint">
						<td style="padding: 40px 10px 0px 10px !important">
							<b>{{ skill.name }}</b>
							<br>
							{{ skill.description }}
						</td>
					</tr>
					<tr>
						<th v-if="!isPrint">
							{{ skill.name }}
							<a class="hidden-print" data-toggle="tooltip" data-placement="top" :title='skill.description' data-original-title><span class="glyphicon glyphicon-info-sign"></span></a>
						</th>
						<td :style="{ isPrint: 'padding: 35px 10px 40px 10px !important'}">
							<div class="progress" style="position: relative;overflow: visible;">
								<div class="progress-bar progress-bar-danger progress-bar-striped" style="width: 29%"></div>
								<div class="progress-bar progress-bar-warning progress-bar-striped" style="width: 39%"></div>
								<div class="progress-bar progress-bar-success progress-bar-striped" style="width: 32%"></div>
								<div style="width:97%;position: relative;">
									<span v-bind:style="`left: ${(skill.gameScore.length == 1) ? (parseInt(skill.gameScore) + 0.5) : skill.gameScore}%;position: absolute; top: 30px;}`" >{{ skill.gameScore }} </span>
									<template v-if="versionKey !== 70">
										<span v-bind:style="`left: ${skill.selfScore-0.2}%;position: absolute; top: -35px;}`" >{{ skill.selfScore }} </span>
									</template>
									<span v-bind:style="`left: ${skill.gameScore}%;position: absolute; top: 10px;}`"  aria-hidden="true">
										<rect-icon :size="20" :color="'#003f54'"></rect-icon>
									</span>
									<template v-if="versionKey !== 70">
										<span v-bind:style="`left: ${skill.selfScore}%;position: absolute; top: -10px;}`" aria-hidden="true">
											<circle-icon :radius="10" :color="'#003f54'"></circle-icon>
										</span>
									</template>
								</div>
							</div>
						</td>
					</tr>
				</template>
			</table>
		</div>
	</div>

</template>

<script>

export default {

	name: "SkillGap",

	props:{
		skills:{
			required: true
		},
	},

	computed: {
        versionKey(){
            if(this.$store.state){
                return this.$store.state.versionKey; 
            }
        }, 
		isPrint() {
			return this.$store.state.isPrint
		}
	},

	mounted(){
		$(function () {
			$('[data-toggle="tooltip"]').tooltip()
		})
	}
}

</script>

<style scoped lang="scss">

.panel {
	width: 100%;
}

.progress-row {
	border-top: 1px solid #e3e3e3;
	border-bottom: 1px solid #e3e3e3;
	padding: 10px;
}

table{
	width: 100%; margin-bottom: 20px;
	tr{
		th:first-child{
			width: 250px;
		}
		td{
			padding: 40px 10px
		}
	}
	.progress{
		margin-bottom:0
	}
}
.spacing-left{
	margin-left:15px;
}
.spacing-right{
	margin-right:15px;
}

@media print
{
	.skill-gap {
		margin-top: 100px !important;
	}

	.progress {
		-webkit-print-color-adjust: exact !important;
		width: 100%;

		.progress-bar {
			width: 100%;
			-webkit-print-color-adjust: exact !important;

			&.progress-bar-danger {
				background-color: #d9534f !important;
				-webkit-print-color-adjust: exact !important;
			}

			&.progress-bar-warning {
				background-color: #f0ad4e !important;
				-webkit-print-color-adjust: exact !important;
			}

			&.progress-bar-success {
				background-color: #5cb85c !important;
				-webkit-print-color-adjust: exact !important;
			}
		}
	}

}
</style>
