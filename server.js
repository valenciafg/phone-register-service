var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var database = require('./database');
var sql = require('mssql');
var bodyParser = require('body-parser');

const SALUDO = "Bienvenido al servicio de captura de llamada, si usted puede ver este mensaje es porque el servicio está activo";
//  Express server uses
app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
/**
*   Routes
**/
app.get('/', function(req, res){
    res.status(200).send(SALUDO);
});
app.get('/extension', function(req, res) {
    database.ExtensionList(res);
});
app.get('/phonedirectory', function(req, res) {
    database.PhoneDirectoryList(res);
});
app.get('/lastcalls', function(req, res) {
    database.LastPhoneCalls(res);
});
app.get('/call', function(req, res) {
    database.CallsList(res);
});
app.get('/call/:ext', function(req, res) {
    database.searchCallsByExtension(res,req.params.ext);
});
//  Handle new socket.io client connected
io.on('connection', function(socket){
    var address = socket.handshake.address;
    console.log('Se ha conectado un cliente ',address);
});

io.on('disconnect', function () {
    console.log('Cliente desconectado');
});
//Server Listen port
server.listen(8080, function(){
  console.log("Servidor corriendo en http://localhost:8080");
});
/**
* Module Exports
**/
module.exports = {
    server: server,
    io: io,
    app: app
}
