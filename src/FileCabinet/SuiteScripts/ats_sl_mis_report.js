/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
const PROPERTYSEARCHPARENT = 'customsearch_ats_cogsreport_property'
const STATISTICSEARCH = 'customsearch_ats_sum_stat_actual'
const REVENUESEARCH = 'customsearchats_sum_rev_actual'
const EXPENSESEARCH = 'customsearch__ats_sum_exp_actual'
const REPORTTYPE = ['ALL', 'STATISTIC', 'REVENUE', 'EXPENSE']

//CONSTS Declaration

define(['N/ui/serverWidget', 'N/search', 'N/redirect', 'N/render', 'N/file', 'N/https', 'N/runtime', 'N/record'],
    function (serverWidget, search, redirect, render, file, https, runtime, record) {
        function onRequest(context) {
            var objResponse = context.response;
            if (context.request.method == 'GET') {

                if (context.request.parameters.searchFilter) {
                    var objectToProcess = context.request.parameters
                    log.audit(' filters', JSON.stringify(objectToProcess))
                    var objHolder = {};

                    objHolder['statActual'] = [];
                    objHolder['statActualPrev'] = [];
                    objHolder['revActual'] = [];
                    objHolder['revBudget'] = [];
                    objHolder['revActualPrev'] = [];
                    objHolder['expActual'] = [];
                    objHolder['expBudget'] = [];
                    objHolder['expActualPrev'] = [];
                    var month = objectToProcess.month;
                    var property = objectToProcess.property
                    var year = objectToProcess.year
                    var yearPrev = parseInt(year) - 1
                    var location = objectToProcess.location
                    var accountingperiod = month.substring(0, 3) + ' ' + year
                    var accountingperiodPrevious = month.substring(0, 3) + ' ' + yearPrev.toString()
                    log.audit('accountingperiodPrevious', accountingperiodPrevious)
                    var acctPeriod = lookForAccPeriod(accountingperiod)
                    var acctPeriodPrev = lookForAccPeriod(accountingperiodPrevious)
                    var misReport = month + ' ' + year + ' ' + location.replace(/%20/gi, " ")

                    var statSearch = search.load({
                        id: STATISTICSEARCH
                    });

                    statSearch.filters.push(search.createFilter({
                        name: 'custrecord_ats_sta_property',
                        operator: 'anyof',
                        values: property
                    }));
                    statSearch.filters.push(search.createFilter({
                        name: 'custrecord_ats_sta_accounting_period',
                        operator: 'anyof',
                        values: acctPeriod
                    }));


                    var searchResultCount = statSearch.runPaged().count;
                    if (searchResultCount > 0) {
                        statSearch.run().each(function (result) {
                            // log.audit('title', JSON.stringify(result));
                            var id = result.getValue({
                                name: 'internalid'
                            });
                            var noOfRoomsActual = result.getValue({
                                name: 'custrecord_ats_sta_num_of_rooms'
                            });

                            var misNoOFDays = result.getValue({
                                name: 'custrecord_ats_mis_num_of_days',
                            });
                            var misRoomsAvail = result.getValue({
                                name: 'custrecord_ats_sta_rooms_available'
                            });

                            var roomSoldActual = result.getValue({
                                name: 'custrecord_ats_sta_room_sold'
                            });
                            var bedSoldActual = result.getValue({
                                name: 'custrecord_ats_sta_bed_sold'
                            });

                            var roomsGPActual = result.getValue({
                                name: 'custrecord2'
                            });

                            var roomsFBActual = result.getValue({
                                name: 'custrecord4'
                            });
                            var roomsHBActual = result.getValue({
                                name: 'custrecord6'
                            });

                            var roomsBBActual = result.getValue({
                                name: 'custrecord8'
                            });
                            var roomsDRActual = result.getValue({
                                name: 'custrecord10'
                            });

                            var bedGPActual = result.getValue({
                                name: 'custrecord12'
                            });
                            var bedFBActual = result.getValue({
                                name: 'custrecord14'
                            });
                            var bedHBActual = result.getValue({
                                name: 'custrecord16'
                            });
                            var bedBBActual = result.getValue({
                                name: 'custrecord18'
                            });
                            var bedDRActual = result.getValue({
                                name: 'custrecord20'
                            });
                            var doubleOccupancyActual = result.getValue({
                                name: 'custrecord_ats_sta_room_occupancy'
                            });
                            var roomOccupancyActual = result.getValue({
                                name: 'custrecord_ats_sta_room_occupancy'
                            })

                            var revParActual = result.getValue({
                                name: 'custrecord288'
                            });
                            var revPorActual = result.getValue({
                                name: 'custrecord291'
                            });

                            var rec = record.load({
                                type: 'customrecord_ats_mis_statistic',
                                id: id,
                                isDynamic: true
                            })

                            var numOfRoomsBudget = rec.getValue('custrecord253')
                            var numOfdays = rec.getValue('custrecord_ats_sta_num_of_days')
                            var roomsAvailableBudget = rec.getValue('custrecord84')
                            var roomSoldBudget = rec.getValue('custrecord85')
                            var budgetRoomsGP = rec.getValue('custrecord22')
                            var budgetRoomsFB = rec.getValue('custrecord23')
                            var budgetRoomsHB = rec.getValue('custrecord24')
                            var budgetRoomsBB = rec.getValue('custrecord25')
                            var budgetRoomsDR = rec.getValue('custrecord26')
                            var bedSoldBudget = rec.getValue('custrecord86')
                            var budgetBedsGP = rec.getValue('custrecord27')
                            var budgetBedsFB = rec.getValue('custrecord28')
                            var budgetBedsHB = rec.getValue('custrecord29')
                            var budgetBedsBB = rec.getValue('custrecord30')
                            var budgetBedsDR = rec.getValue('custrecord31')
                            var doubleOccupancyBudget = rec.getValue('custrecord247')
                            var roomOccupancyBduget = rec.getValue('custrecord245')
                            //average room rate
                            var revParBudget = rec.getValue('custrecord289')
                            var revPorBudget = rec.getValue('custrecord292')


                            objHolder['statActual'].push({
                                "misReport": misReport,
                                "year": year,
                                "misPrevYear": yearPrev.toString(),
                                "month": month,
                                "noOfRoomsActual": noOfRoomsActual,
                                "misNoOFDays": misNoOFDays,
                                "misRoomsAvail": misRoomsAvail,
                                "roomSoldActual": formatNumber(roomSoldActual),
                                "roomsGPActual": formatNumber(roomsGPActual),
                                "roomsFBActual": formatNumber(roomsFBActual),
                                "roomsHBActual": formatNumber(roomsHBActual),
                                "roomsBBActual": formatNumber(roomsBBActual),
                                "roomsDRActual": formatNumber(roomsDRActual),
                                "bedGPActual": bedGPActual,
                                "bedFBActual": parseInt(bedFBActual),
                                "bedHBActual": bedHBActual,
                                "bedBBActual": bedBBActual,
                                "bedDRActual": bedDRActual,
                                "doubleOccupancyActual": doubleOccupancyActual,
                                "roomOccupancyActual": roomOccupancyActual,
                                "avarageRoomRateActual": "",
                                "revParActual": revParActual,
                                "revPorActual": revPorActual, // budget fields
                                "numOfRoomsBudget": numOfRoomsBudget,
                                "numOfdays": numOfdays,
                                "roomsAvailableBudget": roomsAvailableBudget,
                                "roomSoldBudget": roomSoldBudget,
                                "budgetRoomsGP": budgetRoomsGP,
                                "budgetRoomsFB": budgetRoomsFB,
                                "budgetRoomsHB": budgetRoomsHB,
                                "budgetRoomsBB": budgetRoomsBB,
                                "budgetRoomsDR": budgetRoomsDR,
                                "budgetBedsGP": budgetBedsGP,
                                "budgetBedsFB": budgetBedsFB,
                                "budgetBedsHB": budgetBedsHB,
                                "budgetBedsBB": budgetBedsBB,
                                "budgetBedsDR": budgetBedsDR


                            });

                            return true;
                        });
                    }
                    var statSearchPrev = search.load({
                        id: STATISTICSEARCH
                    });

                    statSearchPrev.filters.push(search.createFilter({
                        name: 'custrecord_ats_sta_property',
                        operator: 'anyof',
                        values: property
                    }));
                    statSearchPrev.filters.push(search.createFilter({
                        name: 'custrecord_ats_sta_accounting_period',
                        operator: 'anyof',
                        values: acctPeriodPrev
                    }));


                    var searchResultCount = statSearchPrev.runPaged().count;
                    if (searchResultCount > 0) {


                        statSearchPrev.run().each(function (result) {

                            var noOfRoomsActualPrev = result.getValue({
                                name: 'custrecord_ats_sta_num_of_rooms'
                            });

                            var misNoOFDaysPrev = result.getValue({
                                name: 'custrecord_ats_mis_num_of_days',
                            });
                            var misRoomsAvailPrev = result.getValue({
                                name: 'custrecord_ats_sta_rooms_available'
                            });

                            var roomSoldActualPrev = result.getValue({
                                name: 'custrecord_ats_sta_room_sold'
                            });
                            var bedSoldActualPrev = result.getValue({
                                name: 'custrecord_ats_sta_bed_sold'
                            });

                            var roomsGPActualPrev = result.getValue({
                                name: 'custrecord2'
                            });

                            var roomsFBActualPrev = result.getValue({
                                name: 'custrecord4'
                            });
                            var roomsHBActualPrev = result.getValue({
                                name: 'custrecord6'
                            });

                            var roomsBBActualPrev = result.getValue({
                                name: 'custrecord8'
                            });
                            var roomsDRActualPrev = result.getValue({
                                name: 'custrecord10'
                            });

                            var bedGPActualPrev = result.getValue({
                                name: 'custrecord12'
                            });
                            var bedFBActualPrev = result.getValue({
                                name: 'custrecord14'
                            });
                            var bedHBActualPrev = result.getValue({
                                name: 'custrecord16'
                            });
                            var bedBBActualPrev = result.getValue({
                                name: 'custrecord18'
                            });
                            var bedDRActualPrev = result.getValue({
                                name: 'custrecord20'
                            });

                            objHolder['statActualPrev'].push({

                                "noOfRoomsActualPrev": noOfRoomsActualPrev,
                                "misRoomsAvailPrev": misRoomsAvailPrev,
                                "roomsGPActualPrev": roomsGPActualPrev,
                                "roomsFBActualPrev": roomsFBActualPrev,
                                "roomsHBActualPrev": roomsHBActualPrev,
                                "roomsBBActualPrev": roomsBBActualPrev,
                                "roomsDRActualPrev": roomsDRActualPrev,
                                "bedGPActualPrev": bedGPActualPrev,
                                "bedFBActualPrev": bedFBActualPrev,
                                "bedHBActualPrev": bedHBActualPrev,
                                "bedBBActualPrev": bedBBActualPrev,
                                "bedDRActualPrev": bedDRActualPrev,


                            });

                            return true;
                        });
                    }

                    // Revenue


                    var revSearch = search.load({
                        id: REVENUESEARCH
                    });

                    revSearch.filters.push(search.createFilter({
                        name: 'custrecord_ats_mis_property',
                        operator: 'anyof',
                        values: property
                    }));
                    revSearch.filters.push(search.createFilter({
                        name: 'custrecord_ats_accounting_period',
                        operator: 'anyof',
                        values: acctPeriod
                    }));


                    var searchResultCount = revSearch.runPaged().count;
                    if (searchResultCount > 0) {
                        revSearch.run().each(function (result) {
                            // log.audit('title', JSON.stringify(result));
                            var budget = 'T'
                            var actual = 'T'
                            var id = result.getValue({
                                name: 'internalid'
                            });
                            var rec = record.load({
                                type: 'customrecord_ats_mis_revenue',
                                id: id,
                                isDynamic: true
                            })

                            if(actual === 'T'){
                                var roomsGP = rec.getValue('custrecord32')
                                var roomsFB = rec.getValue('custrecord35')
                                var roomsHB = rec.getValue('custrecord38')
                                var roomsBB = rec.getValue('custrecord41')
                                var roomsDR = rec.getValue('custrecord44')

                                var roomOther = rec.getValue('custrecord47')
                                var food = rec.getValue('custrecord50')
                                var bar = rec.getValue('custrecord53')
                                var extras = rec.getValue('custrecord59')
                                var curioShop = rec.getValue('custrecord62')
                                var flightsAndTransfers = rec.getValue('custrecord65')
                                var parkAndConservancyFees = rec.getValue('custrecord68')
                                var activitiesAndExcursions = rec.getValue('custrecord56')
                                var spa = rec.getValue('custrecord71')
                                var shanga = rec.getValue('custrecord74')
                                var conferences = rec.getValue('custrecord77')
                                var tourSales = rec.getValue('custrecord80')


                                objHolder['revActual'].push({
                                    "roomsGP": roomsGP,
                                    "roomsFB": roomsFB,
                                    "roomsHB": roomsHB,
                                    "roomsBB": roomsBB,
                                    "roomsDR": roomsDR,
                                    "roomOther": roomOther,
                                    "food": food,
                                    "bar": bar,
                                    "extras": extras,
                                    "curioShop": curioShop,
                                    "flightsAndTransfers": flightsAndTransfers,
                                    "parkAndConservancyFees": parkAndConservancyFees,
                                    "activitiesAndExcursions": activitiesAndExcursions,
                                    "spa": spa,
                                    "shanga": shanga,
                                    "conferences": conferences,
                                    "tourSales": tourSales,

                                });
                            }
                            //Budget Rev
                            if(budget === 'T') {
                                var roomsGP = rec.getValue('custrecord34')
                                var roomsFB = rec.getValue('custrecord36')
                                var roomsHB = rec.getValue('custrecord39')
                                var roomsBB = rec.getValue('custrecord42')
                                var roomsDR = rec.getValue('custrecord45')

                                var roomOther = rec.getValue('custrecord48')
                                var food = rec.getValue('custrecord51')
                                var bar = rec.getValue('custrecord54')
                                var extras = rec.getValue('custrecord60')
                                var curioShop = rec.getValue('custrecord63')
                                var flightsAndTransfers = rec.getValue('custrecord66')
                                var parkAndConservancyFees = rec.getValue('custrecord69')
                                var activitiesAndExcursions = rec.getValue('custrecord57')
                                var spa = rec.getValue('custrecord72')
                                var shanga = rec.getValue('custrecord75')
                                var conferences = rec.getValue('custrecord78')
                                var tourSales = rec.getValue('custrecord81')


                                objHolder['revBudget'].push({
                                    "roomsGP": roomsGP,
                                    "roomsFB": roomsFB,
                                    "roomsHB": roomsHB,
                                    "roomsBB": roomsBB,
                                    "roomsDR": roomsDR,
                                    "roomOther": roomOther,
                                    "food": food,
                                    "bar": bar,
                                    "extras": extras,
                                    "curioShop": curioShop,
                                    "flightsAndTransfers": flightsAndTransfers,
                                    "parkAndConservancyFees": parkAndConservancyFees,
                                    "activitiesAndExcursions": activitiesAndExcursions,
                                    "spa": spa,
                                    "shanga": shanga,
                                    "conferences": conferences,
                                    "tourSales": tourSales

                                });
                            }

                            return true;
                        });
                    }
                    var revSearchPrev = search.load({
                        id: REVENUESEARCH
                    });

                    revSearchPrev.filters.push(search.createFilter({
                        name: 'custrecord_ats_mis_property',
                        operator: 'anyof',
                        values: property
                    }));
                    revSearchPrev.filters.push(search.createFilter({
                        name: 'custrecord_ats_accounting_period',
                        operator: 'anyof',
                        values: acctPeriodPrev
                    }));


                    var searchResultCount = revSearchPrev.runPaged().count;
                    if (searchResultCount > 0) {


                        revSearchPrev.run().each(function (result) {
                            var id = result.getValue({
                                name: 'internalid'
                            });
                            var rec = record.load({
                                type: 'customrecord_ats_mis_revenue',
                                id: id,
                                isDynamic: true
                            })

                            var roomsGP = rec.getValue('custrecord32')
                            var roomsFB = rec.getValue('custrecord35')
                            var roomsHB = rec.getValue('custrecord38')
                            var roomsBB = rec.getValue('custrecord41')
                            var roomsDR = rec.getValue('custrecord44')

                            var roomOther = rec.getValue('custrecord47')
                            var food = rec.getValue('custrecord50')
                            var bar = rec.getValue('custrecord53')
                            var extras = rec.getValue('custrecord59')
                            var curioShop = rec.getValue('custrecord62')
                            var flightsAndTransfers = rec.getValue('custrecord65')
                            var parkAndConservancyFees = rec.getValue('custrecord68')
                            var activitiesAndExcursions = rec.getValue('custrecord56')
                            var spa = rec.getValue('custrecord71')
                            var shanga = rec.getValue('custrecord74')
                            var conferences = rec.getValue('custrecord77')
                            var tourSales = rec.getValue('custrecord80')


                            objHolder['revActualPrev'].push({
                                "roomsGP": roomsGP,
                                "roomsFB": roomsFB,
                                "roomsHB": roomsHB,
                                "roomsBB": roomsBB,
                                "roomsDR": roomsDR,
                                "roomOther": roomOther,
                                "food": food,
                                "bar": bar,
                                "extras": extras,
                                "curioShop": curioShop,
                                "flightsAndTransfers": flightsAndTransfers,
                                "parkAndConservancyFees": parkAndConservancyFees,
                                "activitiesAndExcursions": activitiesAndExcursions,
                                "spa": spa,
                                "shanga": shanga,
                                "conferences": conferences,
                                "tourSales": tourSales

                            });

                            return true;
                        });
                    }

                    // Expense


                    // var expSearch = search.load({
                    //     id: EXPENSESEARCH
                    // });
                    //
                    // expSearch.filters.push(search.createFilter({
                    //     name: 'custrecord_ats_mis_rev_property',
                    //     operator: 'anyof',
                    //     values: property
                    // }));
                    // expSearch.filters.push(search.createFilter({
                    //     name: 'custrecord_ats_exp_accounting_period',
                    //     operator: 'anyof',
                    //     values: acctPeriod
                    // }));
                    //
                    //
                    // var searchResultCount = expSearch.runPaged().count;
                    // if (searchResultCount > 0) {
                    //     expSearch.run().each(function (result) {
                    //         // log.audit('title', JSON.stringify(result));
                    //         var budget = 'T'
                    //         var actual = 'T'
                    //         var id = result.getValue({
                    //             name: 'internalid'
                    //         });
                    //         var rec = record.load({
                    //             type: 'customrecord_ats_mis_expense',
                    //             id: id,
                    //             isDynamic: true
                    //         })
                    //
                    //         if(actual === 'T'){
                    //             var roomsGP = rec.getValue('custrecord32')
                    //             var roomsFB = rec.getValue('custrecord35')
                    //             var roomsHB = rec.getValue('custrecord38')
                    //             var roomsBB = rec.getValue('custrecord41')
                    //             var roomsDR = rec.getValue('custrecord44')
                    //
                    //             var roomOther = rec.getValue('custrecord47')
                    //             var food = rec.getValue('custrecord50')
                    //             var bar = rec.getValue('custrecord53')
                    //             var extras = rec.getValue('custrecord59')
                    //             var curioShop = rec.getValue('custrecord62')
                    //             var flightsAndTransfers = rec.getValue('custrecord65')
                    //             var parkAndConservancyFees = rec.getValue('custrecord68')
                    //             var activitiesAndExcursions = rec.getValue('custrecord56')
                    //             var spa = rec.getValue('custrecord71')
                    //             var shanga = rec.getValue('custrecord74')
                    //             var conferences = rec.getValue('custrecord77')
                    //             var tourSales = rec.getValue('custrecord80')
                    //
                    //
                    //             objHolder['revActual'].push({
                    //                 "roomsGP": roomsGP,
                    //                 "roomsFB": roomsFB,
                    //                 "roomsHB": roomsHB,
                    //                 "roomsBB": roomsBB,
                    //                 "roomsDR": roomsDR,
                    //                 "roomOther": roomOther,
                    //                 "food": food,
                    //                 "bar": bar,
                    //                 "extras": extras,
                    //                 "curioShop": curioShop,
                    //                 "flightsAndTransfers": flightsAndTransfers,
                    //                 "parkAndConservancyFees": parkAndConservancyFees,
                    //                 "activitiesAndExcursions": activitiesAndExcursions,
                    //                 "spa": spa,
                    //                 "shanga": shanga,
                    //                 "conferences": conferences,
                    //                 "tourSales": tourSales
                    //
                    //             });
                    //         }
                    //         //Budget Rev
                    //         if(budget === 'T') {
                    //             vc_bar = rec.getValue('custrecord97')
                    //             vc_food = rec.getValue('custrecord94')
                    //             vc_housekeeping = rec.getValue('custrecord100')
                    //             vc_gascost = rec.getValue('custrecord103')
                    //             vc_kitchenconsumables = rec.getValue('custrecord106')
                    //             vc_driverscost = rec.getValue('custrecord109')
                    //             vc_guestwaterbottle = rec.getValue('custrecord112')
                    //             vc_landandlife = rec.getValue('custrecord115')
                    //             vc_conferences = rec.getValue('custrecord118')
                    //
                    //             var roomOther = rec.getValue('custrecord48')
                    //             var food = rec.getValue('custrecord51')
                    //             var bar = rec.getValue('custrecord54')
                    //             var extras = rec.getValue('custrecord60')
                    //             var curioShop = rec.getValue('custrecord63')
                    //             var flightsAndTransfers = rec.getValue('custrecord66')
                    //             var parkAndConservancyFees = rec.getValue('custrecord69')
                    //             var activitiesAndExcursions = rec.getValue('custrecord57')
                    //             var spa = rec.getValue('custrecord72')
                    //             var shanga = rec.getValue('custrecord75')
                    //             var conferences = rec.getValue('custrecord78')
                    //             var tourSales = rec.getValue('custrecord81')
                    //
                    //
                    //             objHolder['revBudget'].push({
                    //                 "vc_bar": vc_bar,
                    //                 "vc_food": vc_food,
                    //                 "vc_housekeeping": vc_housekeeping,
                    //                 "vc_gascost": vc_gascost,
                    //                 "vc_kitchenconsumables": vc_kitchenconsumables,
                    //                 "vc_driverscost": vc_guestwaterbottle,
                    //                 "vc_landandlife": vc_landandlife,
                    //                 "bar": bar,
                    //                 "extras": extras,
                    //                 "curioShop": curioShop,
                    //                 "flightsAndTransfers": flightsAndTransfers,
                    //                 "parkAndConservancyFees": parkAndConservancyFees,
                    //                 "activitiesAndExcursions": activitiesAndExcursions,
                    //                 "spa": spa,
                    //                 "shanga": shanga,
                    //                 "conferences": conferences,
                    //                 "tourSales": tourSales
                    //
                    //             });
                    //         }
                    //
                    //         return true;
                    //     });
                    // }
                    // var revSearchPrev = search.load({
                    //     id: REVENUESEARCH
                    // });
                    //
                    // revSearchPrev.filters.push(search.createFilter({
                    //     name: 'custrecord_ats_mis_property',
                    //     operator: 'anyof',
                    //     values: property
                    // }));
                    // revSearchPrev.filters.push(search.createFilter({
                    //     name: 'custrecord_ats_accounting_period',
                    //     operator: 'anyof',
                    //     values: acctPeriodPrev
                    // }));
                    //
                    //
                    // var searchResultCount = revSearchPrev.runPaged().count;
                    // if (searchResultCount > 0) {
                    //
                    //
                    //     revSearchPrev.run().each(function (result) {
                    //         var id = result.getValue({
                    //             name: 'internalid'
                    //         });
                    //         var rec = record.load({
                    //             type: 'customrecord_ats_mis_revenue',
                    //             id: id,
                    //             isDynamic: true
                    //         })
                    //
                    //         var roomsGP = rec.getValue('custrecord32')
                    //         var roomsFB = rec.getValue('custrecord35')
                    //         var roomsHB = rec.getValue('custrecord38')
                    //         var roomsBB = rec.getValue('custrecord41')
                    //         var roomsDR = rec.getValue('custrecord44')
                    //
                    //         var roomOther = rec.getValue('custrecord47')
                    //         var food = rec.getValue('custrecord50')
                    //         var bar = rec.getValue('custrecord53')
                    //         var extras = rec.getValue('custrecord59')
                    //         var curioShop = rec.getValue('custrecord62')
                    //         var flightsAndTransfers = rec.getValue('custrecord65')
                    //         var parkAndConservancyFees = rec.getValue('custrecord68')
                    //         var activitiesAndExcursions = rec.getValue('custrecord56')
                    //         var spa = rec.getValue('custrecord71')
                    //         var shanga = rec.getValue('custrecord74')
                    //         var conferences = rec.getValue('custrecord77')
                    //         var tourSales = rec.getValue('custrecord80')
                    //
                    //
                    //         objHolder['revActualPrev'].push({
                    //             "roomsGP": 120,
                    //             "roomsFB": roomsFB,
                    //             "roomsHB": roomsHB,
                    //             "roomsBB": roomsBB,
                    //             "roomsDR": roomsDR,
                    //             "roomOther": roomOther,
                    //             "food": food,
                    //             "bar": bar,
                    //             "extras": extras,
                    //             "curioShop": curioShop,
                    //             "flightsAndTransfers": flightsAndTransfers,
                    //             "parkAndConservancyFees": parkAndConservancyFees,
                    //             "activitiesAndExcursions": activitiesAndExcursions,
                    //             "spa": spa,
                    //             "shanga": shanga,
                    //             "conferences": conferences,
                    //             "tourSales": tourSales
                    //
                    //         });
                    //
                    //         return true;
                    //     });
                    // }

                    log.audit('ObjectHolder ', JSON.stringify(objHolder))


                    var genFile = genExcelXMLFile(objHolder, 247859);
                    var fileHolderGenerated;
                    var excelFile;
                    var fileSearchObj = search.create({
                        type: "file",
                        filters:
                            [
                                ["name", "contains", "ATS TEST GENFILE Latest.xls"]
                            ],
                        columns:
                            [
                                search.createColumn({name: "internalid", label: "Internal ID"})
                            ]
                    });
                    var searchResultCountFile = fileSearchObj.runPaged().count;
                    if (searchResultCountFile > 0) {
                        fileSearchObj.run().each(function (result) {
                            excelFile = result.getValue({
                                name: 'internalid'
                            })
                        })
                        if (excelFile) {
                            fileHolderGenerated = file.load({
                                id: excelFile
                            });
                            objResponse.writeFile({
                                file: fileHolderGenerated,
                                isInline: false
                            })
                        }
                    }

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
                name: 'ATS TEST GENFILE Latest' + '.xls',
                fileType: file.Type.XMLDOC,
                contents: renderer.renderAsString()
            })
            fileXLSXML.folder = 264534;
            var fileId = fileXLSXML.save();

            return fileId;

        }

        function formatNumber(n) {
            return n.replace(/./g, function (c, i, a) {
                return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
            });
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


    });