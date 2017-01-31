var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const SALUDO = "Bienvenido al servicio de captura de llamada, si usted puede ver este mensaje es porque el servicio está activo";

app.use(express.static('public'));
app.get('/', function(req, res){
  res.status(200).send(SALUDO);
});

io.on('connection', function(socket){
    var address = socket.handshake.address;
    console.log('Se ha conectado un cliente ',address);
});

io.on('disconnect', function () {
    console.log('Cliente desconectado');
});
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
