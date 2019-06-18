const InitialState = {
    reports: {
        financialReport:{
            balanceSheet:{}, 
            cashFlow: {}, 
            incomeStatement: {
                administrationOverheadRate: {},
                ebit: {},
                netProfit: {},
                productLineItems: {},
                profitSharingCost: {},
                tax: {},
                totalAdministrativeOverheadCost: {},
                totalContributionMargin: {},
                totalDepreciationCost: {},
                totalDirectLaborCost: {},
                totalDirectMaterialCost: {},
                totalInterestCosts: {},
                totalInventoryCarryCost: {},
                totalNetMargin: {},
                totalOtherCosts: {},
                totalPeriodCosts: {},
                totalPromotionBudgetCost: {},
                totalResearchAndDevelopementCost: {},
                totalSales: {}
            }
        }, 
        productionOverview:{
            productLines: {
                Fast: {},
                Feat: {},
                Gaffe: {},
                Gerbil: {},
                Heft: {},
                Hue: {},
                Ignite: {},
                Irate: {},
                Juice: {},
                Jump: {}
            }
        }, 
        statisticsOverview:{
            salaryData:{},
            marketingData: {}
        },
        finacialOverview: {
            bonds: [],
            equityOverview: {}
        }
    },
    errors:{
        developer:false,
        response:{},
        message:{}
    },
    ajaxCallsInProgress: 0
};
export default InitialState; 