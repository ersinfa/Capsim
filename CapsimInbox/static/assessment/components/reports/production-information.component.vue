<template>
<div class="row" :style="{ height: pageHeight }" style="overflow-y: auto;">
    <div id="capsim-production-information-report" class="container">
        <br/>
        <!-- Production Information  -->
        <table class="table table-responsive table-reports" >
            <caption> Product Information</caption>
            <thead align="center">
                <tr>
                    <th v-for="column in productionColumns" :key="column.id">
                        <template v-if="column == 'inventory'">
                            Ending Inventory
                        </template>
                        <template v-else-if="column == 'teamName'">
                            Company
                        </template>
                        <template v-else>
                            {{ startCase(column) }}
                        </template>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in productionData" :key="row.id">
                    <td v-for="column in productionColumns" :key="column.id">
                        {{ formatRule(row, column) }}
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Market Share Reprot  -->
        <table class="table table-responsive table-reports" >
            <caption> Market Share Report</caption>
            <thead align="center">
                <tr>
                    <th v-for="column in marketShareColumns" :key="column.id">
                        <template v-if="column == 'product'">
                            {{ startCase(column) }}
                        </template>
                        <template v-else-if="column == 'teamName'">
                            Company
                        </template>
                        <template v-else>
                            {{ startCase(column) }} Segment
                        </template>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in marketShareData" :key="row.id">
                    <td v-for="column in marketShareColumns" :key="column.id">
                        {{ row[column] }}
                    </td>
                </tr>
            </tbody>
        </table>


        <!-- Market Share Reprot  -->
        <table class="table table-responsive table-reports" >
            <caption> Product Sales By Segment</caption>
            <thead align="center">
                <tr>
                    <th v-for="column in productSalesColumns" :key="column.id">
                        <template v-if="column == 'product'">
                            {{ startCase(column) }}
                        </template>
                        <template v-else-if="column == 'teamName'">
                            Company
                        </template>
                        <template v-else>
                            {{ startCase(column) }} Segment
                        </template>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in productSales" :key="row.id">
                    <td v-for="column in productSalesColumns" :key="column.id">
                        {{ row[column] }}
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

export default {
    name:'capsim-production-information-report', 
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
                precision: 2
            },
            productionRules: {'product': '', 'teamName':'', 'primarySegment': '',  'price': 'formatMoney',  'totalUnitsSold': 'formatNumber',  'inventory': 'formatNumber',  'materialCostPerUnit': 'formatMoney', 	'laborCostPerUnit': 'formatMoney', 	'plantUtilization':'formatPercent'}, 
        }
    },
    methods: {
        formatRule(row, column) {
            let rule = this.productionRules[column]
            let value = row[column]
            return this.getFormat(rule, value)
        },
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
            report: state => state.Reports.productionOverview
        }), 
        productionColumns() {
            return Object.keys(this.productionRules)
        }, 

        productionData() {
            let retVal = []
            for(let key in this.report.productLines){
                let temp = this.report.productLines[key]
                temp.product = key
                retVal.push(temp)
            }
            retVal.sort(function(a, b) {
                    var productA = a.product.toUpperCase(); // ignore upper and lowercase
                    var productB = b.product.toUpperCase(); // ignore upper and lowercase
                    if (productA < productB) {
                        return -1;
                    }
                    if (productA > productB) {
                        return 1;
                    }

                    // names must be equal
                    return 0;
                });
            return retVal
        },
        marketShareData() {
            return Object
                .values(this.report.productLines)
                .map(productLine => {
                    let { product, segmentMarketShare, teamName } = productLine
                    // append percentage format 
                    for(let key in segmentMarketShare){
                        let value = segmentMarketShare[key]
                        segmentMarketShare[key] = `${(value * 100).toFixed(1)}%`
                    }
                    return {product, teamName, ...segmentMarketShare}
                }).sort(function(a, b) {
                    var productA = a.product.toUpperCase(); // ignore upper and lowercase
                    var productB = b.product.toUpperCase(); // ignore upper and lowercase
                    if (productA < productB) {
                        return -1;
                    }
                    if (productA > productB) {
                        return 1;
                    }

                    // names must be equal
                    return 0;
                });
        },
        marketShareColumns() {
            const top = this.marketShareData[0]
            return Object.keys(top)
        }, 
        productSales() {
            return Object
                .values(this.report.productLines)
                .map(productLine => {
                    let { product, segmentUnitsSold, teamName } = productLine
                    // append number format 
                    for(let key in segmentUnitsSold){
                        let value = segmentUnitsSold[key]
                        segmentUnitsSold[key] = accounting.formatNumber(value)
                    }
                    return { product, teamName, ...segmentUnitsSold}
                }).sort(function(a, b) {
                    var productA = a.product.toUpperCase(); // ignore upper and lowercase
                    var productB = b.product.toUpperCase(); // ignore upper and lowercase
                    if (productA < productB) {
                        return -1;
                    }
                    if (productA > productB) {
                        return 1;
                    }

                    // names must be equal
                    return 0;
                });
        },
        productSalesColumns(){
            const top = this.productSales[0]
            return Object.keys(top)
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

