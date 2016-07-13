'use strict';

let axios = require('axios');
let braintree = require('braintree');
let gateway = require('../gateway');
let app = require('../../server/server.js');

module.exports = function(Payment) {
  Payment.generateToken = function(userToken, cb) {
    let BACKENDLESS_ENV = app.get('BACKENDLESS');
    console.log(BACKENDLESS_ENV.URL);
    axios.get(`${BACKENDLESS_ENV.URL}/users/isvalidusertoken/${userToken}`, {
      headers: {
        'application-id': BACKENDLESS_ENV.APP_ID,
        'secret-key': BACKENDLESS_ENV.SECRET_KEY,
        'application-type': 'REST'
      }
    }).then(result => {
      if (result.data)
        gateway.clientToken.generate({}, function(err, response) {
          cb(null, response.clientToken);
        });
      else
        cb({status: 401, message: 'Invalid user token'})
    }, cb);
  };

  Payment.remoteMethod('generateToken',
    {
      accepts: [{arg: 'user-token', type: 'string'}],
      returns: {arg: 'clientToken', type: 'string'}
    }
  );
};
