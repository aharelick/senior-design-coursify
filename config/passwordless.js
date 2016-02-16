var User = require('../models/User');
var os = require('os');

module.exports = function(passwordless, smtpServer, emailUsername, hostName) {
  passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
      smtpServer.send({
        text: 'Hello!\nAccess your account here: http://'
        + hostName + '?token=' + tokenToSend + '&uid='
        + encodeURIComponent(uidToSend),
        from: 'Coursify <' + emailUsername + '>',
        to: recipient,
        subject: 'Access Token for Coursify'
      }, function(err, message) {
        if (err) {
          console.log(err);
        }
        callback(err);
      });
    }
  );
};
