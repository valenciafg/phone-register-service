const lodash = require('lodash');
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
const authGroupUser = function(response, username, password, groupName = appGroup){
  var sAMAccountName = username + userSuffix;
  ad.authenticate(sAMAccountName, password, function(err, auth){
    if (err) {
      response.send({
        error: true,
        message: 'Invalid credentials',
        code: 'AU000'
      });
    }    
    if (auth) {
      ad.getGroupMembershipForUser(sAMAccountName, function(err, groups) {
        if (err) {
          response.send({
            error: true,
            message: 'User is not authorized to use this application',
            code: 'AU001'
          });
        } 
        if (! groups){
          response.send({
            error: true,
            message: 'User is not authorized to use this application',
            code: 'AU002'
          });
        }else{
          if(!lodash.find(groups,{"cn": groupName})){
            response.send({
              error: true,
              message: 'User is not authorized to use this application',
              code: 'AU003'
            });
          }else{
            response.send({
              error: false,
              message: 'User authenticated',
              code: false
            });
          }
        }
      });
    }
  });
}
module.exports = {
    ActiveDirectoryObj: ad,
    AuthLdapUser: authUser,
    getUsersForGroup: getUsersForGroup,
    AuthUser: authGroupUser
}