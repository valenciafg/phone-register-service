var database = require('./database');
var SerialPort = require('serialport');

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
    return console.log(' Error opening port: ', err.message);
  }
});

// open errors will be emitted as an error event
port.on('open', function() {
  console.log('SerialPort Open! ');
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
        dialedPhone: arrayData[3],
        callTime: arrayData[4],
        callDuration: arrayData[5],
        callDurationSeconds: arrayData[6],
        flag1: arrayData[1],
        flag2: arrayData[2],
        flag3: arrayData[7],
        flag4: arrayData[8],
        flag5: arrayData[9],
        flag6: arrayData[10]
    }
    if (typeof phoneData.dialedPhone != 'undefined'){
        console.log('Extension: '+phoneData.ext+' destination Number: '+phoneData.dialedPhone+' Start Time: '+phoneData.callTime+' Duration: '+phoneData.callDuration);
        database.RegisterCall(phoneData.ext,phoneData.dialedPhone,phoneData.callTime,phoneData.callDuration);
    }else{
        console.log('Invalid values');
    }
});
port.on('disconnect',function(){
  console.log('SerialPort Disconnected');
});
port.on('error',function(e){
  console.log('Error on serial comunication: ',e.message);
});
