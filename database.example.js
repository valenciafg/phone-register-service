var sql = require('mssql');
/**
*   Database configuration params
**/
var config = {
    user: 'DBUSER',
    password: 'DBPASSWORD',
    server: 'DBSERVER', // You can use 'localhost\\instance' to connect to named instance
    port: 1433,
    database: 'DBNAME'
}
var sqlConnection = new sql.Connection(config);
/**
*   Handlers
**/
sqlConnection.on('connect', function(err) {
  console.log('Database connection established.',err);
});
sqlConnection.on('close', function(err) {
  console.log('Database closed. ',err);
});
sqlConnection.on('error', function(err) {
  console.log('Database Error: ', err);
});
/**
*   Promises Functions
**/
function responseRecordset(recordset,res){
    res.send(recordset);
}
function logRecordset(recordset){
    console.log(recordset);
}
function logError(err){
    console.log('Error:',err);
}
/**
*   Functions
**/
var PhoneTypeList = function(){
    sqlConnection.connect(function(err) {
        var request = new sql.Request(sqlConnection);
        return request.query('SELECT * FROM PhoneType', function(err, recordset) {
            console.log(recordset);
            return recordset;
        });
    });
}

var ExtensionList = function(response){
    sql.connect(config)
        .then(function(){
            var request = new sql.Request();
            request.query('SELECT * FROM Extensions')
            .then(function(recordset){
                console.log('Extension List ',recordset);
                response.send(recordset);
            })
            .catch(logError);
        }).catch(logError)
}

var SearchExtension = function(response,ext_number){
    sql.connect(config)
        .then(function(){
            var request = new sql.Request();
            request.input('ext_number', sql.NVarChar(50), ext_number)
                .query('SELECT * FROM Extensions WHERE PhoneNumber = @ext_number')
                .then(function(recordset){
                    console.log('Extension List ',recordset);
                    response.send(recordset);
                })
                .catch(logError);
        })
        .catch(logError)
}

var CallsList = function(response){
    sql.connect(config)
        .then(function(){
            var request = new sql.Request();
            request.query('SELECT * FROM PhoneCalls ORDER BY CallDate DESC')
            .then(function(recordset){
                console.log('Calls List ',recordset);
                response.send(recordset);
            })
            .catch(logError);
        }).catch(logError)
}

var LastPhoneCalls = function(response){
    sql.connect(config)
        .then(function(){
            var request = new sql.Request();
            request.query('SELECT TOP(100) * FROM PhoneCalls ORDER BY CallDate DESC')
            .then(function(recordset){
                console.log('Last Calls ',recordset);
                response.send(recordset);
            })
            .catch(logError);
        }).catch(logError)
}
var searchCallsByExtension = (response, ext_number) => {
    sql.connect(config)
        .then(function(){
            var request = new sql.Request();
            request.input('ext_number', sql.NVarChar(50), ext_number)
            .query('SELECT * FROM PhoneCalls WHERE PhoneExtension = @ext_number ORDER BY CallDate DESC')
            .then(function(recordset){
                console.log('Calls by ext '+ext_number,recordset);
                response.send(recordset);
            })
            .catch(logError);
        })
        .catch(logError)
}
var RegisterCall = function(data){
    var sql = 'INSERT INTO PhoneCalls '+
    '(PhoneExtension,PhoneDestination,PhoneCallStartTime,PhoneCallDuration,RegisteredCost,CostCenterName,BusinessCodeNumber,TrfSub,CommunicationType,CommunicationTypeTwo,CallType)'+
    ' VALUES(\''+
    data.ext+
    '\',\''+data.dialedPhone+
    '\',\''+data.callTime+
    '\',\''+data.callDuration+
    '\','+data.cost+
    ',\''+data.cnn+
    '\',\''+data.pni+
    '\',\''+data.trfSub+
    '\',\''+data.commType1+
    '\',\''+data.commType2+
    '\',\''+data.callType+
    '\')';
    sqlConnection.connect(function(err) {
        var transaction = sqlConnection.transaction();
        transaction.begin(function(err) {
            // ... error checks
            var request = transaction.request();
            request.query(sql, function(err, recordset) {
                // ... error checks
                transaction.commit(function(err, recordset) {
                    // ... error checks
                    console.log("Call registered.");
                });
            });
        });
    });
}
/**
* Module Exports
**/
module.exports = {
    PhoneTypeList: PhoneTypeList,
    RegisterCall: RegisterCall,
    ExtensionList: ExtensionList,
    LastPhoneCalls: LastPhoneCalls,
    searchCallsByExtension: searchCallsByExtension,
    CallsList: CallsList,
    SrvConfig: config,
    sqlConnection: sqlConnection
}
