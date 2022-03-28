/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */

const COGSFOLDER = 161256; //COGS Folder
const DEFAULTEMAILSENDER = -5;

define(['N/record', 'N/runtime', 'N/search', 'N/render', 'N/file', 'N/format', 'N/email'],

    function (record, runtime, search, render, file, format, email) {
        function getInputData() {
            var searchId = runtime.getCurrentScript().getParameter("custscript_ats_mrcogs_ss");

            var paramsToProcess = JSON.parse(runtime.getCurrentScript().getParameter("custscript_ats_cogs_config_report"));
            log.audit('paramsToProcess', paramsToProcess)
            //var consoExchValue = paramsToProcess.consolidateSubProp;
            //delete paramsToProcess.consolidateSubProp;

            var searchObj = search.load({
                id: searchId
            });

            // Pushes Parameter values - LOOP - For Each
            Object.keys(paramsToProcess).forEach(function (searchFilterName) {


                //If Else - For Operator assignment of Filters - For Date

                if (searchFilterName == 'trandate') {
                    searchObj.filters.push(search.createFilter({
                        name: searchFilterName, operator: 'within', values: paramsToProcess[searchFilterName]
                    }));
                } else {
                    searchObj.filters.push(search.createFilter({
                        name: searchFilterName, operator: 'anyof', values: paramsToProcess[searchFilterName]
                    }));

                }
            });

            if (isDefinedNotNullNotEmpty(searchId)) {
                return searchObj;
                //return
            }
            return null;
        }

        function map(context) {
            //log.audit('map context', JSON.stringify(context));
            var mapResults = context.value;
            var objHolder = JSON.parse(context.value);

            mapResults = objHolder.values;
            var acctId = mapResults["GROUP(accountmain)"].value;
            var results = {};

            var accountmain = mapResults["GROUP(accountmain)"].text;
            var subsidiary = mapResults["GROUP(subsidiarynohierarchy)"];
            var property = mapResults["GROUP(location)"].text;
            var internalid = mapResults["GROUP(internalid)"].value;
            var vehicle = mapResults["GROUP(custbody_ats_vehicle_num)"];
            var trandate = mapResults["GROUP(trandate)"];
            var tranid = mapResults["GROUP(tranid)"];

            var item = mapResults["GROUP(item)"].text;

            var itemclass = mapResults["GROUP(class)"].text;
            //Manual - None - Parser
            //log.debug('itmcls',itemclass)
            if(!itemclass){
                itemclass="- None -"
            }

            var itemqty = mapResults["GROUP(quantityuom)"];
            var units = mapResults["GROUP(unit)"].text;
            var formulacol = mapResults["SUM(formulanumeric)"];
            var amount = mapResults["SUM(amount)"]


            results = {
                "accountmain": accountmain,
                "subsidiary": subsidiary.replace(/'/g, ''),
                "property": property.replace(/'/g, ''),
                "property": property.replace(/'/g, ''),
                "vehicle": vehicle,
                "trandate": trandate,
                "tranid": tranid,
                "item": (item.replace(/"/g, 'Inches')).replace(/'/g, ''),
                "itemclass": itemclass,
                "itemqty": itemqty,
                "units": units,
                "formulacol": formulacol,
                "amount": amount
            };
            //JSON.stringify((JSON.stringify(results)).replace(/"/g, "'"))

            //log.audit('CKEY' + context.key, results)
            context.write({
                key: acctId,
                value: JSON.stringify((JSON.stringify(results)).replace(/"/g, "'"))
            });
        }

        function reduce(context) {


            // log.audit('reduce context', JSON.stringify(context));
            var mapResults = context.values;
            //   log.audit('mapResults1', JSON.stringify(mapResults));
            var objHolder = JSON.parse(context.values[0]);
            //mapResults = objHolder.values;
            // log.audit('mapResults2', JSON.stringify(mapResults));
            var results = {};


            log.audit('reduce CKEY' + context.key, JSON.stringify(mapResults))
            context.write({
                key: 'ACCTID' + context.key,
                value: mapResults
            });
        }

        function summarize(context) {

            log.debug('context whole summarixze', JSON.stringify(context));
            var lineResults = new Array();

            var mainCSVtoRender = '';
            // Get each Key Val Pair
            context.output.iterator().each(function (key, arrayHolder) {
                log.debug('whole key value :' + key, ((arrayHolder)));

                var stringHolder = JSON.stringify((arrayHolder));

                log.debug('whole key value stringified :' + key, stringHolder);
                stringHolder = stringHolder.replace(/[\"\\\"]/g, '');
                stringHolder = stringHolder.replace(/[\\\"\"]/g, '');
                stringHolder = stringHolder.replace(/'/g, '"');


                stringHolder = JSON.parse(stringHolder);

                var intLineCount = stringHolder.length;
                var manualParseAccount = stringHolder[0].accountmain;
                //log.debug('reparsed manualParseAccount:' + key, manualParseAccount);
                var accountTotal = 0;

                for (var i = 0; i < intLineCount; i++) {

                    var wholeObj = stringHolder[i];
                    log.debug('wholeObj ', JSON.stringify(wholeObj));
                    Object.keys(wholeObj).forEach((function (objKey) {
                        //check if its the last part of the Array
                        if (objKey == 'amount' || objKey == 'formulacol') {
                            mainCSVtoRender += formatNumber(parseFloat(stringHolder[i][objKey])) + ',';
                            //  mainCSVtoRender += results[i][objKey];

                            if (objKey == 'amount') {
                                accountTotal += parseFloat(stringHolder[i][objKey]);
                            }
                        } else {
                            // if(objKey == 'itemclass'){
                            //     log.debug('(stringHolder[i][objKey])  ' , (stringHolder[i][objKey]));
                            // }

                            mainCSVtoRender += '"' + (stringHolder[i][objKey]) + '"' + ','
                        }


                    }));

                    //Push to AllResults Holder
                    lineResults.push(wholeObj);
                    mainCSVtoRender += '\r\n';


                }

                mainCSVtoRender +=' , , , , , , , , , , ' + 'Total for: ' + manualParseAccount.replace(/,/g,"") + ' , ' + formatNumber(accountTotal) + '\r\n';

                mainCSVtoRender += '\r\n';


                return true;
            });

            // Scan all Properties - Logic
            var objResults = [];
            var propertiesTotalResults = new Array();

            // function to add same object keys amount
            function addSameProperty(results) {
                var holder = {};
                results.forEach(function (res) {
                    if (holder.hasOwnProperty(res.property)) {
                        holder[res.property] = holder[res.property] + parseFloat(res.amount);
                    } else {
                        holder[res.property] = parseFloat(res.amount);
                    }
                });
                return holder
            }

            var propHolder = addSameProperty(lineResults)


            //trim the property name to main Parent Property Only
            for (var prop in propHolder) {
                objResults.push({property: prop, amount: propHolder[prop]});
            }
            if (objResults.length > 0) {
                for (var i = 0; i < objResults.length; i++) {
                    var total = 'Total for ' + objResults[i].property

                    propertiesTotalResults.push({
                        "accountmain": ' ',
                        "subsidiary": ' ',
                        "property": ' ',
                        "vehicle": ' ',
                        "trandate": ' ',
                        "tranid": ' ',
                        "item": '',
                        "itemclass": ' ',
                        "itemqty": ' ',
                        "units": ' ',
                        "formulacol": total,
                        "amount": objResults[i].amount
                    });
                }
            }
            //End Property Logic
            // Inserts the Properties as last part of the Code

            for (var i = 0; i < propertiesTotalResults.length; i++) {
                Object.keys(propertiesTotalResults[i]).forEach((function (objKey) {
                    if (objKey == 'amount') {
                        mainCSVtoRender += formatNumber(propertiesTotalResults[i][objKey]) + ',';
                    } else {
                        mainCSVtoRender += '"' + propertiesTotalResults[i][objKey] + '"' + ','
                    }

                }));
                mainCSVtoRender += '\r\n';
            }
            // End Property


            // Saving of file
            mainCSVtoRender = 'COGS / EXPENSE ACCOUNT, Subsidiary ,Property Name, Vehicle Number, Transaction Date, Transaction Reference, Item, Item Class, Quantity, Units , Sum of Item Cost, Sum of Amount\r\n' + mainCSVtoRender;
            var csvContent = mainCSVtoRender;
            //"data:text/csv;charset=utf-8," +
            //log.audit('mainCSVtoRender',csvContent)


            var fileXLSXML = file.create({
                name: 'COGS_IA_Report_' + '.csv', fileType: file.Type.CSV, contents: csvContent
            })
            fileXLSXML.folder = COGSFOLDER;
            var fileId = fileXLSXML.save();

            log.audit('fILE ID LOCATION ', fileId)

            sendEmailWithFile(fileId);
        }

        function isDefinedNotNullNotEmpty(obj) {
            return typeof obj != 'undefined' && obj != null && obj != '' && obj.length > 0;
        }

        function handleErrorAndSendNotification(e, stage) {
            log.error('Stage: ' + stage + ' failed', e);

            var subject = 'Script: ' + runtime.getCurrentScript().id;
            var body = 'An error occurred with the following information:\n' + 'Error code: ' + e.name + '\n' + 'Error msg: ' + e.message;
            log.error('subject: ' + subject, body);
        }

        function formatNumber(num) {

            var ReturnNum = Number(num).toString();
            var valSplit = ReturnNum.split('.')
            nReturnNum = valSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ((valSplit[1]) ? ('.' + valSplit[1]) : '');

            if (ReturnNum.indexOf(',') >= 0) {
                ReturnNum = '"' + ReturnNum + '"';
            }


            return ReturnNum;
        }

        function formatTextForCSV(stringH) {

            var returnStr = '"' + stringH + '"';

            return returnStr;
        }

        function sendEmailWithFile(fileId) {
            var userObj = runtime.getCurrentUser();
            var userId = userObj.id;

            //Static Folder
            var fileID = file.load({id: fileId})
            //static Author
            email.send({
                author: DEFAULTEMAILSENDER,
                recipients: userId,
                subject: 'COGS_IA_Report ' + getDateNow(),
                body: 'See report attached below',
                attachments: [fileID]
            });
            log.audit('Email SENT', 'Email sent to: ' + userObj.email);
        }

        function getDateNow() {
            var dateHolder = new Date,
                dateFormat = [dateHolder.getMonth() + 1,
                        dateHolder.getDate(),
                        dateHolder.getFullYear()].join('_') + '_' +
                    [dateHolder.getHours(),
                        dateHolder.getMinutes()].join('_')
            return dateFormat;
        }

        return {
            getInputData: getInputData, map: map, reduce: reduce, summarize: summarize
        };

    });
