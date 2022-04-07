/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search'],
    /**
     * @param{record} record
     */
    (record, search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const REVSEARCHFORSTAUPDATE = 'customsearch_ats_rev_search_for_sta_updt'

        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (context) => {
            var rec = context.newRecord
            log.debug(rec.type)
            if (rec.type == 'customrecord_ats_mis_statistic') {
                try {


                    var numOfdays = rec.getValue('custrecord_ats_sta_num_of_days')
                    var numOfRoomsActual = rec.getValue('custrecord_ats_sta_num_of_rooms')
                    if (numOfRoomsActual > 0) {
                        var roomsActual = parseInt(numOfdays) * parseInt(numOfRoomsActual)
                        rec.setValue({
                            fieldId: 'custrecord_ats_sta_rooms_available',
                            value: roomsActual
                        })
                    }
                    var numOfRoomsBudget = rec.getValue('custrecord253')
                    if (numOfRoomsBudget > 0) {
                        var roomsActual = parseInt(numOfdays) * parseInt(numOfRoomsBudget)
                        rec.setValue({
                            fieldId: 'custrecord84',
                            value: roomsActual
                        })
                    }
                    var numOfRoomsForecast = rec.getValue('custrecord251')
                    if (numOfRoomsForecast > 0) {
                        var roomsForecast = parseInt(numOfdays) * parseInt(numOfRoomsForecast)
                        rec.setValue({
                            fieldId: 'custrecord252',
                            value: roomsForecast
                        })
                    }
                    //rooms budget computation
                    var budgetRoomsGP = rec.getValue('custrecord22')
                    var budgetRoomsFB = rec.getValue('custrecord23')
                    var budgetRoomsHB = rec.getValue('custrecord24')
                    var budgetRoomsBB = rec.getValue('custrecord25')
                    var budgetRoomsDR = rec.getValue('custrecord26')
                    var roomSoldBudget = parseInt(budgetRoomsGP) + parseInt(budgetRoomsFB) + parseInt(budgetRoomsHB) + parseInt(budgetRoomsBB) + parseInt(budgetRoomsDR)
                    log.debug('Rooms Sold Budget ', roomSoldBudget)
                    rec.setValue({
                        fieldId: 'custrecord85', //rooms sold budget
                        value: roomSoldBudget
                    })
                    // beds budget computation
                    var budgetBedsGP = rec.getValue('custrecord27')
                    var budgetBedsFB = rec.getValue('custrecord28')
                    var budgetBedsHB = rec.getValue('custrecord29')
                    var budgetBedsBB = rec.getValue('custrecord30')
                    var budgetBedsDR = rec.getValue('custrecord31')
                    var bedSoldBudget = parseInt(budgetBedsGP) + parseInt(budgetBedsFB) + parseInt(budgetBedsHB) + parseInt(budgetBedsBB) + parseInt(budgetBedsDR)
                    log.debug('Bed Sold Budget ', bedSoldBudget)

                    rec.setValue({
                        fieldId: 'custrecord86', //bed sold budget
                        value: bedSoldBudget
                    })

                    //rooms forecast computation
                    var forecastRoomsGP = rec.getValue('custrecord3')
                    var forecastRoomsFB = rec.getValue('custrecord5')
                    var forecastRoomsHB = rec.getValue('custrecord7')
                    var forecastRoomsBB = rec.getValue('custrecord9')
                    var forecastRoomsDR = rec.getValue('custrecord11')
                    var forecastRoomsSold = parseInt(forecastRoomsGP) + parseInt(forecastRoomsFB) + parseInt(forecastRoomsHB) + parseInt(forecastRoomsBB) + parseInt(forecastRoomsDR)
                    log.debug('Forecast room sold  ', forecastRoomsSold)
                    rec.setValue({
                        fieldId: 'custrecord243', //forecast roomsold budget
                        value: forecastRoomsSold
                    })
                    // beds forecast computation
                    var forecastBedsGP = rec.getValue('custrecord13')
                    var forecastBedsFB = rec.getValue('custrecord15')
                    var forecastBedsHB = rec.getValue('custrecord17')
                    var forecastBedsBB = rec.getValue('custrecord19')
                    var forecastBedsDR = rec.getValue('custrecord21')
                    var forecastBeds = parseInt(forecastBedsGP) + parseInt(forecastBedsFB) + parseInt(forecastBedsHB) + parseInt(forecastBedsBB) + parseInt(forecastBedsDR)
                    log.debug('Forecast Bed Sold ', forecastBeds)

                    rec.setValue({
                        fieldId: 'custrecord244', //Forecast bed sold budget
                        value: forecastBeds
                    })


                    //Set Value Double Occupancy
                    var bedSoldActual = rec.getValue('custrecord_ats_sta_bed_sold')
                    var roomSoldActual = rec.getValue('custrecord_ats_sta_room_sold')
                    var doubleOccupancyActual = (bedSoldActual / roomSoldActual)
                    log.debug('Double occupancy actual', doubleOccupancyActual)
                    if (doubleOccupancyActual) {
                        rec.setValue({
                            fieldId: 'custrecord_ats_sta_double_occupancy',
                            value: doubleOccupancyActual.toFixed(2)
                        })
                    }
                    //Set Value Double Occupancy Forecast
                    var bedSoldForecast = rec.getValue('custrecord244')
                    var roomSoldForecast = rec.getValue('custrecord243')
                    log.audit('bedSoldForecast', bedSoldForecast)
                    log.audit('roomSoldForecast', roomSoldForecast)
                    var doubleOccupancyForecast = 0;
                    doubleOccupancyForecast = (bedSoldForecast / roomSoldForecast)
                    log.audit('Double occupancy forecast', doubleOccupancyForecast)
                    rec.setValue({
                        fieldId: 'custrecord254',
                        value: doubleOccupancyForecast.toFixed(2)
                    })

                    //Set Value Double Occupancy Budget
                    var bedSoldBudget = rec.getValue('custrecord86')
                    var roomSoldBudget = rec.getValue('custrecord85')
                    var doubleOccupancyBudget = (bedSoldBudget / roomSoldBudget)
                    log.audit('Double occupancy budget', doubleOccupancyBudget)
                    if (doubleOccupancyBudget) {
                        rec.setValue({
                            fieldId: 'custrecord247',
                            value: doubleOccupancyBudget.toFixed(2)
                        })
                    }

                    // set Room Occupancy Budget
                    var roomSoldBudget = 0
                    var roomsAvailableBudget = 0
                    roomSoldBudget = rec.getValue('custrecord85')
                    roomsAvailableBudget = rec.getValue('custrecord84')
                    roomOccupancyBduget = (roomSoldBudget / roomsAvailableBudget) * 100
                    var isInfinityRoomOccupancyBduget = isFinite(roomOccupancyBduget)


                    log.debug('Room occupancy Budget', roomOccupancyBduget)
                    if (roomOccupancyBduget > 0 && isInfinityRoomOccupancyBduget == true) {
                        rec.setValue({
                            fieldId: 'custrecord245',
                            value: roomOccupancyBduget.toFixed(2)
                        })
                    }
                    // set value for forecast room occupancy
                    var roomSoldForecast = 0
                    var roomsAvailableForecast = 0
                    roomSoldForecast = rec.getValue('custrecord243')
                    roomsAvailableForecast = rec.getValue('custrecord252')
                    roomOccupancyForecast = (roomSoldForecast / roomsAvailableForecast) * 100
                    var isInfinityroomOccupancyForecast = isFinite(roomOccupancyForecast)


                    log.debug('Room occupancy', roomOccupancyForecast)
                    if (roomOccupancyForecast > 0 && isInfinityroomOccupancyForecast == true) {
                        rec.setValue({
                            fieldId: 'custrecord246',
                            value: roomOccupancyForecast.toFixed(2)
                        })
                    }
                    var month = rec.getText('custrecord_ats_sta_month')

                    var year = rec.getText('custrecord_ats_sta_year')

                    var name = rec.getText('custrecord_ats_sta_property') + ' ' + month + ' ' + year
                    rec.setValue({
                        fieldId: 'name',
                        value: name
                    })

                } catch (e) {
                    log.error(e.message, rec.id)
                }
            }
            if (rec.type == 'customrecord_ats_mis_revenue') {
                //budget computation
                let budget = true;
                let forecast = true
                try {
                    if (budget === true) {
                        let roomsGP = 0
                        let roomsFB = 0
                        let roomsHB = 0
                        let roomsBB = 0
                        let roomsDR = 0
                        let roomOther = 0
                        let food = 0
                        let bar = 0
                        let extras = 0
                        let curioShop = 0
                        let flightsAndTransfers = 0
                        let parkAndConservancyFees = 0
                        let activitiesAndExcursions = 0
                        let spa = 0
                        let shanga = 0
                        let conferences = 0
                        let tourSales = 0

                        roomsGP = rec.getValue('custrecord34')
                        roomsFB = rec.getValue('custrecord36')
                        roomsHB = rec.getValue('custrecord39')
                        roomsBB = rec.getValue('custrecord42')
                        roomsDR = rec.getValue('custrecord45')
                        let roomsBudgetTotal = (roomsGP + roomsFB + roomsBB + roomsDR + roomsHB)
                        log.debug('roomsBudgetTotal', roomsBudgetTotal)
                        rec.setValue({
                            fieldId: 'custrecord_ats_rev_room_budget',
                            value: roomsBudgetTotal
                        })

                        roomOther = rec.getValue('custrecord48')
                        food = rec.getValue('custrecord51')
                        bar = rec.getValue('custrecord54')
                        extras = rec.getValue('custrecord60')
                        curioShop = rec.getValue('custrecord63')
                        flightsAndTransfers = rec.getValue('custrecord66')
                        parkAndConservancyFees = rec.getValue('custrecord69')
                        activitiesAndExcursions = rec.getValue('custrecord57')
                        spa = rec.getValue('custrecord72')
                        shanga = rec.getValue('custrecord75')
                        conferences = rec.getValue('custrecord78')
                        tourSales = rec.getValue('custrecord81')
                        let extrasTotalBudget = 0;
                        extrasTotalBudget = (roomOther + food + bar + extras + curioShop + flightsAndTransfers + parkAndConservancyFees + activitiesAndExcursions + spa + shanga + conferences + tourSales)
                        log.debug('extrasTotalBudget', extrasTotalBudget)
                        if (extrasTotalBudget > 0) {
                            rec.setValue({
                                fieldId: 'custrecord_ats_rev_extras_budget',
                                value: extrasTotalBudget
                            })
                        }
                        var grossRevenueBudget = +extrasTotalBudget + +roomsBudgetTotal;
                        log.debug('grossRevenueBudget', grossRevenueBudget)
                        if (grossRevenueBudget > 0) {
                            rec.setValue({
                                fieldId: 'custrecord_ats_rev_gross_revenue_budget',
                                value: grossRevenueBudget.toFixed(2)
                            })
                        }
                    }
                    //forecast computation
                    if (forecast === true) {
                        let roomsGP = 0
                        let roomsFB = 0
                        let roomsHB = 0
                        let roomsBB = 0
                        let roomsDR = 0
                        let roomOther = 0
                        let food = 0
                        let bar = 0
                        let extras = 0
                        let curioShop = 0
                        let flightsAndTransfers = 0
                        let parkAndConservancyFees = 0
                        let activitiesAndExcursions = 0
                        let spa = 0
                        let shanga = 0
                        let conferences = 0
                        let tourSales = 0

                        roomsGP = rec.getValue('custrecord33')
                        roomsFB = rec.getValue('custrecord37')
                        roomsHB = rec.getValue('custrecord40')
                        roomsBB = rec.getValue('custrecord43')
                        roomsDR = rec.getValue('custrecord46')
                        let roomsForecastTotal = (roomsGP + roomsFB + roomsBB + roomsDR + roomsHB)
                        if (roomsForecastTotal > 0) {
                            rec.setValue({
                                fieldId: 'custrecord294',
                                value: roomsForecastTotal.toFixed(2)
                            })
                        }
                        roomOther = rec.getValue('custrecord49')
                        food = rec.getValue('custrecord52')
                        bar = rec.getValue('custrecord55')
                        extras = rec.getValue('custrecord61')
                        curioShop = rec.getValue('custrecord64')
                        flightsAndTransfers = rec.getValue('custrecord67')
                        parkAndConservancyFees = rec.getValue('custrecord70')
                        activitiesAndExcursions = rec.getValue('custrecord58')
                        spa = rec.getValue('custrecord73')
                        shanga = rec.getValue('custrecord76')
                        conferences = rec.getValue('custrecord79')
                        tourSales = rec.getValue('custrecord82')
                        let extrasTotalForecast = 0;
                        extrasTotalForecast = (roomOther + food + bar + extras + curioShop + flightsAndTransfers + parkAndConservancyFees + activitiesAndExcursions + spa + shanga + conferences + tourSales)
                        if (extrasTotalForecast > 0) {
                            rec.setValue({
                                fieldId: 'custrecord295',
                                value: extrasTotalForecast.toFixed(2)
                            })
                        }
                        var grossRevenueForeCast = +extrasTotalForecast + +roomsForecastTotal;
                        if (grossRevenueForeCast > 0) {
                            rec.setValue({
                                fieldId: 'custrecord296',
                                value: grossRevenueForeCast
                            })
                        }
                    }

                } catch (e) {
                    log.error(e.message, rec.id)
                }
            }
            if (rec.type == 'customrecord_ats_mis_expense') {
                try {

                    let vc_bar = 0
                    let vc_food = 0
                    let vc_housekeeping = 0
                    let vc_gascost = 0
                    let vc_kitchenconsumables = 0
                    let vc_driverscost = 0
                    let vc_guestwaterbottle = 0
                    let vc_landandlife = 0
                    let vc_conferences = 0
                    let vc_budgetTotal = 0;

                    let ec_staffpayroll = 0
                    let ec_managementpayroll = 0
                    let ec_stafftransport = 0
                    let ec_staffuniform = 0
                    let ec_stafftraining = 0
                    let ec_staffcanteen = 0
                    let ec_stafffothers = 0
                    let ec_budgetTotal = 0

                    let fc_administration = 0
                    let fc_software = 0
                    let fc_guestgiveaway = 0
                    let fc_campingfee = 0
                    let fc_licenseandsubscription = 0
                    let fc_insurance = 0
                    let fc_servicestock = 0
                    let fc_printingandstationary = 0
                    let fc_teleandinternet = 0
                    let fc_spoilages = 0
                    let fc_bankcharges = 0
                    let fc_audit = 0
                    let fc_airtravel = 0
                    let fc_security = 0
                    let fc_budgetTotal = 0

                    let oc_electricity = 0
                    let oc_fuel = 0
                    let oc_servicevehicle = 0
                    let oc_vehiclegp = 0
                    let oc_vehiclecp = 0
                    let oc_vehilehire = 0
                    let oc_repairsandmaintenace = 0
                    let oc_kerosene = 0
                    let oc_water = 0
                    let oc_budgetTotal = 0

                    let cr_foodcost = 0
                    let cr_barcost = 0
                    let cr_extracost = 0
                    let cr_shopcost = 0
                    let cr_flightandtransfer = 0
                    let cr_parkandconservancy = 0
                    let cr_activityandexcursion = 0
                    let cr_spa = 0
                    let cr_shanga = 0
                    let cr_conference = 0
                    let cr_tourcost = 0
                    let cr_total = 0


                    //Budget
                    //variable costs

                    vc_bar = rec.getValue('custrecord97')
                    vc_food = rec.getValue('custrecord94')
                    vc_housekeeping = rec.getValue('custrecord100')
                    vc_gascost = rec.getValue('custrecord103')
                    vc_kitchenconsumables = rec.getValue('custrecord106')
                    vc_driverscost = rec.getValue('custrecord109')
                    vc_guestwaterbottle = rec.getValue('custrecord112')
                    vc_landandlife = rec.getValue('custrecord115')
                    vc_conferences = rec.getValue('custrecord118')
                    vc_budgetTotal = (parseInt(vc_bar) + parseInt(vc_housekeeping) + parseInt(vc_food) + parseInt(vc_gascost) + parseInt(vc_kitchenconsumables)
                        + parseInt(vc_driverscost) + parseInt(vc_guestwaterbottle) + parseInt(vc_landandlife) + parseInt(vc_conferences))
                    // vc_budgetTotal = vc_bar + vc_housekeeping + vc_food + vc_gascost + vc_kitchenconsumables + vc_driverscost + vc_guestwaterbottle + vc_landandlife + vc_conferences
                    log.debug('vc_budgetTotal', vc_budgetTotal)
                    if (vc_budgetTotal > 0) {
                        rec.setValue({
                            fieldId: 'custrecord_ats_exp_variable_budget',
                            value: vc_budgetTotal
                        })
                    }
                    //Establishment costs

                    ec_staffpayroll = rec.getValue('custrecord121')
                    ec_managementpayroll = rec.getValue('custrecord124')
                    ec_stafftransport = rec.getValue('custrecord127')
                    ec_staffuniform = rec.getValue('custrecord130')
                    ec_stafftraining = rec.getValue('custrecord133')
                    ec_staffcanteen = rec.getValue('custrecord136')
                    ec_stafffothers = rec.getValue('custrecord139')
                    ec_budgetTotal = (parseInt(ec_staffpayroll) + parseInt(ec_managementpayroll) + parseInt(ec_stafftransport) + parseInt(ec_staffuniform)
                        + parseInt(ec_stafftraining) + parseInt(ec_staffcanteen) + parseInt(ec_stafffothers))
                    //  ec_budgetTotal = ec_staffpayroll + ec_managementpayroll + ec_stafftransport + ec_staffuniform + ec_stafftraining + ec_staffcanteen + ec_stafffothers
                    log.debug('ec_budgetTotal', ec_budgetTotal)
                    if (ec_budgetTotal > 0) {
                        rec.setValue({
                            fieldId: 'custrecord_ats_exp_establishment_budget',
                            value: ec_budgetTotal
                        })
                    }
                    //fixed costs

                    fc_administration = rec.getValue('custrecord142')
                    fc_software = rec.getValue('custrecord145')
                    fc_guestgiveaway = rec.getValue('custrecord148')
                    fc_campingfee = rec.getValue('custrecord151')
                    fc_licenseandsubscription = rec.getValue('custrecord154')
                    fc_insurance = rec.getValue('custrecord157')
                    fc_servicestock = rec.getValue('custrecord160')
                    fc_printingandstationary = rec.getValue('custrecord163')
                    fc_teleandinternet = rec.getValue('custrecord166')
                    fc_spoilages = rec.getValue('custrecord169')
                    fc_bankcharges = rec.getValue('custrecord172')
                    fc_audit = rec.getValue('custrecord175')
                    fc_airtravel = rec.getValue('custrecord178')
                    fc_security = rec.getValue('custrecord181')
                    fc_budgetTotal = (parseInt(fc_administration) + parseInt(fc_audit) + parseInt(fc_airtravel) + parseInt(fc_bankcharges) + parseInt(fc_campingfee)
                        + parseInt(fc_servicestock) + parseInt(fc_software) + parseInt(fc_guestgiveaway) + parseInt(fc_licenseandsubscription) + parseInt(fc_insurance) + parseInt(fc_printingandstationary)
                        + parseInt(fc_teleandinternet) + parseInt(fc_teleandinternet) + parseInt(fc_security))
                    // fc_budgetTotal = fc_administration + fc_audit + fc_airtravel + fc_bankcharges + fc_campingfee + fc_servicestock + fc_software + fc_guestgiveaway + fc_licenseandsubscription + fc_insurance + fc_printingandstationary
                    //  + fc_teleandinternet + fc_teleandinternet + fc_security
                    log.debug('fc_budgetTotal', fc_budgetTotal)
                    if (fc_budgetTotal > 0) {
                        rec.setValue({
                            fieldId: 'custrecord_ats_exp_fixed_budget',
                            value: fc_budgetTotal
                        })
                    }
                    //Other Cost Budget

                    oc_electricity = rec.getValue('custrecord184')
                    oc_fuel = rec.getValue('custrecord187')
                    oc_servicevehicle = rec.getValue('custrecord190')
                    oc_vehiclegp = rec.getValue('custrecord193')
                    oc_vehiclecp = rec.getValue('custrecord196')
                    oc_vehilehire = rec.getValue('custrecord199')
                    oc_repairsandmaintenace = rec.getValue('custrecord202')
                    oc_kerosene = rec.getValue('custrecord205')
                    oc_water = rec.getValue('custrecord208')
                    oc_budgetTotal = (parseInt(oc_electricity) + parseInt(oc_fuel) + parseInt(oc_servicevehicle) + parseInt(oc_vehiclegp)
                        + parseInt(oc_vehiclecp) + parseInt(oc_vehilehire) + parseInt(oc_repairsandmaintenace) + parseInt(oc_kerosene) + parseInt(oc_water))
                    //oc_budgetTotal = oc_electricity + oc_fuel + oc_servicevehicle + oc_vehiclegp + oc_vehiclecp + oc_vehilehire + oc_repairsandmaintenace + oc_kerosene + oc_water
                    log.debug('oc_budgetTotal', oc_budgetTotal)
                    if (oc_budgetTotal > 0) {
                        rec.setValue({
                            fieldId: 'custrecord_ats_exp_other_budget',
                            value: oc_budgetTotal
                        })
                    }

                    //cost that move as a% to revenue
                    cr_foodcost = rec.getValue('custrecord211')
                    cr_barcost = rec.getValue('custrecord214')
                    cr_extracost = rec.getValue('custrecord217')
                    cr_shopcost = rec.getValue('custrecord220')
                    cr_flightandtransfer = rec.getValue('custrecord223')
                    cr_parkandconservancy = rec.getValue('custrecord226')
                    cr_activityandexcursion = rec.getValue('custrecord229')
                    cr_spa = rec.getValue('custrecord232')
                    cr_shanga = rec.getValue('custrecord235')
                    cr_conference = rec.getValue('custrecord238')
                    cr_tourcost = rec.getValue('custrecord241')

                    cr_total = (parseInt(cr_foodcost) + parseInt(cr_barcost) + parseInt(cr_extracost) + parseInt(cr_shopcost)
                        + parseInt(cr_flightandtransfer) + parseInt(cr_parkandconservancy) + parseInt(cr_activityandexcursion)
                        + parseInt(cr_spa) + parseInt(cr_shanga) + parseInt(cr_conference) + parseInt(cr_tourcost))
                    //  cr_total = cr_foodcost + cr_barcost + cr_extracost + cr_shopcost + cr_flightandtransfer + cr_parkandconservancy + cr_activityandexcursion + cr_spa + cr_shanga + cr_conference + cr_tourcost
                    log.debug('cr_total', cr_total)
                    if (cr_total > 0) {
                        rec.setValue({
                            fieldId: 'custrecord_ats_exp_percent_rev_budget',
                            value: cr_total
                        })
                    }
                    var salesRelatedActual = 0;
                    var salesRelatedBudget = 0;
                    salesRelatedActual = rec.getValue('custrecord300')
                    salesRelatedBudget = rec.getValue('custrecord302')
                    var revId
                    var misRecMonth = rec.getValue('custrecord_ats_mis_exp_months')
                    var misRecYear = rec.getValue('custrecord_ats_mis_exp_year')
                    var misProperty = rec.getValue('custrecord_ats_mis_rev_property')
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
                        log.audit('AAA ', `netRevenueActual ${netRevenueActual} | netRevenueBudget ${netRevenueBudget}`)
                        var revSavedId = record.submitFields({
                            type: 'customrecord_ats_mis_revenue',
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
                    }

                        log.audit('revSavedId', revSavedId)
                } catch (e) {
                    log.error(e.message)
                }
            }


        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (context) => {
            var recStat = context.newRecord
            var type = recStat.type
            if (type == 'customrecord_ats_mis_statistic') {

                try {


                    var rec = record.load({
                        type: type,
                        id: recStat.id,
                        isDynamic: true
                    })
                    //Average room rate update
                    var revId;
                    var revRecSearhObj = search.load({
                        id: REVSEARCHFORSTAUPDATE
                    })
                    revRecSearhObj.filters.push(search.createFilter({
                        name: 'custrecord_ats_mis_month',
                        operator: 'anyof',
                        values: recStat.getValue('custrecord_ats_sta_month')
                    }));
                    revRecSearhObj.filters.push(search.createFilter({
                        name: 'custrecord_ats_mis_year',
                        operator: 'anyof',
                        values: recStat.getValue('custrecord_ats_sta_year')
                    }));
                    revRecSearhObj.filters.push(search.createFilter({
                        name: 'custrecord_ats_mis_property',
                        operator: 'anyof',
                        values: recStat.getValue('custrecord_ats_sta_property')
                    }));

                    var revRecSearhObjCount = revRecSearhObj.runPaged().count;

                    if (revRecSearhObjCount > 0) {
                        revRecSearhObj.run().each(function (result) {
                            revId = result.getValue({
                                name: 'internalid'
                            })

                            return true;
                        });
                    }
                    if (revId) {
                        var revRec = record.load({
                            type: 'customrecord_ats_mis_revenue',
                            id: revId,
                            isDynamic: true
                        })
                        log.debug('Rev Rec', revRec)
                        //budget average rooms computation
                        var revBudgetGP = revRec.getValue('custrecord34')
                        var averageGPBudget = revBudgetGP / recStat.getValue('custrecord22')
                        var isInfinityAverageGPBudge = isFinite(averageGPBudget)

                        if (averageGPBudget > 0 && isInfinityAverageGPBudge == true) {
                            rec.setValue({
                                fieldId: 'custrecord249',
                                value: averageGPBudget.toFixed(2)
                            })
                        }
                        var revBudgetFB = revRec.getValue('custrecord36')
                        var averageFBBudget = revBudgetFB / recStat.getValue('custrecord23')
                        var isInfinityAverageFBBudget = isFinite(averageFBBudget)

                        if (averageFBBudget > 0 && isInfinityAverageFBBudget == true) {
                            rec.setValue({
                                fieldId: 'custrecord259',
                                value: averageFBBudget.toFixed(2)
                            })
                        }
                        var revBudgetHB = revRec.getValue('custrecord39')
                        var averageHBBudget = revBudgetHB / recStat.getValue('custrecord24')
                        var isInfinityAverageHBBudget = isFinite(averageHBBudget)

                        if (averageHBBudget > 0 && isInfinityAverageHBBudget == true) {
                            rec.setValue({
                                fieldId: 'custrecord260',
                                value: averageHBBudget.toFixed(2)
                            })
                        }
                        var revBudgetBB = revRec.getValue('custrecord42')
                        var averageBBBudget = revBudgetBB / recStat.getValue('custrecord25')
                        var isInfinityAverageBBBudget = isFinite(averageBBBudget)

                        if (averageBBBudget > 0 && isInfinityAverageBBBudget == true) {
                            rec.setValue({
                                fieldId: 'custrecord261',
                                value: averageBBBudget.toFixed(2)
                            })
                        }
                        var revBudgetDR = revRec.getValue('custrecord45')
                        var averageDRBudget = revBudgetDR / recStat.getValue('custrecord26')
                        var isInfinityAverageDRBudget = isFinite(averageDRBudget)

                        if (averageDRBudget > 0 && isInfinityAverageDRBudget == true) {
                            rec.setValue({
                                fieldId: 'custrecord262',
                                value: averageDRBudget.toFixed(2)
                            })
                        }
                        //
                        //Forecast average rooms computation
                        var revForecastGP = revRec.getValue('custrecord33')
                        var averageGPForecast = revForecastGP / recStat.getValue('custrecord3')
                        var isInfinityAverageGPForecast = isFinite(averageGPForecast)
                        log.audit('Averatge forecast GP', averageGPForecast)
                        if (averageGPForecast > 0 && isInfinityAverageGPForecast == true) {
                            rec.setValue({
                                fieldId: 'custrecord250',
                                value: averageGPForecast.toFixed(2)
                            })
                        }
                        var revForecastFB = revRec.getValue('custrecord37')
                        var averageFBForecast = revForecastFB / recStat.getValue('custrecord5')
                        var isInfinityAverageFBForecast = isFinite(averageFBForecast)

                        if (averageFBForecast > 0 && isInfinityAverageFBForecast == true) {
                            rec.setValue({
                                fieldId: 'custrecord263',
                                value: averageFBForecast.toFixed(2)
                            })
                        }
                        var revForecastHB = revRec.getValue('custrecord40')
                        var averageHBForecast = revForecastHB / recStat.getValue('custrecord7')
                        var isInfinityAverageHBForecast = isFinite(averageHBForecast)

                        if (averageHBForecast > 0 && isInfinityAverageHBForecast == true) {
                            rec.setValue({
                                fieldId: 'custrecord264',
                                value: averageHBForecast.toFixed(2)
                            })
                        }
                        var revForecastBB = revRec.getValue('custrecord43')
                        var averageBBForecast = revForecastBB / recStat.getValue('custrecord9')
                        var isInfinityAverageBBForecast = isFinite(averageBBForecast)

                        if (averageBBForecast > 0 && isInfinityAverageBBForecast == true) {
                            rec.setValue({
                                fieldId: 'custrecord265',
                                value: averageBBForecast.toFixed(2)
                            })
                        }
                        var revForecastDR = revRec.getValue('custrecord46')
                        var averageDRForecast = revForecastDR / recStat.getValue('custrecord11')
                        var isInfinityAverageDRForecast = isFinite(averageDRForecast)

                        if (averageDRForecast > 0 && isInfinityAverageDRForecast == true) {
                            rec.setValue({
                                fieldId: 'custrecord266',
                                value: averageDRForecast.toFixed(2)
                            })
                        }
                    }
                    //Rev Par and Rev Por Budget
                    var revRoomsBudgetTotal = revRec.getValue('custrecord_ats_rev_room_budget')
                    var roomsAvailableBudget = recStat.getValue('custrecord84')
                    revParBudget = revRoomsBudgetTotal / roomsAvailableBudget
                    var isInfinityRevParBudget = isFinite(revParBudget)

                    if (revParBudget > 0 && isInfinityRevParBudget == true) {

                        rec.setValue({
                            fieldId: 'custrecord289',
                            value: Math.ceil(revParBudget)
                        })
                    }

                    revPorBudget = revRec.getValue('custrecord_ats_rev_gross_revenue_budget') - revRec.getValue('custrecord81')
                    var revPorBudgetTotal = revPorBudget / recStat.getValue('custrecord85')
                    var isInfinityRevPorBudget = isFinite(revPorBudgetTotal)
                    if (revPorBudgetTotal > 0 && isInfinityRevPorBudget == true) {
                        //   log.audit('revPor Actual', Math.ceil(revPorActual) )
                        rec.setValue({
                            fieldId: 'custrecord292',
                            value: Math.ceil(revPorBudgetTotal)
                        })
                    }
                    // Rev Par and Rev Por Forecast
                    var revRoomsForecastTotal = revRec.getValue('custrecord294')
                    var roomsAvailableForecast = recStat.getValue('custrecord252')
                    var revParForecast = revRoomsForecastTotal / roomsAvailableForecast
                    var isInfinityRevParForecast = isFinite(revParForecast)

                    if (revParForecast > 0 && isInfinityRevParForecast == true) {

                        rec.setValue({
                            fieldId: 'custrecord290',
                            value: Math.ceil(revParForecast)
                        })
                    }

                    var revPorForecast = revRec.getValue('custrecord296') - revRec.getValue('custrecord81')
                    var revPorForecastTotal = revPorForecast / recStat.getValue('custrecord243')
                    var isInfinityRevPorForecast = isFinite(revParBudget)
                    if (revPorForecastTotal > 0 && isInfinityRevPorForecast == true) {
                        //   log.audit('revPor Actual', Math.ceil(revPorActual) )
                        rec.setValue({
                            fieldId: 'custrecord293',
                            value: Math.ceil(revPorForecastTotal)
                        })
                    }

                    var recId = rec.save();
                    log.debug('after submit', recId)
                } catch (e) {
                    log.error(e.message)
                }
            }

        }
        return {beforeLoad, beforeSubmit, afterSubmit}

    });
