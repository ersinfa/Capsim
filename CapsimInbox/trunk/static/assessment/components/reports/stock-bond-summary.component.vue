<template>
<div class="row" :style="{ height: pageHeight }" style="overflow-y: auto;">
    <div id="capsim-stock-bond-report" class="container">
        <!-- Bond Report Table  -->
        <br/>
        <table class="table table-responsive table-reports" >
            <caption>Bond Summary</caption>
            <thead align="center">
                <tr>
                    <th v-for="column in bondColumns" :key="column.id">
                        {{ startCase(column) }}
                    </th>
                </tr>
            </thead>
            <tbody>
                
                <tr v-for="row in bondsData" :key="row.id">
                    <td v-for="column in bondColumns" :key="column.id">
                        {{ row[column] }}
                    </td>
                </tr>
            </tbody>
        </table>
        
        <!-- Bond Report Table  -->
        <table class="table table-responsive table-reports" >
            <caption>Stock Summary</caption>
            <!-- <thead align="center">
                <tr>
                    <th colspan="2">
                        Stock Summary
                    </th>
                </tr>
            </thead> -->
            <tbody>
                <tr v-for="(row, index) in equityOverview" :key="row.id">
                    <td>
                        {{ index }}
                    </td>
                   <td>
                        {{ row }}
                   </td>
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
import  ResponsiveTable  from './ResponsiveTable.vue'

export default {

    name:'capsim-stock-bond-report', 

    components: { ResponsiveTable },

    data() {
        return {
             windowHeight: 0,
            startCase: startCase,
            bondColumns: ['seriesNumber', 'faceValue', 'closingPrice'],
            formatRules: {
                format: {
                    pos : "%s %v",   // for positive values, eg. "$ 1.00" (required)
                    neg : "%s (%v)", // for negative values, eg. "$ (1.00)" [optional]
                    zero: "%s  -- "  // for zero values, eg. "$  --" [optional]
                },
                precision: 2
            }
        }
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
            report: state => state.Reports.finacialOverview
        }), 
        // Please refactor static tables
        bondsData() {
            if(!this.report.bonds) return []
            return this.report.bonds.map(bond => {
                for(let key in bond) {
                    const value = bond[key]
                    if(key !== 'seriesNumber')
                        bond[key] = accounting.formatMoney(value, this.formatRules)
                }
                return bond
            })
        },
        equityOverview() {
            let result = {}
            // accountant 
            for(let key in this.report.equityOverview) {
                const value = this.report.equityOverview[key]
                if(key == 'commmonSharesOutstanding') {
                    result[startCase('commonSharesOutstanding')] = accounting.formatNumber(value)
                } else {
                    result[startCase(key)] = accounting.formatMoney(value, this.formatRules)
                }
            }
            return result
        }
    },
    mounted() {
        this.windowHeight = window.innerHeight
        this.$nextTick(() => {
            window.addEventListener('resize', () => {
                this.windowHeight = window.innerHeight
            });
        })
    }
}
</script>

