var ActiveDirectory = require('activedirectory');
var config = { url: 'ldap://172.24.10.10',
               baseDN: 'dc=plazameru,dc=com',
               username: 'appmeru@plazameru.com',
               password: 'app.meru'
            }
const ad = new ActiveDirectory(config);
const userSuffix = '@plazameru.com';
const appGroup = 'g_AppMeru';

var authUser = function(response, username, password){
  username = username + userSuffix;
  ad.authenticate(username, password, function(err, auth) {
    if (err) {
      response.send({
        error: true,
        message: 'Invalid credentials'
      });
    }    
    if (auth) {
      response.send({
        error: false,
        message: 'User authenticated'
      })
    }
  });
}
var getUsersForGroup = function(response,groupName = appGroup){
  ad.getUsersForGroup(groupName, function(err, users) {
    var usersWithGroup = {};
    if (err) {
      usersWithGroup = {
        error: true,
        users: {}
      };
    }  
    if (! users){
      usersWithGroup = {
        error: false,
        users: {}
      };
    }else {
      usersWithGroup = {
        error: false,
        users: users
      };
    }
    response.send(usersWithGroup);
  });  
}

module.exports = {
    ActiveDirectoryObj: ad,
    AuthLdapUser: authUser,
    getUsersForGroup: getUsersForGroup
}