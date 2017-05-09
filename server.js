var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var database = require('./database');
var ldapAuth = require('./ldapAuth');
var sql = require('mssql');
var bodyParser = require('body-parser');
var moment = require('moment');

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
app.post('/call', function(req, res) {
    var ext = req.body.ext
    if(ext == undefined){
        res.status(404).send({
            error: true,
            text: 'Extension undefined'
        })
    }else{
        database.searchCallsByExtension(res,ext);
    }
});
app.post('/calls', function(req,res){
    var name = req.body.name
    if(name === undefined){
        res.status(404).send({
            error: true,
            text: 'Extension name undefined'
        })
    }else{
        database.searchCallsByName(res,name)
    } 
});
app.post('/scpost',function(req,res){
    //console.log(req.body)
    var start = req.body.start
    var end = req.body.end
    //console.log('loque se ha recibido es ',start, ' y tambien ',end)
    if(start === undefined || end === undefined){
        res.status(404).send({
            error: true,
            text: 'Start or End date undefined'
        })
    }else{       
        
        start = moment(start).format('YYYY-MM-DD')
        end = moment(end).format('YYYY-MM-DD')
        //console.log('se va enviar a la consulta ',start,' y ',end) 
        database.searchCallsByDate(res, start, end)
    }
    //console.log('recibido ',start,' y tambien ',end)
});
app.post('/updatephone',function(req,res){
    var extensionID = req.body.extensionID
    var phoneNumber = req.body.phoneNumber
    var name = req.body.name
    var area = req.body.area
    var location = req.body.location
    var data = {
        extensionID: extensionID,
        phoneNumber: phoneNumber,
        name: name,
        area: area,
        location: location
    }
    /*res.send({
        text: 'he recibido!',
        data:data
})*/
    database.UpdatePhone(res,data)
});
app.post('/authldapuser',function(req,res){
    var user = req.body.user
    var password = req.body.password
    ldapAuth.AuthLdapUser(res,user,password);
});
app.post('/authuser',function(req,res){
    var user = req.body.user
    var password = req.body.password
    ldapAuth.AuthUser(res,user,password);
});
app.get('/getusersforgroup', function(req, res){
    ldapAuth.getUsersForGroup(res);
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
