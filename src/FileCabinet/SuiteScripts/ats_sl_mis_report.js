/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
const PROPERTYSEARCHPARENT = 'customsearch_ats_cogsreport_property'
const STATISTICSEARCH = 'customsearch_ats_sum_stat_actual'
const REVENUESEARCH = 'customsearchats_sum_rev_actual'
const EXPENSESEARCH = 'customsearch_ats_sum_exp_actual'
const REPORTTYPE = ['ALL', 'STATISTIC', 'REVENUE', 'EXPENSE']

//CONSTS Declaration

define(['N/ui/serverWidget','N/task', 'N/search', 'N/redirect', 'N/render', 'N/file', 'N/https', 'N/runtime', 'N/record'],
    function (serverWidget,task, search, redirect, render, file, https, runtime, record) {
        function onRequest(context) {
            var objResponse = context.response;
            if (context.request.method == 'GET') {
                var form = serverWidget.createForm({
                    title: 'MIS REPORT',
                    hideNavBar: false
                });
                form.addFieldGroup({
                    id: 'custpage_available_filter',
                    label: 'Filters'
                });
                var propertyFilter = [];
                var propertyList = [];
                //xg Insert Filters via Page URL Calls - Parameters - Pass values to Runsearch
                var subHolder = '';
                // var subsidiary = form.addField({
                //     id: 'custpage_subsidiary_filter',
                //     type: serverWidget.FieldType.MULTISELECT,
                //     label: 'SUBSIDIARY',
                //     source: 'subsidiary',
                //     container: 'custpage_available_filter'
                //
                // });
                // subsidiary.updateDisplaySize({
                //     height: 10,
                //     width: 500
                // });

                var property = form.addField({
                    id: 'custpage_location_filter',
                    type: serverWidget.FieldType.MULTISELECT,
                    label: 'PROPERTY',
                    container: 'custpage_available_filter'
                });
                property.isMandatory = true
                var propertySearch = search.load({
                    id: PROPERTYSEARCHPARENT
                });

                subHolder ? propertySearch.filters.push(search.createFilter({
                    name: 'subsidiary',
                    operator: 'anyof',
                    values: subHolder
                })) : false;


                propertySearch.run().each(function (result) {
                    var pSearchName = result.getValue({
                        name: 'name'
                    });
                    var pSearchIintId = result.id;
                    //push to property filter
                    propertyFilter.push(pSearchIintId);
                    propertyList.push(pSearchIintId)
                    property.addSelectOption({
                        value: pSearchIintId,
                        text: pSearchName
                    })
                    return true;
                });
                form.clientScriptFileId = 245402;
                var month = form.addField({
                    id: 'custpage_month',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Month',
                    source: '332', //accounting period
                    container: 'custpage_available_filter'
                });
                var year = form.addField({
                    id: 'custpage_year',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Year',
                    source: '331', //accounting period
                    container: 'custpage_available_filter'
                });
                month.isMandatory = true
                year.isMandatory = true


                // var accountingBooks = form.addField({
                //     id: 'custpage_accounting_books',
                //     type: serverWidget.FieldType.SELECT,
                //     label: 'Accounting Books',
                //     source: '-253', //accounting books
                //     container: 'custpage_available_filter'
                // });
                // var reportType = form.addField({
                //     id: 'custpage_report_type',
                //     type: serverWidget.FieldType.MULTISELECT,
                //     label: 'Report Type',
                //     container: 'custpage_available_filter'
                // });
                //
                // for (var i = 0; i < REPORTTYPE.length; i++) {
                //     reportType.addSelectOption({
                //         value: i,
                //         text: REPORTTYPE[i]
                //     })
                // }


                form.addButton({
                    id: 'custpage_previous',
                    label: 'Generate MIS Report',
                    functionName: 'generateExcelFile()'
                });

                context.response.writePage(form);


                if (context.request.parameters.searchFilter) {
                    try {

                    var objectToProcess = context.request.parameters
                    log.audit(' filters', JSON.stringify(objectToProcess))

                    var yearVal = objectToProcess.yearVal
                    var month = objectToProcess.month;
                    var property = objectToProcess.property
                    var year = objectToProcess.year
                    var location = objectToProcess.location
                    var myTask = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_ats_ss_generate_mis_report',
                        deploymentId: 'customdeploy_ats_ss_generate_mis_report',
                        params:  {
                            'custscript_property': property,
                            'custscript_month' : month,
                            'custscript_year' : year,
                            'custscript_yearval' : yearVal,
                            'custscript_location' : location

                        }
                    })
                    var objTaskId = myTask.submit();

                        context.response("PROCESSED");
                        return context.response("PROCESSED");
                    } catch (e) {
                        if (e.name == 'SCHEDULED_SCRIPT_ALREADY_RUNNING') {
                            return "PROCESSEDFAILED";
                        }
                    }


                }


            }

        }




        function lookForAccPeriod(period) {
            var accountPeriod;
            var accountingperiodSearchObj = search.load({
                id: 'customsearch_ats_accounting_period'
            })
            accountingperiodSearchObj.filters.push(search.createFilter({
                name: 'periodname',
                operator: 'contains',
                values: period
            }));
            accountingperiodSearchObj.run().each(function (result) {

                accountPeriod = result.getValue({
                    name: 'internalid',
                    summary: 'GROUP'
                })


                return true;
            });

            return accountPeriod;
        }

        return {
            onRequest: onRequest
        };


    }
);