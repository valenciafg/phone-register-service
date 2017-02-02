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
  console.log('Database connection established');
});
sqlConnection.on('close', function(err) {
  console.log('Database closed');
});
sqlConnection.on('error', function(err) {
  console.log('Database Error: ', err);
});
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
}/*
var LastPhoneCalls = ()=>{
    sqlConnection.connect(function(err) {
        var request = new sql.Request(sqlConnection);
        request.query('SELECT TOP(100) * FROM PhoneCalls ORDER BY CreationDate DESC', function(err, recordset) {
            console.log(recordset);
        });
    });
}*/
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
    //console.log(sql);
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
    RegisterCall: RegisterCall
}
