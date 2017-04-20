var ActiveDirectory = require('activedirectory');
var config = { url: 'ldap://172.24.10.10',
               baseDN: 'dc=plazameru,dc=com',
               username: 'appmeru@plazameru.com',
               password: '1111'
            }
var ad = new ActiveDirectory(config);
//console.log(ad);
var username = 'vvalencia@plazameru.com';
var password = '.fl0r3z.';
 
ad.authenticate(username, password, function(err, auth) {
  if (err) {
    console.log('ERROR: '+JSON.stringify(err));
    return;
  }
  
  if (auth) {
    console.log('Authenticated!');
  }
  else {
    console.log('Authentication failed!');
  }
});

const groupName = 'g_AppMeru';
ad.getUsersForGroup(groupName, function(err, users) {
  if (err) {
    console.log('ERROR: ' +JSON.stringify(err));
    return;
  }
 
  if (! users) console.log('Group: ' + groupName + ' not found.');
  else {
    console.log(JSON.stringify(users));
  }
});
var getUsersForGroup = function(groupName = 'g_AppMeru'){
    ad.getUsersForGroup(groupName, function(err, users) {
        if (err) {
            console.log('ERROR: ' +JSON.stringify(err));
            return;
        }
        if (! users) console.log('Group: ' + groupName + ' not found.');
        else {
            console.log(JSON.stringify(users));
        }
});
}
module.exports = {
    ActiveDirectoryObj: ad
}