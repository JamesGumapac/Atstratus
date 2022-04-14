/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/url', 'N/currentRecord', 'N/search', 'N/format'],
    function (url, currentRecord, search, format) {

        //
        function fieldChanged(context) {
            var generateMisReport = context.currentRecord.getField({
                fieldId: 'custpage_previous'
            })
            var  month = context.currentRecord.getText({
                fieldId: 'custpage_month'
            })
            var year = context.currentRecord.getText({
                fieldId: 'custpage_year'
            })
            var property = context.currentRecord.getValue({
                fieldId: 'custpage_location_filter'
            })
            if( property !== '' && month !== '' && year !== '' ){
                generateMisReport.isDisabled = false
            }else{
                generateMisReport.isDisabled = true
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
        function pageInit(context) {
            var generateMisReport = context.currentRecord.getField({
                fieldId: 'custpage_previous'
            })
           // var  month = context.currentRecord.getText({
           //      fieldId: 'custpage_month'
           //  })
           //  var year = context.currentRecord.getText({
           //      fieldId: 'custpage_year'
           //  })
           //  var property = context.currentRecord.getValue({
           //      fieldId: 'custpage_location_filter'
           //  })
           //  console.log(month ,year ,property)
           //  if(month === '' && year === '' && property === ''){
                generateMisReport.isDisabled = true
           // }
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
            var objRecord = currentRecord.get();
            var location;
            var year;
            var month;
            var property;

            month = objRecord.getText({
                fieldId: 'custpage_month'
            })
            year = objRecord.getText({
                fieldId: 'custpage_year'
            })
            location = objRecord.getValue({
                fieldId: 'custpage_location_filter'
            })
            property = objRecord.getText({
                fieldId: 'custpage_location_filter'
            })



            var objParametersToProcess = {
                "year": encodeURIComponent(year),
                "month": encodeURIComponent(month),
                "property": encodeURIComponent(location),
                "location": encodeURIComponent(property),
                "searchFilter": 'T'
            };

            console.log(objParametersToProcess)
            document.location = url.resolveScript({
                scriptId: 'customscriptats_sl_mis_report',
                deploymentId: 'customdeployats_sl_mis_report',
                params: objParametersToProcess
            })

        }




        return {
           fieldChanged: fieldChanged,
            pageInit: pageInit,
            // filterData : filterData,
            // sublistToCsv : sublistToCsv,
            generateExcelFile: generateExcelFile
            // requestNewSnapshot: requestNewSnapshot
        };

    });