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
                    } else {
                        objHolder['statActual'].push({
                            "misReport": misReport,
                            "year": year,
                            "misPrevYear": yearPrev.toString(),
                            "month": month,
                            "noOfRoomsActual": 0,
                            "misNoOFDays": 0,
                            "misRoomsAvail": 0,
                            "roomSoldActual": 0,
                            "roomsGPActual": 0,
                            "roomsFBActual": 0,
                            "roomsHBActual": 0,
                            "roomsBBActual": 0,
                            "roomsDRActual": 0,
                            "bedGPActual": 0,
                            "bedFBActual": 0,
                            "bedHBActual": 0,
                            "bedBBActual": 0,
                            "bedDRActual": 0,
                            "doubleOccupancyActual": 0,
                            "roomOccupancyActual": 0,
                            "avarageRoomRateActual": "",
                            "revParActual": 0,
                            "revPorActual": 0, // budget fields
                            "numOfRoomsBudget": 0,
                            "numOfdays": 0,
                            "roomsAvailableBudget": 0,
                            "roomSoldBudget": 0,
                            "budgetRoomsGP": 0,
                            "budgetRoomsFB": 0,
                            "budgetRoomsHB": 0,
                            "budgetRoomsBB": 0,
                            "budgetRoomsDR": 0,
                            "budgetBedsGP": 0,
                            "budgetBedsFB": 0,
                            "budgetBedsHB": 0,
                            "budgetBedsBB": 0,
                            "budgetBedsDR": 0
                        })
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
                    } else {
                        objHolder['statActualPrev'].push({

                            "noOfRoomsActualPrev": 0,
                            "misRoomsAvailPrev": 0,
                            "roomsGPActualPrev": 0,
                            "roomsFBActualPrev": 0,
                            "roomsHBActualPrev": 0,
                            "roomsBBActualPrev": 0,
                            "roomsDRActualPrev": 0,
                            "bedGPActualPrev": 0,
                            "bedFBActualPrev": 0,
                            "bedHBActualPrev": 0,
                            "bedBBActualPrev": 0,
                            "bedDRActualPrev": 0,


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

                            if (actual === 'T') {
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
                                var otherIncome = 0;


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
                                    "otherIncome": otherIncome

                                });
                            }
                            //Budget Rev
                            if (budget === 'T') {
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
                                var otherIncome = 0;

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
                                    "tourSales": tourSales,
                                    "otherIncome": otherIncome

                                });
                            }

                            return true;
                        });
                    } else {
                        objHolder['revActual'].push({
                            "roomsGP": 0,
                            "roomsFB": 0,
                            "roomsHB": 0,
                            "roomsBB": 0,
                            "roomsDR": 0,
                            "roomOther": 0,
                            "food": 0,
                            "bar": 0,
                            "extras": 0,
                            "curioShop": 0,
                            "flightsAndTransfers": 0,
                            "parkAndConservancyFees": 0,
                            "activitiesAndExcursions": 0,
                            "spa": 0,
                            "shanga": 0,
                            "conferences": 0,
                            "tourSales": 0,
                            "otherIncome": 0

                        });

                        objHolder['revBudget'].push({
                            "roomsGP": 0,
                            "roomsFB": 0,
                            "roomsHB": 0,
                            "roomsBB": 0,
                            "roomsDR": 0,
                            "roomOther": 0,
                            "food": 0,
                            "bar": 0,
                            "extras": 0,
                            "curioShop": 0,
                            "flightsAndTransfers": 0,
                            "parkAndConservancyFees": 0,
                            "activitiesAndExcursions": 0,
                            "spa": 0,
                            "shanga": 0,
                            "conferences": 0,
                            "tourSales": 0,
                            "otherIncome": 0

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
                            var otherIncome = 0;

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
                                "tourSales": tourSales,
                                "otherIncome": otherIncome

                            });

                            return true;
                        });
                    } else {
                        objHolder['revActualPrev'].push({
                            "roomsGP": 0,
                            "roomsFB": 0,
                            "roomsHB": 0,
                            "roomsBB": 0,
                            "roomsDR": 0,
                            "roomOther": 0,
                            "food": 0,
                            "bar": 0,
                            "extras": 0,
                            "curioShop": 0,
                            "flightsAndTransfers": 0,
                            "parkAndConservancyFees": 0,
                            "activitiesAndExcursions": 0,
                            "spa": 0,
                            "shanga": 0,
                            "conferences": 0,
                            "tourSales": 0,
                            "otherIncome": 0


                        });
                    }

                    // Expense


                    var expSearch = search.load({
                        id: EXPENSESEARCH
                    });

                    expSearch.filters.push(search.createFilter({
                        name: 'custrecord_ats_mis_rev_property',
                        operator: 'anyof',
                        values: property
                    }));
                    expSearch.filters.push(search.createFilter({
                        name: 'custrecord_ats_exp_accounting_period',
                        operator: 'anyof',
                        values: acctPeriod
                    }));


                    var searchResultCount = expSearch.runPaged().count;
                    if (searchResultCount > 0) {
                        expSearch.run().each(function (result) {
                            // log.audit('title', JSON.stringify(result));
                            var budget = 'T'
                            var actual = 'T'
                            var id = result.getValue({
                                name: 'internalid'
                            });
                            var rec = record.load({
                                type: 'customrecord_ats_mis_expense',
                                id: id,
                                isDynamic: true
                            })

                            if (actual === 'T') {
                                var taxes = rec.getValue('custrecord87')
                                var concessionfees = rec.getValue('custrecord90')
                                var vc_bar = rec.getValue('custrecord96')
                                var vc_food = rec.getValue('custrecord93')
                                var vc_housekeeping = rec.getValue('custrecord99')
                                var vc_gascost = rec.getValue('custrecord102')
                                var vc_kitchenconsumables = rec.getValue('custrecord105')
                                var vc_driverscost = rec.getValue('custrecord108')
                                var vc_guestwaterbottle = rec.getValue('custrecord111')
                                var vc_landandlife = rec.getValue('custrecord114')
                                var vc_conferences = rec.getValue('custrecord117')

                                var ec_staffpayroll = rec.getValue('custrecord120')
                                var ec_managementpayroll = rec.getValue('custrecord123')
                                var ec_stafftransport = rec.getValue('custrecord124')
                                var ec_staffuniform = rec.getValue('custrecord129')
                                var ec_stafftraining = rec.getValue('custrecord132')
                                var ec_staffcanteen = rec.getValue('custrecord135')
                                var ec_stafffothers = rec.getValue('custrecord138')
                                var fc_administration = rec.getValue('custrecord141')
                                var fc_software = rec.getValue('custrecord144')
                                var fc_guestgiveaway = rec.getValue('custrecord147')
                                var fc_campingfee = rec.getValue('custrecord150')
                                var fc_licenseandsubscription = rec.getValue('custrecord153')
                                var fc_insurance = rec.getValue('custrecord156')
                                var fc_servicestock = rec.getValue('custrecord159')
                                var fc_printingandstationary = rec.getValue('custrecord162')
                                var fc_teleandinternet = rec.getValue('custrecord165')
                                var fc_spoilages = rec.getValue('custrecord168')
                                var fc_bankcharges = rec.getValue('custrecord171')
                                var fc_audit = rec.getValue('custrecord174')
                                var fc_airtravel = rec.getValue('custrecord177')
                                var fc_security = rec.getValue('custrecord180')


                                var oc_electricity = rec.getValue('custrecord183')
                                var oc_fuel = rec.getValue('custrecord186')
                                var oc_servicevehicle = rec.getValue('custrecord189')
                                var oc_vehiclegp = rec.getValue('custrecord192')
                                var oc_vehiclecp = rec.getValue('custrecord195')
                                var oc_vehilehire = rec.getValue('custrecord198')
                                var oc_repairsandmaintenace = rec.getValue('custrecord201')
                                var oc_kerosene = rec.getValue('custrecord204')
                                var oc_water = rec.getValue('custrecord207')

                                var cr_foodcost = rec.getValue('custrecord210')
                                var cr_barcost = rec.getValue('custrecord213')
                                var cr_extracost = rec.getValue('custrecord216')
                                var cr_shopcost = rec.getValue('custrecord219')
                                var cr_flightandtransfer = rec.getValue('custrecord222')
                                var cr_parkandconservancy = rec.getValue('custrecord225')
                                var cr_activityandexcursion = rec.getValue('custrecord228')
                                var cr_spa = rec.getValue('custrecord231')
                                var cr_shanga = rec.getValue('custrecord234')
                                var cr_conference = rec.getValue('custrecord237')
                                var cr_tourcost = rec.getValue('custrecord240')
                                var salesRelated = rec.getValue('custrecord300')


                                objHolder['expActual'].push({
                                    "taxes": taxes,
                                    "concessionfees": concessionfees,
                                    "vc_bar": vc_bar,
                                    "vc_food": vc_food,
                                    "vc_housekeeping": vc_housekeeping,
                                    "vc_gascost": vc_gascost,
                                    "vc_kitchenconsumables": vc_kitchenconsumables,
                                    "vc_guestwaterbottle": vc_guestwaterbottle,
                                    "vc_driverscost": vc_driverscost,
                                    "vc_landandlife": vc_landandlife,
                                    "vc_conferences": vc_conferences,
                                    "ec_staffpayroll": ec_staffpayroll,
                                    "ec_managementpayroll": ec_managementpayroll,
                                    "ec_stafftransport": ec_stafftransport,
                                    "ec_staffuniform": ec_staffuniform,
                                    "ec_stafftraining": ec_stafftraining,
                                    "ec_stafffothers": ec_stafffothers,
                                    "fc_administration": fc_administration,
                                    "fc_software": fc_software,
                                    "fc_guestgiveaway": fc_guestgiveaway,
                                    "fc_campingfee": fc_campingfee,
                                    "fc_licenseandsubscription": fc_licenseandsubscription,
                                    "fc_insurance": fc_insurance,
                                    "fc_servicestock": fc_servicestock,
                                    "fc_printingandstationary": fc_printingandstationary,
                                    "fc_teleandinternet": fc_teleandinternet,
                                    "fc_spoilages": fc_spoilages,
                                    "fc_bankcharges": fc_bankcharges,
                                    "fc_audit": fc_audit,
                                    "fc_airtravel": fc_airtravel,
                                    "fc_security": fc_security,
                                    "oc_electricity": oc_electricity,
                                    "oc_fuel": oc_fuel,
                                    "ec_staffcanteen": ec_staffcanteen,
                                    "oc_vehiclegp": oc_vehiclegp,
                                    "oc_vehiclecp": oc_vehiclecp,
                                    "oc_vehilehire": oc_vehilehire,
                                    "oc_servicevehicle": oc_servicevehicle,
                                    "oc_repairsandmaintenace": oc_repairsandmaintenace,
                                    "oc_kerosene": oc_kerosene,
                                    "oc_water": oc_water,
                                    "cr_foodcost": cr_foodcost,
                                    "cr_barcost": cr_barcost,
                                    "cr_extracost": cr_extracost,
                                    "cr_shopcost": cr_shopcost,
                                    "cr_conference": cr_conference,
                                    "cr_flightandtransfer": cr_flightandtransfer,
                                    "cr_parkandconservancy": cr_parkandconservancy,
                                    "cr_activityandexcursion": cr_activityandexcursion,
                                    "cr_spa": cr_spa,
                                    "cr_shanga": cr_shanga,
                                    "cr_tourcost": cr_tourcost,
                                    "salesRelated": salesRelated
                                });
                            }
                            //Budget Rev
                            if (budget === 'T') {
                                var taxes = rec.getValue('custrecord88')
                                var concessionfees = rec.getValue('custrecord91')
                                var vc_bar = rec.getValue('custrecord97')
                                var vc_food = rec.getValue('custrecord94')
                                var vc_housekeeping = rec.getValue('custrecord100')
                                var vc_gascost = rec.getValue('custrecord103')
                                var vc_kitchenconsumables = rec.getValue('custrecord106')
                                var vc_driverscost = rec.getValue('custrecord109')
                                var vc_guestwaterbottle = rec.getValue('custrecord112')
                                var vc_landandlife = rec.getValue('custrecord115')
                                var vc_conferences = rec.getValue('custrecord118')

                                var ec_staffpayroll = rec.getValue('custrecord121')
                                var ec_managementpayroll = rec.getValue('custrecord124')
                                var ec_stafftransport = rec.getValue('custrecord127')
                                var ec_staffuniform = rec.getValue('custrecord130')
                                var ec_stafftraining = rec.getValue('custrecord133')
                                var ec_staffcanteen = rec.getValue('custrecord136')
                                var ec_stafffothers = rec.getValue('custrecord139')
                                var fc_administration = rec.getValue('custrecord142')
                                var fc_software = rec.getValue('custrecord145')
                                var fc_guestgiveaway = rec.getValue('custrecord148')
                                var fc_campingfee = rec.getValue('custrecord151')
                                var fc_licenseandsubscription = rec.getValue('custrecord154')
                                var fc_insurance = rec.getValue('custrecord157')
                                var fc_servicestock = rec.getValue('custrecord160')
                                var fc_printingandstationary = rec.getValue('custrecord163')
                                var fc_teleandinternet = rec.getValue('custrecord166')
                                var fc_spoilages = rec.getValue('custrecord169')
                                var fc_bankcharges = rec.getValue('custrecord172')
                                var fc_audit = rec.getValue('custrecord175')
                                var fc_airtravel = rec.getValue('custrecord178')
                                var fc_security = rec.getValue('custrecord181')


                                var oc_electricity = rec.getValue('custrecord184')
                                var oc_fuel = rec.getValue('custrecord187')
                                var oc_servicevehicle = rec.getValue('custrecord190')
                                var oc_vehiclegp = rec.getValue('custrecord193')
                                var oc_vehiclecp = rec.getValue('custrecord196')
                                var oc_vehilehire = rec.getValue('custrecord199')
                                var oc_repairsandmaintenace = rec.getValue('custrecord202')
                                var oc_kerosene = rec.getValue('custrecord205')
                                var oc_water = rec.getValue('custrecord208')

                                var cr_foodcost = rec.getValue('custrecord211')
                                var cr_barcost = rec.getValue('custrecord214')
                                var cr_extracost = rec.getValue('custrecord217')
                                var cr_shopcost = rec.getValue('custrecord220')
                                var cr_flightandtransfer = rec.getValue('custrecord223')
                                var cr_parkandconservancy = rec.getValue('custrecord226')
                                var cr_activityandexcursion = rec.getValue('custrecord229')
                                var cr_spa = rec.getValue('custrecord232')
                                var cr_shanga = rec.getValue('custrecord235')
                                var cr_conference = rec.getValue('custrecord238')
                                var cr_tourcost = rec.getValue('custrecord241')
                                var salesRelated = rec.getValue('custrecord302')

                                objHolder['expBudget'].push({
                                    "taxes": taxes,
                                    "concessionfees": concessionfees,
                                    "vc_bar": vc_bar,
                                    "vc_food": vc_food,
                                    "vc_housekeeping": vc_housekeeping,
                                    "vc_gascost": vc_gascost,
                                    "vc_kitchenconsumables": vc_kitchenconsumables,
                                    "vc_guestwaterbottle": vc_guestwaterbottle,
                                    "vc_driverscost": vc_driverscost,
                                    "vc_landandlife": vc_landandlife,
                                    "vc_conferences": vc_conferences,
                                    "ec_staffpayroll": ec_staffpayroll,
                                    "ec_managementpayroll": ec_managementpayroll,
                                    "ec_stafftransport": ec_stafftransport,
                                    "ec_staffuniform": ec_staffuniform,
                                    "ec_stafftraining": ec_stafftraining,
                                    "ec_stafffothers": ec_stafffothers,
                                    "fc_administration": fc_administration,
                                    "fc_software": fc_software,
                                    "fc_guestgiveaway": fc_guestgiveaway,
                                    "fc_campingfee": fc_campingfee,
                                    "fc_licenseandsubscription": fc_licenseandsubscription,
                                    "fc_insurance": fc_insurance,
                                    "fc_servicestock": fc_servicestock,
                                    "fc_printingandstationary": fc_printingandstationary,
                                    "fc_teleandinternet": fc_teleandinternet,
                                    "fc_spoilages": fc_spoilages,
                                    "fc_bankcharges": fc_bankcharges,
                                    "fc_audit": fc_audit,
                                    "fc_airtravel": fc_airtravel,
                                    "fc_security": fc_security,
                                    "oc_electricity": oc_electricity,
                                    "oc_fuel": oc_fuel,
                                    "ec_staffcanteen": ec_staffcanteen,
                                    "oc_vehiclegp": oc_vehiclegp,
                                    "oc_vehiclecp": oc_vehiclecp,
                                    "oc_vehilehire": oc_vehilehire,
                                    "oc_servicevehicle": oc_servicevehicle,
                                    "oc_repairsandmaintenace": oc_repairsandmaintenace,
                                    "oc_kerosene": oc_kerosene,
                                    "oc_water": oc_water,
                                    "cr_foodcost": cr_foodcost,
                                    "cr_barcost": cr_barcost,
                                    "cr_extracost": cr_extracost,
                                    "cr_shopcost": cr_shopcost,
                                    "cr_conference": cr_conference,
                                    "cr_flightandtransfer": cr_flightandtransfer,
                                    "cr_parkandconservancy": cr_parkandconservancy,
                                    "cr_activityandexcursion": cr_activityandexcursion,
                                    "cr_spa": cr_spa,
                                    "cr_shanga": cr_shanga,
                                    "cr_tourcost": cr_tourcost,
                                    "salesRelated" : salesRelated

                                });
                            }

                            return true;
                        });
                    } else {
                        objHolder['expActual'].push({
                            "taxes": 0,
                            "concessionfees": 0,
                            "vc_bar": 0,
                            "vc_food": 0,
                            "vc_housekeeping": 0,
                            "vc_gascost": 0,
                            "vc_kitchenconsumables": 0,
                            "vc_guestwaterbottle": 0,
                            "vc_landandlife": 0,
                            "vc_driverscost": 0,
                            "vc_conferences": 0,
                            "ec_staffpayroll": 0,
                            "ec_managementpayroll": 0,
                            "ec_stafftransport": 0,
                            "ec_staffuniform": 0,
                            "ec_stafftraining": 0,
                            "ec_stafffothers": 0,
                            "fc_administration": 0,
                            "fc_software": 0,
                            "fc_guestgiveaway": 0,
                            "fc_campingfee": 0,
                            "fc_licenseandsubscription": 0,
                            "fc_insurance": 0,
                            "fc_servicestock": 0,
                            "fc_printingandstationary": 0,
                            "fc_teleandinternet": 0,
                            "fc_spoilages": 0,
                            "fc_bankcharges": 0,
                            "fc_audit": 0,
                            "fc_airtravel": 0,
                            "fc_security": 0,
                            "oc_electricity": 0,
                            "oc_fuel": 0,
                            "ec_staffcanteen": 0,
                            "oc_vehiclegp": 0,
                            "oc_vehiclecp": 0,
                            "oc_vehilehire": 0,
                            "oc_servicevehicle": 0,
                            "oc_repairsandmaintenace": 0,
                            "oc_kerosene": 0,
                            "oc_water": 0,
                            "cr_foodcost": 0,
                            "cr_conference": 0,
                            "cr_barcost": 0,
                            "cr_extracost": 0,
                            "cr_shopcost": 0,
                            "cr_flightandtransfer": 0,
                            "cr_parkandconservancy": 0,
                            "cr_activityandexcursion": 0,
                            "cr_spa": 0,
                            "cr_shanga": 0,
                            "cr_tourcost": 0,
                            "salesRelated": 0

                        });

                        objHolder['expBudget'].push({
                            "taxes": 0,
                            "concessionfees": 0,
                            "vc_bar": 0,
                            "vc_food": 0,
                            "vc_housekeeping": 0,
                            "vc_gascost": 0,
                            "vc_kitchenconsumables": 0,
                            "vc_guestwaterbottle": 0,
                            "vc_driverscost": 0,
                            "vc_landandlife": 0,
                            "vc_conferences": 0,
                            "ec_staffpayroll": 0,
                            "ec_managementpayroll": 0,
                            "ec_stafftransport": 0,
                            "ec_staffuniform": 0,
                            "ec_stafftraining": 0,
                            "ec_stafffothers": 0,
                            "fc_administration": 0,
                            "fc_software": 0,
                            "fc_guestgiveaway": 0,
                            "fc_campingfee": 0,
                            "fc_licenseandsubscription": 0,
                            "fc_insurance": 0,
                            "fc_servicestock": 0,
                            "fc_printingandstationary": 0,
                            "fc_teleandinternet": 0,
                            "fc_spoilages": 0,
                            "fc_bankcharges": 0,
                            "fc_audit": 0,
                            "fc_airtravel": 0,
                            "fc_security": 0,
                            "oc_electricity": 0,
                            "oc_fuel": 0,
                            "ec_staffcanteen": 0,
                            "oc_vehiclegp": 0,
                            "oc_vehiclecp": 0,
                            "oc_vehilehire": 0,
                            "oc_servicevehicle": 0,
                            "oc_repairsandmaintenace": 0,
                            "oc_kerosene": 0,
                            "oc_water": 0,
                            "cr_foodcost": 0,
                            "cr_conference": 0,
                            "cr_barcost": 0,
                            "cr_extracost": 0,
                            "cr_shopcost": 0,
                            "cr_flightandtransfer": 0,
                            "cr_parkandconservancy": 0,
                            "cr_activityandexcursion": 0,
                            "cr_spa": 0,
                            "cr_shanga": 0,
                            "cr_tourcost": 0,
                            "salesRelated": 0
                        });
                    }
                    var expSearchPrev = search.load({
                        id: EXPENSESEARCH
                    });

                    expSearchPrev.filters.push(search.createFilter({
                        name: 'custrecord_ats_mis_rev_property',
                        operator: 'anyof',
                        values: property
                    }));
                    expSearchPrev.filters.push(search.createFilter({
                        name: 'custrecord_ats_exp_accounting_period',
                        operator: 'anyof',
                        values: acctPeriodPrev
                    }));


                    var searchResultCount = expSearchPrev.runPaged().count;
                    if (searchResultCount > 0) {


                        expSearchPrev.run().each(function (result) {
                            var id = result.getValue({
                                name: 'internalid'
                            });
                            var rec = record.load({
                                type: 'customrecord_ats_mis_expense',
                                id: id,
                                isDynamic: true
                            })

                            var taxes = rec.getValue('custrecord87')
                            var concessionfees = rec.getValue('custrecord90')
                            var vc_bar = rec.getValue('custrecord96')
                            var vc_food = rec.getValue('custrecord93')
                            var vc_housekeeping = rec.getValue('custrecord99')
                            var vc_gascost = rec.getValue('custrecord102')
                            var vc_kitchenconsumables = rec.getValue('custrecord105')
                            var vc_driverscost = rec.getValue('custrecord108')
                            var vc_guestwaterbottle = rec.getValue('custrecord111')
                            var vc_landandlife = rec.getValue('custrecord114')
                            var vc_conferences = rec.getValue('custrecord117')

                            var ec_staffpayroll = rec.getValue('custrecord120')
                            var ec_managementpayroll = rec.getValue('custrecord123')
                            var ec_stafftransport = rec.getValue('custrecord124')
                            var ec_staffuniform = rec.getValue('custrecord129')
                            var ec_stafftraining = rec.getValue('custrecord132')
                            var ec_staffcanteen = rec.getValue('custrecord135')
                            var ec_stafffothers = rec.getValue('custrecord138')
                            var fc_administration = rec.getValue('custrecord141')
                            var fc_software = rec.getValue('custrecord144')
                            var fc_guestgiveaway = rec.getValue('custrecord147')
                            var fc_campingfee = rec.getValue('custrecord150')
                            var fc_licenseandsubscription = rec.getValue('custrecord153')
                            var fc_insurance = rec.getValue('custrecord156')
                            var fc_servicestock = rec.getValue('custrecord159')
                            var fc_printingandstationary = rec.getValue('custrecord162')
                            var fc_teleandinternet = rec.getValue('custrecord165')
                            var fc_spoilages = rec.getValue('custrecord168')
                            var fc_bankcharges = rec.getValue('custrecord171')
                            var fc_audit = rec.getValue('custrecord174')
                            var fc_airtravel = rec.getValue('custrecord177')
                            var fc_security = rec.getValue('custrecord180')


                            var oc_electricity = rec.getValue('custrecord183')
                            var oc_fuel = rec.getValue('custrecord186')
                            var oc_servicevehicle = rec.getValue('custrecord189')
                            var oc_vehiclegp = rec.getValue('custrecord192')
                            var oc_vehiclecp = rec.getValue('custrecord195')
                            var oc_vehilehire = rec.getValue('custrecord198')
                            var oc_repairsandmaintenace = rec.getValue('custrecord201')
                            var oc_kerosene = rec.getValue('custrecord204')
                            var oc_water = rec.getValue('custrecord207')

                            var cr_foodcost = rec.getValue('custrecord210')
                            var cr_barcost = rec.getValue('custrecord213')
                            var cr_extracost = rec.getValue('custrecord216')
                            var cr_shopcost = rec.getValue('custrecord219')
                            var cr_flightandtransfer = rec.getValue('custrecord222')
                            var cr_parkandconservancy = rec.getValue('custrecord225')
                            var cr_activityandexcursion = rec.getValue('custrecord228')
                            var cr_spa = rec.getValue('custrecord231')
                            var cr_shanga = rec.getValue('custrecord234')
                            var cr_conference = rec.getValue('custrecord237')
                            var cr_tourcost = rec.getValue('custrecord240')
                            var salesRelated = rec.getValue('custrecord300')


                            objHolder['expActualPrev'].push({
                                "taxes": taxes,
                                "concessionfees": concessionfees,
                                "vc_bar": vc_bar,
                                "vc_food": vc_food,
                                "vc_housekeeping": vc_housekeeping,
                                "vc_gascost": vc_gascost,
                                "vc_kitchenconsumables": vc_kitchenconsumables,
                                "vc_guestwaterbottle": vc_guestwaterbottle,
                                "vc_driverscost": vc_driverscost,
                                "vc_landandlife": vc_landandlife,
                                "vc_conferences": vc_conferences,
                                "ec_staffpayroll": ec_staffpayroll,
                                "ec_managementpayroll": ec_managementpayroll,
                                "ec_stafftransport": ec_stafftransport,
                                "ec_staffuniform": ec_staffuniform,
                                "ec_stafftraining": ec_stafftraining,
                                "ec_stafffothers": ec_stafffothers,
                                "fc_administration": fc_administration,
                                "fc_software": fc_software,
                                "fc_guestgiveaway": fc_guestgiveaway,
                                "fc_campingfee": fc_campingfee,
                                "fc_licenseandsubscription": fc_licenseandsubscription,
                                "fc_insurance": fc_insurance,
                                "fc_servicestock": fc_servicestock,
                                "fc_printingandstationary": fc_printingandstationary,
                                "fc_teleandinternet": fc_teleandinternet,
                                "fc_spoilages": fc_spoilages,
                                "fc_bankcharges": fc_bankcharges,
                                "fc_audit": fc_audit,
                                "fc_airtravel": fc_airtravel,
                                "fc_security": fc_security,
                                "oc_electricity": oc_electricity,
                                "oc_fuel": oc_fuel,
                                "ec_staffcanteen": ec_staffcanteen,
                                "oc_vehiclegp": oc_vehiclegp,
                                "oc_vehiclecp": oc_vehiclecp,
                                "oc_vehilehire": oc_vehilehire,
                                "oc_servicevehicle": oc_servicevehicle,
                                "oc_repairsandmaintenace": oc_repairsandmaintenace,
                                "oc_kerosene": oc_kerosene,
                                "oc_water": oc_water,
                                "cr_foodcost": cr_foodcost,
                                "cr_barcost": cr_barcost,
                                "cr_extracost": cr_extracost,
                                "cr_shopcost": cr_shopcost,
                                "cr_conference": cr_conference,
                                "cr_flightandtransfer": cr_flightandtransfer,
                                "cr_parkandconservancy": cr_parkandconservancy,
                                "cr_activityandexcursion": cr_activityandexcursion,
                                "cr_spa": cr_spa,
                                "cr_shanga": cr_shanga,
                                "cr_tourcost": cr_tourcost,
                                "salesRelated": salesRelated

                            });

                            return true;
                        });
                    }else{
                        objHolder['expActualPrev'].push({
                            "taxes": 0,
                            "concessionfees": 0,
                            "vc_bar": 0,
                            "vc_food": 0,
                            "vc_housekeeping": 0,
                            "vc_gascost": 0,
                            "vc_kitchenconsumables": 0,
                            "vc_guestwaterbottle": 0,
                            "vc_landandlife": 0,
                            "vc_driverscost": 0,
                            "vc_conferences": 0,
                            "ec_staffpayroll": 0,
                            "ec_managementpayroll": 0,
                            "ec_stafftransport": 0,
                            "ec_staffuniform": 0,
                            "ec_stafftraining": 0,
                            "ec_stafffothers": 0,
                            "fc_administration": 0,
                            "fc_software": 0,
                            "fc_guestgiveaway": 0,
                            "fc_campingfee": 0,
                            "fc_licenseandsubscription": 0,
                            "fc_insurance": 0,
                            "fc_servicestock": 0,
                            "fc_printingandstationary": 0,
                            "fc_teleandinternet": 0,
                            "fc_spoilages": 0,
                            "fc_bankcharges": 0,
                            "fc_audit": 0,
                            "fc_airtravel": 0,
                            "fc_security": 0,
                            "oc_electricity": 0,
                            "oc_fuel": 0,
                            "ec_staffcanteen": 0,
                            "oc_vehiclegp": 0,
                            "oc_vehiclecp": 0,
                            "oc_vehilehire": 0,
                            "oc_servicevehicle": 0,
                            "oc_repairsandmaintenace": 0,
                            "oc_kerosene": 0,
                            "oc_water": 0,
                            "cr_foodcost": 0,
                            "cr_conference": 0,
                            "cr_barcost": 0,
                            "cr_extracost": 0,
                            "cr_shopcost": 0,
                            "cr_flightandtransfer": 0,
                            "cr_parkandconservancy": 0,
                            "cr_activityandexcursion": 0,
                            "cr_spa": 0,
                            "cr_shanga": 0,
                            "cr_tourcost": 0,
                            "salesRelated": 0

                        });
                    }

                    log.audit('statActual ', JSON.stringify(objHolder['statActual']))
                    log.audit('statActualPrev ', JSON.stringify(objHolder['statActualPrev']))
                    log.audit('revActual ', JSON.stringify(objHolder['revActual']))
                    log.audit('revBudget ', JSON.stringify(objHolder['revBudget']))
                    log.audit('revActualPrev ', JSON.stringify(objHolder['revActualPrev']))
                    log.audit('expActual ', JSON.stringify(objHolder['expActual']))
                    log.audit('expBudget ', JSON.stringify(objHolder['expBudget']))
                    log.audit('expActualPrev ', JSON.stringify(objHolder['expActualPrev']))


                    var genFile = genExcelXMLFile(objHolder, 247859);
                    var fileHolderGenerated;
                    var excelFile;
                    var fileSearchObj = search.create({
                        type: "file",
                        filters:
                            [
                                ["name", "contains", 'MIS REPORT' + '.xls']
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
            try {


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
                    name: 'MIS REPORT' + '.xls',
                    fileType: file.Type.XMLDOC,
                    contents: renderer.renderAsString()
                })
                fileXLSXML.folder = 264534;
                var fileId = fileXLSXML.save();

                return fileId;
            } catch (e) {
                log.error(e.message)
            }
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