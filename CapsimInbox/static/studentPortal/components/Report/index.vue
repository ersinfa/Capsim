<template>
	<div>
		<template v-if="!isReportAvailable">
			<div class="alert alert-info lead" role="alert">
				Report will be available {{ reportAvailableDate }} 
			</div>
		</template>
		<template v-else>
			<div class="hidden-print">
				<button class="btn btn-info-dark-outline pull-right" @click="print">Print</button>
				<h1>Feedback Report</h1>
				<ol class="breadcrumb">
					<li><router-link to="Dashboard">Dashboard</router-link></li>
					<li v-for="breadcrumb in breadcrumbs">{{ breadcrumb }}</li>
				</ol>
			</div>


			<div v-if="$store.state.isPrint" class="to-print page-break" ref="toPrint">

				<div class="row"  style="page-break-after: always">
					<div class="col-md-12 text-center first-page">
						<h1>Feedback <br> Report</h1>
						<div class="student-info">
							<h3>{{ fullName }}</h3>
							<h3>{{ $moment().format('MMMM DD, YYYY') }}</h3>
						</div>
					</div>
				</div>

			</div>

		<!-- </div> -->
		
			<div class="row page-break">
				<div class="col-md-12">
					<template v-if="overall.score">
						<Overall class="report-component" :message="overall.message" :score="overall.score" />
					</template>
				</div>
			</div>

			<div class="col-md-12">
				<template v-if="hasPostAssessment && keyIndexesScores.PrioritizationPercentile ">
					<KeyIndexes class="report-component" :keyIndexesScores="keyIndexesScores" />
				</template>
			</div>
		
			<div class="row">
				<div class="col-md-12">
					<template v-if="writtenResponse.score">
						<WrittenResponse class="report-component" :score="writtenResponse.score" :message="writtenResponse.message"></WrittenResponse>
					</template>
				</div>
			</div>

			<div class="row">
				<div class="col-md-12">
					<template v-if="Object.keys(competencies).length > 0">
						<Competencies class="report-component"></Competencies>
					</template>
					<template v-else-if="devIndex.chart">
						<DevIndex class="report-component" :chartdata="devIndex.chart" :message="devIndex.message"></DevIndex>
					</template>
				</div>
			</div>


			<div class="row">
				<div class="col-md-12">
					<template v-if="selfAwareness.score">
						<SelfAwareness class="report-component" :score="selfAwareness.score" :message="selfAwareness.message"></SelfAwareness>
					</template>
				</div>
			</div>

			<div class="row">
				<div class="col-md-12">
					<template v-if="skillGap && skillGapAvailable">
						<SkillGap class="report-component" :skills="skillGap"></SkillGap>
					</template>
				</div>
			</div>

			<div class="row">
				<div class="col-md-12">
					<template v-if="hasPostAssessment && constructs.length > 0">
						<Constructs class="report-component" :constructs="constructs" :levels="levels"></Constructs>
					</template>
				</div>
			</div>

			<div v-if="$store.state.isPrint" class="row page-break">
					<div class="col-md-12">
							<h2>Appendix - Developmental Tactics</h2>
							<div v-for="skill in $store.state.skills" class="mt-40">
									<h3 style="font-weight: bolder">{{ skill.name }}</h3>
									<div class="lead" v-html="skill.developmentalTactic">
									</div>
							</div>
					</div>
			</div>

			

			<button v-show="showNext" @click="goToNextStep" class="btn btn-success mat pull-right hidden-print">Next</button>
		
		</template>
	</div>
</template>

<script>

import SelfAwareness from './SelfAwareness.vue'
import SkillGap from './SkillGap.vue'
import DevIndex from './DevIndex.vue'
import Overall from './Overall.vue'
import Competencies from './Competencies.vue'
import WrittenResponse from './WrittenResponse.vue'
import Constructs from './Constructs.vue'
import KeyIndexes from './KeyIndexes.vue'

export default {

	name: "Report",

	mixins: [ require('../../mixins/steps') ],

	data() {
		return {
			currentStep: 1,
			steps: {
				1: 'Report'
			},
			breadcrumbs: ["Feedback Report"],
			next: 'IDP Builder',
			showNext: true,
			overall: {},
			devIndex: {},
			selfAwareness: {},
			writtenResponse: {},
			skillGap:{},
			competencies: {},
			constructs: [],
			levels: [],
			keyIndexesScores: {}
		}
	},

	beforeRouteEnter (to, from, next) {
		next(vm => {
			//route back to Dashboard if no selected assessment on the page such as in the event of a page refresh
            if(!vm.$store.state.selectedStsKey){
                vm.$router.push({ name: "Dashboard"})
            } else {
				let report = vm.$store.getters.selectedAssessment.report
				vm.$set( vm.$data, 'overall', report.overall )
				vm.$set( vm.$data, 'devIndex', report.devIndex )
				vm.$set( vm.$data, 'selfAwareness', report.selfAwareness )
				vm.$set( vm.$data, 'writtenResponse', report.writtenResponse )
				vm.$set( vm.$data, 'skillGap', report.skillGap )
				vm.$set( vm.$data, 'competencies', report.competencies )
				vm.$set( vm.$data, 'constructs', report.constructs )
				vm.$set( vm.$data, 'levels', report.levels ),
				vm.$set( vm.$data, 'keyIndexesScores', report.keyIndexesScores )
			}
		})
	},

	components: {
		SelfAwareness,
		SkillGap,
		DevIndex,
		Overall,
		Competencies, 
		WrittenResponse, 
		Constructs,
		KeyIndexes
	},

	computed: {
		isExam(){
            return this.$store.state.session.isExam == 1
        },
		selectedAssessment(){
            return this.$store.getters.selectedAssessment
        },
		fullName() {
			return this.selectedAssessment.firstname + " " + this.selectedAssessment.lastname
		},
        reportAvailableDate() {
            if(this.isExam){
                return true
            } else if (this.selectedAssessment && Object.keys(this.selectedAssessment).length > 0){
                    return this.selectedAssessment.reportAvailableDate
            }
        },
        now() {
            return this.$moment().format('MM/DD/YYYY hh:mm a')
        }, 
		isReportAvailable() {
            if(this.isExam){
                return true
            } else if(this.reportAvailableDate) {
                return this.$moment(this.reportAvailableDate).isBefore(this.now);
            }
        },
		skillGapAvailable(){
			return Object.keys(this.skillGap).length > 0
		},
        versionKey(){
            return this.selectedAssessment.versionKey; 
		},
		hasPostAssessment(){
			return this.$store.state.session.postAssessment
		}
	},

	methods: {
		print() {
			window.open('/capsiminbox/print/download-report')
		},
		goToNextStep() {
				let step = this.steps[this.currentStep+1]
				if(step === undefined) return this.$router.push({ name: this.next })
				this.breadcrumbs.push(step)
				this.currentStep++
		},
		getOrdinal(n) {
			const s = ["th","st","nd","rd"]
			const v = n % 100
			return `${n+(s[(v-20)%10]||s[v]||s[0])} Percentile`; 
		}
	},

	mounted() {
		setTimeout( () => window.PRINT_REPORT_READY = true, 2000 )
	}

}

</script>

<style lang="scss">

.report-component {
	display:inline-block;
	border: 1px solid #e3e3e3 !important;
	border-radius: 0 !important;
	background-color: white !important;

	.panel-heading {
		background-color: #003f54 !important;
		color: white !important;
		border-radius: 0 !important;
	}

}

@media print {

    .page-break {
        page-break-before:always;
        page-break-inside:avoid;
        margin-top: 300mm; /*phantomjs renders it on the top of the next page*/
    }

    .report-component {
        margin-top: 50px !important;
        page-break-before:always;
        page-break-inside:avoid;
        margin-top: 300mm; /*phantomjs renders it on the top of the next page*/
    }

    .panel-heading {
        h4 {
            color: white !important;
        }
    }

	.page-break {
		page-break-before:always;
		page-break-inside:avoid;
		margin-top: 300mm; /*phantomjs renders it on the top of the next page*/
	}

	.to-print {
		background-color: white !important;
		-webkit-print-color-adjust: exact !important;
	}


	.print-header {
		display: block !important;
	}

	h1 {
		font-weight: bold;
		font-size: 60px;
	}

	h2 {
		font-size: 24px !important;
	}
}

.first-page {
	margin-top: 120px;
}

.student-info {
	margin-top: 400px;
}

.print-header {
	display: none;
}

</style>
