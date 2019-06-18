<template>
    <div id="capsim-balance-sheet">
        <ResponsiveTable :columns="[]" :data="tableData">
            <template slot="caption">
               <caption> Balance Sheet</caption>
            </template>
            <!-- <template slot="columns">
                <tr>
                    <th colspan="3">
                        Cash Flow Sheet
                    </th>
                </tr>
            </template> -->
            <template slot-scope="{ row }" >
                <td :style="row.style">
                    {{ row.label }}
                </td>
                <template v-if="row.cell > 0">
                    <td></td>
                    <td :style="row.style">{{ row.field }}</td>
                </template>
                <template v-else>
                    <td :style="row.style">{{ row.field }}</td>
                    <td></td>
                </template>
            </template>  
        </ResponsiveTable>
    </div>
</template>
<script>
import  ResponsiveTable  from './ResponsiveTable.vue'
import accounting from 'accounting'

export default {
    name:'capsim-balance-sheet', 
    components: { ResponsiveTable },
    props: ['balanceSheet'],
    data() {
        return {
            formatRules: {
                format: {
                    pos : "%s %v",   // for positive values, eg. "$ 1.00" (required)
                    neg : "%s (%v)", // for negative values, eg. "$ (1.00)" [optional]
                    zero: "%s  -- "  // for zero values, eg. "$  --" [optional]
                },
                precision: 0
            },
            rowNames: {
                assets: { label: 'Assets', field: '', cell: 0, style:"font-weight: bold;" },
                totalCash: { label: 'Cash', field: '', format: 'formatMoney', cell: 0 },
                totalAccountsReceivable: { label: 'Accounts Receivable', field: '', format: 'formatMoney', cell: 0 },
                totalInventoryValue: { label: 'Inventory', field: '', format: 'formatMoney', cell: 0 },
                totalCurrentAssets: { label: 'Total Current Assets', field: '', format: 'formatMoney', cell: 1, style:"font-weight: bold;" },
                totalPlantAndEquipment: { label: 'Plant And Equipment', field: '', format: 'formatMoney', cell: 0 },
                totalAccumulatedDepreciation: { label: 'Accumulated Depreciation', field: '', format: 'formatMoney', cell: 0 },
                totalFixedAssets: { label: 'Total Fixed Assets', field: '', format: 'formatMoney', cell: 1, style:"font-weight: bold;" },
                totalAssets: { label: 'Total Assets', field: '', format: 'formatMoney', cell: 1, style:"font-weight: bold;" },
                liabilitiesOwnersEquity: { label: `Liabilities & Owners' Equity`, field: '', cell: 0, style:"font-weight: bold;" },
                totalAccountsPayable: { label: 'Accounts Payable', field: '', format: 'formatMoney', cell: 0 },
                totalCurrentDebt: { label: 'Current Debt', field: '', format: 'formatMoney', cell: 0 },
                totalLongTermDebt: { label: 'Long Term Debt', field: '', format: 'formatMoney', cell: 0 },
                totalLiabilities: { label: 'Total Liabilities', field: '', format: 'formatMoney', cell: 1, style:"font-weight: bold;" },
                totalCommonStock: { label: 'Common Stock', field: '', format: 'formatMoney', cell: 0 },
                totalRetainedEarnings: { label: 'Retained Earnings', field: '', format: 'formatMoney', cell: 0 },
                totalEquity: { label: 'Total Equity', field: '', format: 'formatMoney', cell: 1, style:"font-weight: bold;" },
                totalLiabilitiesAndEquity: { label: 'Total Liabilities And Equity', field: '', format: 'formatMoney', cell: 1, style:"font-weight: bold;" }
            }
        }
    },
    computed: {
        tableData() {
            const result = []
            if(this.balanceSheet){
                const test = this.balanceSheet
                for (let key in this.rowNames) {
                    const row = this.rowNames[key]
                    let field
                    if(this.balanceSheet[key]) {
                        field = this.balanceSheet[key]
                    }
                     if(row.format) {
                        field = accounting[row.format](field, this.formatRules)
                    }
                    result.push(Object.assign({}, row, { field }))
                }
            }
            return result
        },
    }
}
</script>
