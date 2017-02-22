var SerialPort = require('serialport');
var database = require('./database');
var server = require('./server');

var portID = '<portID>';
var args = {
  autoOpen: false,
  baudRate: 9600,
  dataBits: 8,
  parser: SerialPort.parsers.readline('\n')
  //parser: SerialPort.parsers.byteLength(82),
};
var port = new SerialPort(portID, args);

port.open(function(err){
  if(err){
      server.io.sockets.emit('serial_connection_error','Socket Connection Error: '+err.message);
      return console.log(' Error opening port: ', err.message);
  }
});

// open errors will be emitted as an error event
port.on('open', function() {
  console.log('SerialPort Open! ');
  server.io.sockets.emit('serial_connection_open','Socket Connection Open');
});
port.on('data', function (data) {
    console.log(data);
    var consoleData = "";
    var dataSize = data.length;
    for(var i=1; i < dataSize && dataSize > 0; i++ ){
        if(data[i] != ' '){
            consoleData += data[i];
        }
    }
    var arrayData = consoleData.split('|');
    var phoneData = {
        ext:arrayData[0],
        cnn: arrayData[1],
        trfSub: arrayData[2],
        dialedPhone: arrayData[3],
        callTime: arrayData[4],
        callDuration: arrayData[5],
        cost: arrayData[6],
        pni: arrayData[7],
        commType1: arrayData[8],
        commType2: arrayData[9],
        callType: arrayData[10],
        callDate: moment().format('DD-MM-YYYY'),
        callDateUnix: moment().unix()
    }
    server.io.sockets.emit('action', {type:'NEW_CALL', call:phoneData});
    if (typeof phoneData.dialedPhone != 'undefined' && /^\d+$/.test(phoneData.ext)){
        console.log('Extension: '+phoneData.ext+' Dialed Number: '+phoneData.dialedPhone+' Start Time: '+phoneData.callTime+' Duration: '+phoneData.callDuration);
        database.RegisterCall(phoneData);
        // server.io.sockets.emit('serial_data',phoneData);
    }else{
        console.log('Invalid values');
    }
});
port.on('disconnect',function(){
  console.log('SerialPort Disconnected');
  server.io.sockets.emit('serial_connection_disconnect','Socket Connection Disconnect');
});
port.on('error',function(e){
  console.log('Error on serial comunication: ',e.message);
  server.io.sockets.emit('serial_connection_error',e.message);
});
