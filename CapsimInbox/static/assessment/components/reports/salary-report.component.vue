<template>

<div class="row" :style="{ height: pageHeight }" style="overflow-y: auto;">
    <div id="capsim-salary-report" class="container">
        <template v-if="report"> 
            <BoxPlotChart :series="series"></BoxPlotChart>
        </template>
    </div>
</div>
</template>
<script>
import { mapState } from 'vuex'
import { BoxPlotChart } from '../../charts/index'

export default {
    name:'capsim-salary-report', 

    data: () => ({
    }),
    
    mounted() {
        this.windowHeight = window.innerHeight
        this.$nextTick(() => {
            window.addEventListener('resize', () => {
                this.windowHeight = window.innerHeight
            });
        })
    },

    beforeRouteEnter (to, from, next) {
        document.title = to.meta.title
        next()
    },

    computed: {
        pageHeight() {
            return `${this.windowHeight}px`
        },
        ...mapState({
            report: state => state.Reports.statisticsOverview.salaryData.dataSet
        }),
        series() {
            return [{
                name: 'Observations',
                data: [
                    this.report,
                ],
                tooltip: {
                    headerFormat: '<em>Experiment No {point.key}</em><br/>'
                }
            }]
        }
    },
    components: { BoxPlotChart }
}
</script>
