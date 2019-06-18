<template>
    <!-- <div id="capsim-annual-report" class="container"  style="overflow-y: auto;" ref="container"> -->
    <div class="row" :style="{ height: pageHeight }" style="overflow-y: auto;">
    <div id="capsim-annual-report" class="container" >
            <br/>
          <div class="row">
            <BalanceSheet :balanceSheet="balanceSheet" />
        </div> 
        <div class="row">
            <CashFlowSheet :cashFlow="cashFlow" />
        </div> 
        <div class="row"> 
            <!-- Income Statement Reprot  -->
            <table class="table table-responsive table-reports" >
                <caption>Income Statement</caption>
                <thead align="center">
                    <!-- <tr>
                        <th :colspan="tableColumns.length">
                            Income Statement
                        </th>
                    </tr> -->
                    <tr>
                        <th v-for="column in tableColumns" :key="column.id">
                            {{ startCase(column) }}
                        </th> 
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in tableData" :key="row.id">
                        <td :style="row.style">
                            {{ row.label }}
                        </td>
                        <td v-for="data in row.rows" :key="data.id">
                            {{ data }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import  ResponsiveTable  from './ResponsiveTable.vue'
import  BalanceSheet  from './balance-sheet.component.vue'
import  CashFlowSheet  from './cash-flow-sheet.component.vue'
import { startCase } from 'lodash'
import accounting from 'accounting'


export default {
    name:'capsim-annual-report', 
    components: { ResponsiveTable, BalanceSheet, CashFlowSheet },
    data() {
        return {
            windowHeight: 0,
            startCase: startCase,
            formatRules: {
                format: {
                    pos : "%s %v",   // for positive values, eg. "$ 1.00" (required)
                    neg : "%s (%v)", // for negative values, eg. "$ (1.00)" [optional]
                    zero: "%s  -- "  // for zero values, eg. "$  --" [optional]
                },
                precision: 0
            },
            rowNames: {
                totalSales: { label: 'Sales', field: '', format: 'formatMoney', cell: 0, style:"font-weight: bold;" },
                VariableCosts: { label: 'Variable Costs', field: '', format: '', cell: 0, style:"font-weight: bold;" },
                
                totalDirectLaborCost: { label: 'Direct Labor Cost', field: '', format: 'formatMoney', cell: 0 },
                totalDirectMaterialCost: { label: 'Direct Material Cost', field: '', format: 'formatMoney', cell: 0 },
                totalInterestCosts: { label: 'Interest Costs', field: '', format: 'formatMoney', cell: 0 },
                totalVariableCosts: { label: 'Total Variable Costs', field: '', format: 'formatMoney', cell: 0 },
                totalContributionMargin: { label: 'Contribution Margin', field: '', format: 'formatMoney', cell: 0 },
                
                PeriodCosts: { label: 'Period Costs', field: '', format: '', cell: 0, style:"font-weight: bold;" },
                totalDepreciationCost: { label: 'Depreciation', field: '', format: 'formatMoney', cell: 0 },
                
                sGandA: { label: 'SG & A', field: '', format: '', cell: 0 },
                totalResearchAndDevelopementCost: { label: 'R & D Cost', field: '', format: 'formatMoney', cell: 0 },
                totalPromotionBudgetCost: { label: 'Promotion Budget', field: '', format: 'formatMoney', cell: 0 },
                totalSalesBudgetCost: { label: 'Sales Budget', field: '', format: 'formatMoney', cell: 0 },
                totalAdministrativeOverheadCost: { label: 'Administrative Overhead', field: '', format: 'formatMoney', cell: 0 },

                totalPeriodCosts: { label: 'Total Period Costs', field: '', format: 'formatMoney', cell: 0 },
                totalNetMargin: { label: 'Net Margin', field: '', format: 'formatMoney', cell: 0 },
                totalOtherCosts: { label: 'Other (Fees/Write-offs/Bonuses/Relocation)', field: '', format: 'formatMoney', cell: 0 },

                ebit: { label: 'EBIT', field: '', format: 'formatMoney', cell: 0 },
                tax: { label: 'Tax', field: '', format: 'formatMoney', cell: 0 },
                profitSharingCost: { label: 'Profit Sharing Cost', field: '', format: 'formatMoney', cell: 0 },                
                netProfit: { label: 'Net Profit', field: '', format: 'formatMoney', cell: 0, style:"font-weight: bold;" }
            }
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
                    return `${(value * 100).toFixed(1)}%`
                default:
                    return value
            }
        }
    },
    computed: {
        pageHeight() {
            return `${this.windowHeight}px`
        },

        ...mapState({
            report: state => state.Reports.financialReport
        }),
        balanceSheet() {
            return this.report.balanceSheet
        },
        cashFlow() {
            return this.report.cashFlow
        },
        incomeStatement(){
            return this.report.incomeStatement
        },
        tableColumns() {
            let result = ['']
            for(let object in this.incomeStatement) {
                result.push(object)
            }
            return result
        },
        tableData() {
            let result = {}
            for(let object in this.incomeStatement){
                let product = this.incomeStatement[object]
                for(let key in this.rowNames) {
                    let row = this.rowNames[key]
                    let value = product[key]
                    if (!result[key]) {
                        result[key] = {
                            label: row.label,
                            style: row.style,
                            rows: []
                        }
                    }
                    if(value !== undefined){
                        if(row.format)
                            value = this.getFormat(row.format, value)
                        result[key].rows.push(value)
                    }
                    else 
                        result[key].rows.push('')
                }
            }
            return result
        }
    },
    beforeRouteEnter (to, from, next) {
        document.title = to.meta.title
        next()
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
