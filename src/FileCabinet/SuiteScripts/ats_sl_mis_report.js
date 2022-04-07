/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
const PROPERTYSEARCHPARENT = 'customsearch_ats_cogsreport_property'
const REPORTTYPE = ['ALL', 'STATISTIC', 'REVENUE', 'EXPENSE']

//CONSTS Declaration

define(['N/ui/serverWidget', 'N/search', 'N/redirect', 'N/render', 'N/file', 'N/https', 'N/runtime'],
    function (serverWidget, search, redirect, render, file, https, runtime) {
        function onRequest(context) {
            var objResponse = context.response;
            if (context.request.method == 'GET') {

                if (context.request.parameters.generateExcel) {
                    var fileHolderGenerated = file.load({
                        id: 246683
                    });

                    objResponse.writeFile({
                        file: fileHolderGenerated,
                        isInline: false
                    })

                    return;
                }

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


                var accountingBooks = form.addField({
                    id: 'custpage_accounting_books',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Accounting Books',
                    source: '-253', //accounting books
                    container: 'custpage_available_filter'
                });
                var reportType = form.addField({
                    id: 'custpage_report_type',
                    type: serverWidget.FieldType.MULTISELECT,
                    label: 'Report Type',
                    container: 'custpage_available_filter'
                });
                reportType.isMandatory = true
                for (var i = 0; i < REPORTTYPE.length; i++) {
                    reportType.addSelectOption({
                        value: i,
                        text: REPORTTYPE[i]
                    })
                }
                var searchHolder = search.load({
                    id: 'customsearch_ats_sum_stat_actual'
                });
                //test
                var objHolder = {};
                objHolder['statActual'] = [];
                objHolder['statBudget'] = [];

                // Manual placement of Title
                // objHolder['firstSearch'].push({
                //     "misCategory":"REVENUE CATEGORY",
                //     "misNoOFDays": "NO OF DAYS",
                //     "misRoomsAvail" : "ROOMS AVAILABLE",
                //     "misRoomsSold" : "ROOMS SOLD",
                //     "misActual":"ACTUAL",
                //     "misBudget":"BUDGET"
                // });

                // object Conversion
                searchHolder.run().each(function (result) {
                   // log.audit('title', JSON.stringify(result));
                    var noOfRoomsActual = result.getText({
                        name: 'custrecord_ats_sta_num_of_rooms',
                        summary: search.Summary.GROUP
                    });

                    var misNoOFDays = result.getValue({
                        name: 'custrecord_ats_mis_num_of_days',
                        summary: search.Summary.GROUP
                    });
                    var misRoomsAvail = result.getValue({
                        name: 'custrecord_ats_sta_rooms_available',
                        summary: search.Summary.GROUP
                    });

                    var roomSoldActual = result.getValue({
                        name: 'custrecord_ats_sta_room_sold',
                        summary: search.Summary.GROUP
                    });
                    var bedSoldActual = result.getValue({
                        name: 'custrecord_ats_sta_bed_sold',
                        summary: search.Summary.GROUP
                    });

                    var roomsGPActual = result.getValue({
                        name: 'custrecord2',
                        summary: search.Summary.GROUP
                    });

                    var roomsFBActual = result.getValue({
                        name: 'custrecord4',
                        summary: search.Summary.GROUP
                    });
                    var roomsHBActual = result.getValue({
                        name: 'custrecord6',
                        summary: search.Summary.GROUP
                    });

                    var roomsBBActual = result.getValue({
                        name: 'custrecord8',
                        summary: search.Summary.GROUP
                    });
                    var roomsDRActual = result.getValue({
                        name: 'custrecord10',
                        summary: search.Summary.GROUP
                    });

                    var bedGPActual = result.getValue({
                        name: 'custrecord12',
                        summary: search.Summary.GROUP
                    });
                    var bedFBActual = result.getValue({
                        name: 'custrecord14',
                        summary: search.Summary.GROUP
                    });
                    var bedHBActual = result.getValue({
                        name: 'custrecord16',
                        summary: search.Summary.GROUP
                    });
                    var bedBBActual = result.getValue({
                        name: 'custrecord18',
                        summary: search.Summary.GROUP
                    });
                    var bedDRActual = result.getValue({
                        name: 'custrecord20',
                        summary: search.Summary.GROUP
                    });
                    var doubleOccupancyActual = result.getValue({
                        name: 'custrecord_ats_sta_room_occupancy',
                        summary: search.Summary.GROUP
                    });
                    var roomOccupancyActual = result.getValue({
                        name: 'custrecord_ats_sta_room_occupancy',
                        summary: search.Summary.GROUP
                    })

                    var revParActual = result.getValue({
                        name: 'custrecord288',
                        summary: search.Summary.GROUP
                    });
                    var revPorActual = result.getValue({
                        name: 'custrecord291',
                        summary: search.Summary.GROUP
                    });


                    objHolder['statActual'].push({
                        "noOfRoomsActual": noOfRoomsActual,
                        "misNoOFDays": misNoOFDays,
                        "misRoomsAvail": misRoomsAvail,
                        "roomSoldActual": roomSoldActual,
                        "roomsGPActual": roomsGPActual,
                        "roomsFBActual": roomsFBActual,
                        "roomsHBActual": roomsHBActual,
                        "roomsBBActual": roomsBBActual,
                        "roomsDRActual": roomsDRActual,
                        "bedSoldActual": bedSoldActual,
                        "bedGPActual": bedGPActual,
                        "bedFBActual": bedFBActual,
                        "bedHBActual": bedHBActual,
                        "bedBBActual": bedBBActual,
                        "bedDRActual": bedDRActual,
                        "doubleOccupancyActual": doubleOccupancyActual,
                        "roomOccupancyActual": roomOccupancyActual,
                        "avarageRoomRateActual": "",
                        "revParActual": revParActual,
                        "revPorActual": revPorActual

                    });

                    return true;
                });

                // Add 2nd layer for display purposes

                // objHolder['firstSearch'].push({
                //     "misCategory": '',
                //     "misNoOFDays": '',
                //     "misRoomsAvail": '',
                //     "misRoomsSold": '',
                //     "misActual": '',
                //     "misBudget": '',
                //     //add filler part
                //     "misSpaceCreation": ' ',
                //     "fillerB": '',
                //     "fillerC": '',
                //     "fillerD": '',
                //     "fillerE": '',
                //     "fillerF": '',
                //     "fillerG": ''
                // });

                // searchHolder.run().each(function (result) {
                //     log.audit('title', JSON.stringify(result));
                //     var misCategory = result.getText({
                //         name: 'custrecord_ats_rev_category',
                //         summary: search.Summary.GROUP
                //     });
                //
                //
                //     var misNoOFDays = result.getValue({
                //         name: 'custrecord_ats_mis_num_of_days',
                //         summary: search.Summary.SUM
                //     });
                //
                //     var misRoomsAvail = result.getValue({
                //         name: 'custrecord_ats_mis_rooms_available',
                //         summary: search.Summary.SUM
                //     });
                //
                //     var misRoomsSold = result.getValue({
                //         name: 'custrecord_ats_mis_rooms_sold',
                //         summary: search.Summary.SUM
                //     });
                //
                //     var misActual = result.getValue({
                //         name: 'custrecord_ats_mis_actual',
                //         summary: search.Summary.GROUP
                //     });
                //
                //     var misBudget = result.getValue({
                //         name: 'custrecord_ats_mis_budget',
                //         summary: search.Summary.GROUP
                //     });
                //
                //     //defining static for test
                //     misRoomsAvail = 20;
                //     misRoomsSold = 30;
                //
                //     objHolder['firstSearch'].push({
                //         "misCategory": misCategory,
                //         "misNoOFDays": misNoOFDays,
                //         "misRoomsAvail": misRoomsAvail,
                //         "misRoomsSold": misRoomsSold,
                //         "misActual": misActual,
                //         "misBudget": misBudget,
                //         //add filler part
                //         "misSpaceCreation": ' ',
                //         "fillerB": misCategory,
                //         "fillerC": misNoOFDays,
                //         "fillerD": misRoomsAvail,
                //         "fillerE": misRoomsSold,
                //         "fillerF": misActual,
                //         "fillerG": misBudget
                //     });
                //
                //     return true;
                // });


                log.audit('JSON Sample Holder', JSON.stringify(objHolder));

                var genFile = genExcelXMLFile(objHolder, 246681);

                form.addButton({
                    id: 'custpage_previous',
                    label: 'Generate MIS Report',
                    functionName: 'generateExcelFile()'
                });

                context.response.writePage(form);


            }
        }

        function genExcelXMLFile(objArr, tempId) {

            var renderer = render.create();
            var dtNow = new Date();
            var fileTemplate = file.load({
                id: tempId
            });

            renderer.templateContent = fileTemplate.getContents();

            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'data',
                data: objArr
            })

            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'date',
                data: {'now': dtNow.toISOString()}
            })


            var fileXLSXML = file.create({
                name: 'ATS TEST GENFILE JAMES' + '.xls',
                fileType: file.Type.XMLDOC,
                contents: renderer.renderAsString()
            })
            fileXLSXML.folder = 264534;
            var fileId = fileXLSXML.save();

            return fileId;

        }

        return {
            onRequest: onRequest
        };


    });