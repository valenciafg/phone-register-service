# [PHONE-REGISTER-SERVICE](https://github.com/valenciafg/phone-register-service)

Phone-Register-Service is a service based on [Node.js](http://nodejs.org/), [Express](http://expressjs.com/), [Socket.io](https://socket.io/), [SerialPort](https://www.npmjs.com/package/serialport), [MS-SQL server](https://www.npmjs.com/package/mssql), that connect to [Alcatel Omnipcx enterprise communication server](http://enterprise.alcatel-lucent.com/?product=OmniPCXEnterpriseCommunicationServer&page=overview) via COM port and records all outgoing calls in database, at the same time sends the call log to clients via socket.io, in addition you can make queries through the api built in express

## Features
* Connection with [Alcatel Omnipcx enterprise communication server](http://enterprise.alcatel-lucent.com/?product=OmniPCXEnterpriseCommunicationServer&page=overview) via COM port
* Record all outgoing call on mssql database
* Send outgoing calls log to websocket clients
* API to get data from database
* LDAP authentication 

## Requirements

Make sure all dependencies have been installed before moving on:

* [Git](http://nodejs.org/) >= 2.11.x
* [Node.js](http://nodejs.org/) >= 6.9.x

## Installation

```Batchfile
#clone this repository in the folder you want
> git clone https://github.com/valenciafg/phone-register-service.git
#install dependencies
> npm install
```

## Run
Type this command where you cloned this repository:

```Javascript
> npm run start
```

## Test COM ports
To check all COM ports actives you can run 
```javascript
> node listen.js
```
