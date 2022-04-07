/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/url', 'N/currentRecord', 'N/search', 'N/format'],
    function (url, currentRecord, search, format) {

        //
        function fieldChanged(context) {

            var accountPeriod = context.currentRecord.getValue({
                fieldId: 'custpage_accounting_period'
            });

            var location = context.currentRecord.getValue({
                fieldId: 'custpage_location_filter'
            });

            if (context.fieldId == 'custpage_accounting_period'){
                document.location = url.resolveScript({
                    scriptId: 264,
                    deploymentId: 1,
                    params: {
                        'accountperiod': accountPeriod,
                        'location' : location
                    }
                });
            }


        }
        //
        // function filterData(){
        //     var objRecord = currentRecord.get();
        //     var accountPeriod = objRecord.getValue({
        //         fieldId: 'custpage_period_filter'
        //     });
        //
        //     var location = objRecord.getValue({
        //         fieldId: 'custpage_location_filter'
        //     });
        //
        //     if (accountPeriod == null || accountPeriod == '') alert('Please select a period.');
        //     else
        //         document.location = url.resolveScript({
        //             scriptId: 542,
        //             deploymentId: 1,
        //             params: {
        //                 'accountperiod': accountPeriod,
        //                 'location' : location
        //             }
        //         });
        // }
        //
        function pageInit(context){

        }
        //
        // function stripHtml(html)
        // {
        //     var tmp = document.createElement("DIV");
        //     tmp.innerHTML = html;
        //     return tmp.textContent || tmp.innerText || "";
        // }
        //
        // function sublistToCsv() {
        //     //alert('here');
        //     var strSublist = 'custpage_table';
        //     var arrFieldsToPrint = '';
        //     var recCurrent = currentRecord.get();
        //     var arrSublistFields = ['financial_row', 'only_actual', 'ppa', 'actual', 'forecast', 'variance', 'budget'];
        //     var intLineCount = recCurrent.getLineCount({
        //         sublistId: strSublist
        //     })
        //     var arrRows = [];
        //     for(var i = 0; i < intLineCount; i++) {
        //         var arrRow = [];
        //         for(var j = 0; j < arrSublistFields.length; j++) {
        //             var strColValue = recCurrent.getSublistText({
        //                 sublistId: strSublist,
        //                 fieldId: arrSublistFields[j],
        //                 line: i
        //             }) || recCurrent.getSublistValue({
        //                 sublistId: strSublist,
        //                 fieldId: arrSublistFields[j],
        //                 line: i
        //             })
        //             arrRow.push(stripHtml(strColValue).replace(/,/g, ''));
        //         }
        //         arrRows.push(arrRow.join(','));
        //     }
        //
        //     var csvContent = "data:text/csv;charset=utf-8," + 'FINANCIAL ROW,PERIOD ONLY ACTUAL,PPA,ACTUAL,FORECAST,VARIANCE,BUDGET\r\n' + arrRows.join('\r\n');
        //
        //     if (arrRows.length > 0){
        //         csvContent = encodeURI(csvContent);
        //         var link = document.createElement("a");
        //         link.setAttribute("href",csvContent);
        //         link.setAttribute("download", "AccrualsReport_" + recCurrent.getText({fieldId: 'custpage_period_filter'}).split(' ').join('_').split(':').join('') + ".csv");
        //         document.body.appendChild(link); // Required for FF
        //
        //         link.click();
        //     }else {
        //         alert('Table is empty.');
        //     }
        //
        //
        // }

        function generateExcelFile(intSessionId) {

            document.location = url.resolveScript({
                scriptId: 'customscriptats_sl_mis_report',
                deploymentId: 'customdeployats_sl_mis_report',
                params: {
                    'generateExcel': 'T'
                }
            })

        }
        // function resolveScriptWithParameters(currRec, checkAction, csvContent) {
        //
        //     // Start of Field Processing
        //     var objParametersToProcess = {};
        //
        //     if (currRec) {
        //         var month = currRec.getText({
        //             fieldId: 'custpage_month'
        //         });
        //         var year = currRec.getText({
        //             fieldId: 'custpage_year'
        //         });
        //         var location = currRec.getValue({
        //             fieldId: 'custpage_location_filter'
        //         });
        //         var reportType = currRec.getValue({
        //             fieldId: 'custpage_report_type'
        //         });
        //
        //
        //         //Generate CSV - call for generateReportToCSV - Checks values to pass for Search
        //         if (checkAction == 'GETVALUES') {
        //
        //             location && location != '' ? (objParametersToProcess['location'] = location) : false;
        //             month && month != '' ? (objParametersToProcess['month'] = month) : false;
        //             year && year != '' ? (objParametersToProcess['year'] = year) : false;
        //             reportType && reportType != '' ? (objParametersToProcess['reportType'] = year) : false;
        //
        //             return objParametersToProcess;
        //         }
        //         //Ternary Value Checkers
        //
        //         year && year != '' ? (objParametersToProcess['year'] = encodeURIComponent(JSON.stringify(year))) : false;
        //         location && location != '' ? (objParametersToProcess['location'] = encodeURIComponent(JSON.stringify(location))) : false;
        //
        //         month && month != '' ? (objParametersToProcess['month'] = encodeURIComponent(JSON.stringify(month))) : false;
        //         reportType && reportType != '' ? (objParametersToProcess['reportType'] = encodeURIComponent(JSON.stringify(reportType))) : false;
        //
        //         if (checkAction == 'REPORTTYPECHANGED') {
        //             delete objParametersToProcess.location;
        //             delete objParametersToProcess.year;
        //             delete objParametersToProcess.month;
        //             delete objParametersToProcess.reportType;
        //         }
        //     }
        //
        //
        //     if (checkAction == 'CLEARFILTER') {
        //         objParametersToProcess = {};
        //     }
        //     if (checkAction == 'ACCOUNTPAGE') {
        //         var output = url.resolveRecord({
        //             recordType: 'customrecord_ats_account_page',
        //             recordId: 1,
        //             isEditMode: true,
        //             params: objParametersToProcess
        //         });
        //         window.open(output, 'Account Selection', 'width=900,height=1200');
        //         return;
        //     }
        //
        //     // Final Part of Generate CSV - Calls Restlet and send Email
        //     if (checkAction == 'SENDEMAIL') {
        //         //requestREstlet
        //         objParametersToProcess['sendEmail'] = 'T';
        //         var suitletURL = url.resolveScript({
        //             scriptId: scriptId,
        //             deploymentId: deploymentId,
        //             params: objParametersToProcess
        //         });
        //         var headersTest = {"Content-Type": "plain/text"};
        //         var response = https.post({
        //             url: suitletURL,
        //             headers: headersTest,
        //             body: encodeURIComponent(csvContent)
        //         });
        //         //alert(JSON.stringify(response));
        //         return JSON.stringify(response);
        //     }
        //
        //     if (checkAction == 'TRIGGERMRVIASLET') {
        //         //requestREstlet
        //         objParametersToProcess['getFieldsForProcessing'] = JSON.stringify(csvContent);
        //         //objParametersToProcess['triggerMR'] = 'T';
        //
        //         var suitletURL = url.resolveScript({
        //             scriptId: scriptId, deploymentId: deploymentId, params: objParametersToProcess
        //         });
        //         var headersTest = {"Content-Type": "plain/text"};
        //         var response = https.post({
        //             url: suitletURL, headers: headersTest, body: ''
        //         });
        //
        //
        //         return JSON.stringify(response);
        //     }
        //
        //
        //     document.location = url.resolveScript({
        //         scriptId: scriptId,
        //         deploymentId: deploymentId,
        //         params: objParametersToProcess
        //     });
        //
        // }


        return {
            //fieldChanged: fieldChanged,
            pageInit : pageInit,
            // filterData : filterData,
            // sublistToCsv : sublistToCsv,
            generateExcelFile: generateExcelFile
            // requestNewSnapshot: requestNewSnapshot
        };

    });