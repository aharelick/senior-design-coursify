var User = require('../models/User');
var os = require('os');

module.exports = function(passwordless, smtpServer, emailUsername) {
  passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
      smtpServer.send({
        text: 'Hello!\nAccess your account here: http://'
        + os.hostname() + ':' + (process.env.PORT || '3000') + '?token=' + tokenToSend + '&uid='
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
