<template>
    <div id="capsim-cash-flow-sheet">
        <ResponsiveTable :columns="[]" :data="tableData">
            <template slot="caption">
               <caption> Cash Flow Sheet</caption>
            </template>
            <!-- <template slot="columns">
                <tr>
                    <th colspan="2">
                        Cash Flow Sheet
                    </th>
                </tr>
            </template> -->
            <template slot-scope="{ row }" >
                <td :style="row.style">
                    {{ row.label }}
                </td>
                <td>
                    {{ row.field }}
                </td>
            </template>  
        </ResponsiveTable>
    </div>
</template>
<script>
import  ResponsiveTable  from './ResponsiveTable.vue'
import accounting from 'accounting'

export default {
    name:'capsim-cash-flow-sheet', 
    components: { ResponsiveTable },
    props: ['cashFlow'],
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
                startingCash: { label: 'Starting Cash', field: '', format: 'formatMoney', cell: 0, style:"font-weight: bold;" },
                cashFromOperations: { label: 'Cash From Operations', field: '', cell: 0, style:"font-weight: bold;" },
                netIncome: { label: 'Net Income (Loss)', field: '', format: 'formatMoney', cell: 0 },
                adjustmentForNonCashItems: { label: 'Adjustment For Non-Cash Items', field: '', cell: 0 },
                depreciation: { label: 'Depreciation', field: '', format: 'formatMoney', cell: 0 },
                gainsLossesAndWriteoffs: { label: 'Extraordinary gains/losses/writeoffs', field: '', format: 'formatMoney', cell: 0 },
                changesInCurrentAssetsAndLiabilities: { label: 'Changes in current assets and liabilities', field: '', cell: 0, style:"font-weight: bold;" },
                changeInAccountsPayable: { label: 'Accounts Payable', field: '', format: 'formatMoney', cell: 0 },
                changeInInventory: { label: 'Inventory', field: '', format: 'formatMoney', cell: 0 },
                changeInAccountsReceivable: { label: 'Accounts Receivable', field: '', format: 'formatMoney', cell: 0 },
                netCashFromOperations: { label: 'Net Cash From Operations', field: '', format: 'formatMoney', cell: 0 },
                cashFromInvesting: { label: 'Cash From Investing', field: '', cell: 0, style:"font-weight: bold;" },
                plantImprovements: { label: 'Plant Improvements', field: '', format: 'formatMoney', cell: 0 },
                netCashFromInvesting: { label: 'Net Cash From Investing', field: '', format: 'formatMoney', cell: 0 },
                cashFromFinancing: { label: 'Cash From Financing', field: '', cell: 0, style:"font-weight: bold;" },
                dividendsPaid: { label: 'Dividends Paid', field: '', format: 'formatMoney', cell: 0 },
                commonStockSales: { label: 'Common Stock Sales', field: '', format: 'formatMoney', cell: 0 },
                commonStockPurchases: { label: 'Common Stock Purchases', field: '', format: 'formatMoney', cell: 0 },
                bondSales: { label: 'Bond Sales', field: '', format: 'formatMoney', cell: 0 },
                bondPurchases: { label: 'Bond Purchases', field: '', format: 'formatMoney', cell: 0 },
                changeInCurrentDebt: { label: 'Change In Current Debt', field: '', format: 'formatMoney', cell: 0 },
                netCashFromFinancing: { label: 'Net Cash From Financing', field: '', format: 'formatMoney', cell: 0 },
                netChangeInCash: { label: 'Net Change In Cash', field: '', format: 'formatMoney', cell: 0, style:"font-weight: bold;" },
                endingCash: { label: 'Closing Cash Postion', field: '', format: 'formatMoney', cell: 0, style:"font-weight: bold;" },
            }
        }
    },
    computed: {
        tableData() {
            const result = []
            if(this.cashFlow){
                const test = this.cashFlow
                for (let key in this.rowNames) {
                    const row = this.rowNames[key]
                    let field
                    if(this.cashFlow[key] || this.cashFlow[key] === 0) {
                        field = this.cashFlow[key]
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
