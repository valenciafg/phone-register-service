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
    console.log('Database connection established.');
});
sqlConnection.on('close', function(err) {
    console.log('Database closed. ', err);
});
sqlConnection.on('error', function(err) {
    console.log('Database Error: ', err);
});
/**
 *   Promises Functions
 **/
function responseRecordset(recordset, res) {
    res.send(recordset);
}

function logRecordset(recordset) {
    console.log(recordset);
}

function logError(err) {
    console.log('Error:', err);
}

function otroError(err, msg) {
    console.log('Error:', err);
    console.log('Msg:', msg);
}

function resError(err, response, msg) {
    console.log('Error:', err);
    response.send({
        error: true,
        msg: msg,
        obj: err
    })
}
/**
 *   Functions
 **/
var PhoneTypeList = function() {
    sqlConnection.connect(function(err) {
        var request = new sql.Request(sqlConnection);
        return request.query('SELECT * FROM PhoneType', function(err, recordset) {
            console.log(recordset);
            return recordset;
        });
    });
}

var ExtensionList = function(response) {
    sql.connect(config)
        .then(function() {
            var request = new sql.Request();
            request.query('SELECT * FROM Extensions')
                .then(function(recordset) {
                    //console.log('Extension List ',recordset);
                    response.send(recordset);
                })
                .catch(logError);
        }).catch(logError)
}

var SearchExtension = function(response, ext_number) {
    sql.connect(config)
        .then(function() {
            var request = new sql.Request();
            request.input('ext_number', sql.NVarChar(50), ext_number)
            .query('SELECT * FROM Extensions WHERE PhoneNumber = @ext_number')
            .then(function(recordset) {
                console.log('Extension List ', recordset);
                response.send(recordset);
            })
            .catch(logError);
        })
        .catch(logError)
}

var CallsList = function(response) {
    sql.connect(config)
        .then(function() {
            var request = new sql.Request();
            request.query('SELECT * FROM PhoneCalls ORDER BY CallDate DESC')
            .then(function(recordset) {
                //console.log('Calls List ',recordset);
                response.send(recordset);
            })
            .catch(logError);
        }).catch(logError)
}

var LastPhoneCalls = function(response) {
    sql.connect(config)
        .then(function() {
            var request = new sql.Request();
            request.query(`SELECT TOP(200) pc.*, pd2.Name AS DestinationName, CAST(pc.PhoneCallStartTime AS DATETIME) as MyStartTime, pd.Name AS MyExtPhoneName
            FROM PhoneCalls pc
            LEFT JOIN PhoneDirectory pd ON pd.PhoneNumber = pc.PhoneExtension
            LEFT JOIN PhoneDirectory pd2 ON pd2.PhoneNumber LIKE CONCAT('%', RTRIM(pc.PhoneDestination), '%') and pd2.Type = 'E'
            ORDER BY pc.CallDate DESC`)
            .then(function(recordset) {
                response.send(recordset);
            })
            .catch(logError);
        }).catch(logError)
}

var PhoneDirectoryList = function(response) {
    sql.connect(config)
        .then(function() {
            var request = new sql.Request();
            request.query("SELECT * FROM PhoneDirectory WHERE Type = 'L' ORDER BY PhoneNumber ASC")
                .then(function(recordset) {
                    response.send(recordset);
                })
                .catch(logError);
        }).catch(logError)
}
var ExternalPhoneDirectoryList = function(response){
    sql.connect(config)
    .then(function() {
        var request = new sql.Request();
        request.query("SELECT * FROM PhoneDirectory WHERE Type = 'E' ORDER BY PhoneNumber ASC")
            .then(function(recordset) {
                response.send(recordset);
            })
            .catch(logError);
    }).catch(logError)
}

var searchCallsByExtension = (response, ext_number) => {
    sql.connect(config)
        .then(function() {
            var request = new sql.Request();
            request.input('ext_number', sql.NVarChar(50), ext_number)
                .query(`SELECT TOP(200) pc.*, pd2.Name AS DestinationName, CAST(pc.PhoneCallStartTime AS DATETIME) as MyStartTime, pd.Name AS MyExtPhoneName   
                FROM PhoneCalls pc
                LEFT JOIN PhoneDirectory pd ON pd.PhoneNumber = pc.PhoneExtension
                LEFT JOIN PhoneDirectory pd2 ON pd2.PhoneNumber = pc.PhoneDestination
                WHERE pc.PhoneExtension = @ext_number ORDER BY pc.CallDate DESC`)
                .then(function(recordset) {
                    //console.log('Calls by ext '+ext_number,recordset);
                    response.send(recordset);
                })
                .catch(logError);
        })
        .catch(logError)
}
var searchCallsByExternalNumber = (response, external_id) => {
    sql.connect(config)
        .then(function() {
            var request = new sql.Request();
            request.input('external_id', sql.Int, external_id)
            .query(`SELECT TOP(200) pc.*, pd2.Name AS DestinationName, CAST(pc.PhoneCallStartTime AS DATETIME) as MyStartTime, pd.Name AS MyExtPhoneName 
                FROM PhoneCalls pc
                LEFT JOIN PhoneDirectory pd ON pd.PhoneNumber = pc.PhoneExtension
                INNER JOIN PhoneDirectory pd2 ON pd2.PhoneNumber = pc.PhoneDestination
                WHERE 
                pd2.ExtensionID = @external_id`)
            .then(function(recordset) {
                response.send(recordset);
            })
            .catch(logError);
        })
        .catch(logError)
}
var searchCallsByName = (response, name) => {
    sql.connect(config)
        .then(function() {
            var request = new sql.Request();
            var sql_query = `SELECT pc.*, pd2.Name AS DestinationName, CAST(pc.PhoneCallStartTime AS DATETIME) as MyStartTime, pd.Name AS MyExtPhoneName   
            FROM PhoneCalls AS pc
            INNER JOIN PhoneDirectory as pd ON pc.PhoneExtension = pd.PhoneNumber 
            LEFT JOIN PhoneDirectory pd2 ON pd2.PhoneNumber = RTRIM(pc.PhoneDestination) AND pd2.Type = 'E'
            WHERE pd.Name LIKE '%${name}%'`
            request
                .query(sql_query)
                .then(function(recordset) {
                    response.send({
                        error: false,
                        records: recordset
                    });
                })
                .catch((e) => resError(e, response, 'Error al obtener datos'));
        })
        .catch((e) => resError(e, response, 'Error de conexión'))
}
var searchCallsByDate = (response, start_date, end_date) => {
    start_date = new Date(start_date)
    end_date = new Date(end_date + ' 23:59:59:999')
    // console.log('estos son los paramtros del query ',start_date,' y tambien ',end_date)
    sql.connect(config)
        .then(function() {
            var request = new sql.Request();
            request.input('start_date', sql.DateTime, start_date)
            request.input('end_date', sql.DateTime, end_date)
                .query(`SELECT TOP(500) pc.*, pd2.Name AS DestinationName, CAST(pc.PhoneCallStartTime AS DATETIME) as MyStartTime, pd.Name AS MyExtPhoneName 
                    FROM PhoneCalls pc
                    INNER JOIN PhoneDirectory as pd ON pc.PhoneExtension = pd.PhoneNumber 
                    LEFT JOIN PhoneDirectory pd2 ON pd2.PhoneNumber = RTRIM(pc.PhoneDestination) AND pd2.Type = 'E'
                    WHERE CallDate BETWEEN CONVERT(datetime, @start_date) AND CONVERT(datetime, @end_date)`)
                .then(function(recordset) {
                    //console.log('Calls by date ',recordset);
                    response.send({
                        error: false,
                        records: recordset
                    });
                })
                .catch((e) => resError(e, response, 'Hubo un error'));
        })
        .catch(logError)
}
var RegisterCall = function(data) {
    var sql = 'INSERT INTO PhoneCalls ' +
        '(PhoneExtension,PhoneDestination,PhoneCallStartTime,PhoneCallDuration,RegisteredCost,CostCenterName,BusinessCodeNumber,TrfSub,CommunicationType,CommunicationTypeTwo,CallType)' +
        ' VALUES(\'' +
        data.ext +
        '\',\'' + data.dialedPhone +
        '\',\'' + data.callTime +
        '\',\'' + data.callDuration +
        '\',' + data.cost +
        ',\'' + data.cnn +
        '\',\'' + data.pni +
        '\',\'' + data.trfSub +
        '\',\'' + data.commType1 +
        '\',\'' + data.commType2 +
        '\',\'' + data.callType +
        '\')';
    sqlConnection.connect(function(err) {
        var transaction = sqlConnection.transaction();
        transaction.begin(function(err) {
            if (err) {
                logError(err);
            } else {
                var request = transaction.request();
                request.query(sql, function(err, recordset) {
                    if (err) {
                        logError(err);
                    } else {
                        transaction.commit(function(err, recordset) {
                            if (err) {
                                logError(err);
                            }
                        });
                    }
                });
            }
        });
    });
}
var UpdatePhone = function(response, data) {
    sql.connect(config)
    .then(function() {
        var request = new sql.Request();
        request.input('PhoneNumber', sql.NChar(50), data.phoneNumber)
        request.input('Name', sql.NVarChar(250), data.name)
        request.input('Area', sql.NVarChar(200), data.area)
        request.input('Location', sql.NVarChar(200), data.location)
        request.input('ExtensionID', sql.Int, data.extensionID)
            .query('UPDATE PhoneDirectory SET PhoneNumber = @PhoneNumber, Name = @Name,Area = @Area,Location =  @Location WHERE ExtensionID = @ExtensionID')
            .then(function(recordset) {
                //console.log('Calls by date ',recordset);
                response.send({
                    error: false,
                    records: request.rowsAffected
                });
            })
            .catch((e) => resError(e, response, 'Error al actualizar el registro telefonico'));
    })
    .catch(logError)
}

var MakeExternalPhone = function(response, data){
    console.log('se va mandar',data)
    sql.connect(config)
    .then(function(){ 
        var request = new sql.Request();
        request.input('number', sql.NVarChar(50), data.number)
        request.input('name', sql.NVarChar(250), data.name)
        request.execute('make_external_phone', function(err, result){
            // console.log('asd', err)
            // console.log('asd1', result)
            if(err === undefined){
                response.send({
                    error: false,
                    msg: 'External number defined',
                })
            }else{
                response.send({
                    error: true,
                    msg: 'External number cant be defined',
                })
            }
        })
    })
    .catch(logError)
}
/**
 * Module Exports
 **/
module.exports = {
    PhoneTypeList: PhoneTypeList,
    RegisterCall: RegisterCall,
    ExtensionList: ExtensionList,
    PhoneDirectoryList: PhoneDirectoryList,
    ExternalPhoneDirectoryList: ExternalPhoneDirectoryList,
    LastPhoneCalls: LastPhoneCalls,
    searchCallsByExtension,
    searchCallsByName: searchCallsByName,
    searchCallsByDate: searchCallsByDate,
    searchCallsByExternalNumber,
    UpdatePhone: UpdatePhone,
    MakeExternalPhone,
    CallsList: CallsList,
    SrvConfig: config,
    sqlConnection: sqlConnection
}