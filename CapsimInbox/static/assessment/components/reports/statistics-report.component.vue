<template>
<div class="row" :style="{ height: pageHeight }" style="overflow-y: auto;">
    <div id="capsim-statistics-report" class="container">
        <br/>
        <table class="table table-responsive table-reports"  id="capsim-responsive-table">
            <caption>Statistics Report</caption>
            <!-- <thead>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                </tr>
            </thead> -->
            <tbody>
                <tr v-for="(row, key) in tableData" >
                    <td>{{ startCase(key )}}</td>
                    <td> {{ row }} </td>
                </tr>
            </tbody> 
        </table>
    </div>
</div>
</template>
<script>
import { mapState } from 'vuex'
import { startCase } from 'lodash'
import accounting from 'accounting'

export default {
    name:'capsim-statistics-report', 

    data() {
        return {
            startCase: startCase,
            formatRules: {
                format: {
                    pos : "%s %v",   // for positive values, eg. "$ 1.00" (required)
                    neg : "%s (%v)", // for negative values, eg. "$ (1.00)" [optional]
                    zero: "%s  -- "  // for zero values, eg. "$  --" [optional]
                },
                precision: 2
            },
            reportRules: {'range': 'formatNumber', 'mean': 'formatNumber', 'standardDeviation': 'formatNumber', 'median': 'formatNumber', 'iqr': 'formatNumber', 'skewness': 'formatPercent', 'rsquared': 'formatPercent', 'intercept': 'formatPercent', 'significance': 'formatPercent'}
        }
    },
    
    methods: {
        getFormat(rule, value) {
            switch (rule) {
                case 'formatNumber':
                    return accounting.formatNumber(value)          
                case 'formatMoney':
                    return accounting.formatMoney(value, this.formatRules)       
                case 'formatPercent':
                    return value.toFixed(4)
                default:
                    return value
            }
        }
    },
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
            report: state => state.Reports.statisticsOverview
        }), 
        tableData() {
            let result = {}
            for(let ruleKey in this.reportRules) {
                let rule = this.reportRules[ruleKey]
                for(let object in this.report) {
                    let value = this.report[object]
                    for(let key in value) {
                        if(ruleKey == key){
                            result[ruleKey] = this.getFormat(rule, value[ruleKey])
                        }
                    }
                }
            }
            return result
        }
    }
}
</script>
