/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search'],
    /**
     * @param{record} record
     * @param{search} search
     */
    (record, search) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */
        const REVSEARCHFORSTAUPDATE = 'customsearch_ats_rev_search_for_sta_updt'
        const getInputData = (inputContext) => {
            var mainprortySearch = search.load({
                id: 'customsearch_ats_mis_expense_acc_period'
            })
            return mainprortySearch
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (context) => {

            let taxesTotal = 0;
            let concessionFeesTotal = 0
            let variableCostTotal = 0
            let establishmentCostTotal = 0
            let fixedCostTotal = 0
            let otherCostTotal = 0
            let costThatMoveToRevTotal = 0
            let searchResult = JSON.parse(context.value);
            //log.debug('Search Result', searchResult)
            //  let period = searchResult.values.custrecord_ats_sta_accounting_period.text;

            let id = searchResult.values.internalid.value;
            let property = searchResult.values.custrecord_ats_mis_rev_property.value


            var accountPeriod = searchResult.values.custrecord_ats_exp_accounting_period.text
           // log.audit(`MIS ID:  ${id} | PROPERTY: ${property} | ACCOUNTING PERIOD: ${accountPeriod}`)

            var periodFinal = accountPeriod.substring(accountPeriod.length - 8, accountPeriod.length)
            var billSearchObj = search.load({
                id: 'customsearch_final_ats_exp_actuals'
            })
            billSearchObj.filters.push(search.createFilter({
                name: "periodname",
                join: "accountingPeriod",
                operator: 'contains',
                values: periodFinal.toString()
            }));
            billSearchObj.filters.push(search.createFilter({
                name: "location",
                operator: 'anyof',
                values: parseInt(property)
            }));

            var searchResultCount = billSearchObj.runPaged().count;
            //   log.audit('Search Result Count', searchResultCount)
            if (searchResultCount > 0) {

                var misExp = record.load({
                    type: 'customrecord_ats_mis_expense',
                    id: id,
                    isDynamic: true
                });
                var salesRelatedActual = 0;
                var salesRelatedBudget = 0;
                salesRelatedActual = misExp.getValue('custrecord300')
                salesRelatedBudget = misExp.getValue('custrecord302')
                log.audit('Sales Related ' , `salesRelatedActual ${salesRelatedActual} | salesRelatedBudget ${salesRelatedBudget} `)
                var revId
                var misRecMonth = misExp.getValue('custrecord_ats_mis_exp_months')
                var misRecYear = misExp.getValue('custrecord_ats_mis_exp_year')
                var misProperty = misExp.getValue('custrecord_ats_mis_rev_property')
                if (salesRelatedActual > 0 || salesRelatedBudget > 0) {
                    log.audit('Sales Related is not 0')
                    var revRecSearhObj = search.load({
                        id: REVSEARCHFORSTAUPDATE
                    })
                    revRecSearhObj.filters.push(search.createFilter({
                        name: 'custrecord_ats_mis_month',
                        operator: 'anyof',
                        values: misRecMonth
                    }));
                    revRecSearhObj.filters.push(search.createFilter({
                        name: 'custrecord_ats_mis_year',
                        operator: 'anyof',
                        values: misRecYear
                    }));
                    revRecSearhObj.filters.push(search.createFilter({
                        name: 'custrecord_ats_mis_property',
                        operator: 'anyof',
                        values: misProperty
                    }));
                    var revRecSearhObjCount = revRecSearhObj.runPaged().count;
                    if (revRecSearhObjCount > 0) {
                        revRecSearhObj.run().each(function (result) {
                            revId = result.id
                        })
                    }
                    var revRecord = record.load({
                        type: 'customrecord_ats_mis_revenue',
                        id: revId,
                        isDynamic: true
                    })
                    var revGrossRevenueActual = 0;
                    var revGrossRevenueBudget = 0
                    var netRevenueActual = 0;
                    var netRevenueBudget = 0;
                    revGrossRevenueActual = revRecord.getValue('custrecord_ats_rev_gross_revenue')
                    revGrossRevenueBudget = revRecord.getValue('custrecord_ats_rev_gross_revenue_budget')
                    // revRecord.setValue({
                    //     fieldId: 'custrecord297',
                    //     value: salesRelatedActual - revGrossRevenueActual
                    // })
                    // revRecord.setValue({
                    //     fieldId: 'custrecord298',
                    //     value: revGrossRevenueBudget - revGrossRevenueBudget
                    // })
                    // var revSavedId = revRecord.save({
                    //     ignoreMandatoryFields: true
                    // })
                    netRevenueActual =   revGrossRevenueActual - salesRelatedActual
                    netRevenueBudget =  revGrossRevenueBudget - salesRelatedBudget
                    var revSavedId = record.submitFields({
                        type:'customrecord_ats_mis_revenue',
                        id: revId,
                        values: {
                            custrecord298: netRevenueBudget,
                            custrecord297:  netRevenueActual
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    log.audit('revSavedId', revSavedId)


                }

                billSearchObj.run().each(function (result) {

                    var accountingPeriod = result.getValue({
                        name: 'periodname',
                        join: 'accountingPeriod',
                        summary: 'GROUP'
                    })


                    var amount = result.getValue({
                        name: 'amount',
                        join: "accountingTransaction",
                        summary: "SUM"
                    })


                    var expCategory = result.getText({
                        name: 'custrecord_ats_expense_category',
                        join: 'account',
                        summary: 'GROUP'
                    })
                    log.audit(`APeriod : ${accountingPeriod} | expCategory: ${expCategory} | amount: ${amount}`)

                    if (expCategory.includes('Sales Related') === true) {
                        // log.debug('taxes')
                        misExp.setValue({
                            fieldId: 'custrecord300',
                            value: amount
                        })
                        // taxesTotal += parseInt(amount)


                    }
                    if (expCategory.includes('Taxes') === true) {
                        // log.debug('taxes')
                        misExp.setValue({
                            fieldId: 'custrecord87',
                            value: amount
                        })
                       // taxesTotal += parseInt(amount)


                    }

                    if (expCategory.includes('Concession Fees') === true) {
                        log.debug('taxes')
                        misExp.setValue({
                            fieldId: 'custrecord90',
                            value: amount
                        })
                     //   concessionFeesTotal += parseInt(amount)


                    }
                    //variable cost
                    if (expCategory.includes('Variable Cost : Food') === true) {

                        misExp.setValue({
                            fieldId: 'custrecord93',
                            value: amount
                        })
                        variableCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Variable Cost : Bar') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord96',
                            value: amount
                        })
                        variableCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Variable Cost : Housekeeping') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord99',
                            value: amount
                        })
                        variableCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Variable Cost : Gas Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord102',
                            value: amount
                        })
                        variableCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Variable Cost : Kitchen Consumables') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord105',
                            value: amount
                        })
                        variableCostTotal += parseFloat(amount)
                    }
                    if (expCategory.includes('Variable Cost : Drivers Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord108',
                            value: amount
                        })
                        variableCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Variable Cost : Guest Water Bottle') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord111',
                            value: amount
                        })
                        variableCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Variable Cost : Land & Life') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord114',
                            value: amount
                        })
                        variableCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Variable Cost : Conferences') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord117',
                            value: amount
                        })
                        variableCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Establishment Cost : Staff Payroll Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord120',
                            value: amount
                        })
                        establishmentCostTotal += parseInt(amount)
                    }
                    //Establishment Cost
                    if (expCategory.includes('Establishment Cost : Management Payroll Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord123',
                            value: amount
                        })
                        establishmentCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Establishment Cost : Staff Transport') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord126',
                            value: amount
                        })
                        establishmentCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Establishment Cost : Staff Uniform & Shoes') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord129',
                            value: amount
                        })
                        establishmentCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Establishment Cost : Staff Training') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord132',
                            value: amount
                        })
                        establishmentCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Establishment Cost : Staff Canteen') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord135',
                            value: amount
                        })
                        establishmentCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Establishment Cost : Staff - Other') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord138',
                            value: amount
                        })
                        establishmentCostTotal += parseFloat(amount)
                    }

                    //fixed Cost

                    if (expCategory.includes('Fixed Cost : Administration') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord141',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Software (ICT)') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord144',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Lodge Marketing / Guest giveaways') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord147',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Land/Lease Rent/Camping Fee') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord150',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : License & Subscriptions') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord153',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Insurance') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord156',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Service Stock') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord159',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Printing & Stationery') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord162',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Telephone & Internet') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord165',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Stock Differences / Spoilages') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord168',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Bank Charges') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord171',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Legal, Professional Fees & Audit') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord174',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Air Travel') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord177',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Fixed Cost : Security') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord180',
                            value: amount
                        })
                        fixedCostTotal += parseInt(amount)
                    }


                    //other cost

                    if (expCategory.includes('Other Cost : Electricity') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord183',
                            value: amount
                        })
                        otherCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Other Cost : Fuel') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord186',
                            value: amount
                        })
                        otherCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Other Cost : Service Vehicle') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord189',
                            value: amount
                        })
                        otherCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Other Cost : Vehicle - GP') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord192',
                            value: amount
                        })
                        otherCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Other Cost : Vehicle - C&P') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord195',
                            value: amount
                        })
                        otherCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Other Cost : Vehicle - Hire') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord198',
                            value: amount
                        })
                        otherCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Other Cost : Repairs & Maintenance') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord201',
                            value: amount
                        })
                        otherCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Other Cost : Kerosene') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord204',
                            value: amount
                        })
                        otherCostTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Other Cost : Water/Bowser') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord207',
                            value: amount
                        })
                        otherCostTotal += parseInt(amount)
                    }

                    // Cost the move to revenue total
                    if (expCategory.includes('Costs That Move as a % to Revenue : Food Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord210',
                            value: amount
                        })
                        costThatMoveToRevTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Costs That Move as a % to Revenue : Bar Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord213',
                            value: amount
                        })
                        costThatMoveToRevTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Costs That Move as a % to Revenue : Extra Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord216',
                            value: amount
                        })
                        costThatMoveToRevTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Costs That Move as a % to Revenue : Shop Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord219',
                            value: amount
                        })
                        costThatMoveToRevTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Costs That Move as a % to Revenue : Flights & Transfers Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord222',
                            value: amount
                        })
                        costThatMoveToRevTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Park & Conservancy Fees') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord225',
                            value: amount
                        })
                        costThatMoveToRevTotal += parseInt(amount)
                        if(amount >0)
                        {
                            log.audit('Expense Id ' + id ,` amount: ${amount}`)
                        }                    }
                    if (expCategory.includes('Costs That Move as a % to Revenue : Activity & Excursion Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord228',
                            value: amount
                        })
                        costThatMoveToRevTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Costs That Move as a % to Revenue : Spa Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord231',
                            value: amount
                        })
                        costThatMoveToRevTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Costs That Move as a % to Revenue : Shanga Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord234',
                            value: amount
                        })
                        costThatMoveToRevTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Costs That Move as a % to Revenue : Conference Cost') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord237',
                            value: amount
                        })
                        costThatMoveToRevTotal += parseInt(amount)
                    }
                    if (expCategory.includes('Costs That Move as a % to Revenue : Tour Costs') === true) {
                        misExp.setValue({
                            fieldId: 'custrecord240',
                            value: amount
                        })
                        costThatMoveToRevTotal += parseInt(amount)
                    }


                    return true;

                });
                log.audit(`MIS Exp Id ${id}`, `Taxes Total: ${taxesTotal}| Concession Total: ${concessionFeesTotal}| Variable Cost Total: ${variableCostTotal}
                | Establishment Cost Total: ${establishmentCostTotal} | Fixed Cost Total ${fixedCostTotal} | Other Cost Total ${otherCostTotal} | CTMASR Total| ${costThatMoveToRevTotal}`)
                try {
                    misExp.setValue({
                        fieldId: 'custrecord87',
                        value: parseFloat(taxesTotal).toFixed(2)
                    })
                    misExp.setValue({
                        fieldId: 'custrecord90',
                        value: parseFloat(concessionFeesTotal).toFixed(2)
                    })
                    misExp.setValue({
                        fieldId: 'custrecord_ats_exp_variable',
                        value: parseFloat(variableCostTotal).toFixed(2)
                    })
                    misExp.setValue({
                        fieldId: 'custrecord_ats_exp_establishment',
                        value: parseFloat(establishmentCostTotal).toFixed(2)
                    })
                    misExp.setValue({
                        fieldId: 'custrecord_ats_exp_fixed',
                        value: parseFloat(fixedCostTotal).toFixed(2)
                    })
                    misExp.setValue({
                        fieldId: 'custrecord_ats_exp_other',
                        value: parseFloat(otherCostTotal).toFixed(2)
                    })
                    misExp.setValue({
                        fieldId: 'custrecord_ats_exp_percent_rev',
                        value: parseFloat(costThatMoveToRevTotal).toFixed(2)
                    })


                } catch (e) {
                    log.error(e.message, id)
                }

                if (misExp) {
                    try {
                        expId = misExp.save({
                            ignoreMandatoryFields: true
                        });
                    } catch (e) {
                        log.error(e.message, id)
                    }


                }
                log.audit(' Expense Record updated ', expId)
            }


        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (context) => {
            var reduceValue = JSON.parse(context.value)
            log.audit('Reduce ', reduceValue)
        }

        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        return {getInputData, map, reduce, summarize}

    });
