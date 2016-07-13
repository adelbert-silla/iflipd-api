'use strict';

let axios = require('axios');
let braintree = require('braintree');
let gateway = require('../gateway');
let app = require('../../server/server.js');
let PaymentMethod = require('../backendless/paymentmethod');

function validateUserToken(userToken) {
  let BACKENDLESS_ENV = app.get('BACKENDLESS');
  return axios.get(`${BACKENDLESS_ENV.URL}/${BACKENDLESS_ENV.VERSION}/users/isvalidusertoken/${userToken}`, {
    headers: {
      'application-id': BACKENDLESS_ENV.APP_ID,
      'secret-key': BACKENDLESS_ENV.SECRET_KEY,
      'application-type': 'REST'
    }
  }).then(result => {
    if (result.data)
      return result.data;
    else
      throw {status: 401, message: 'Invalid user token'};
  });
}

module.exports = (Payment) => {
  Payment.generateToken = (userToken, callback) => {
    validateUserToken(userToken).then(_ => {
      gateway.clientToken.generate({}, function (err, response) {
        callback(null, response.clientToken);
      });
    }, callback);
  };

  Payment.remoteMethod('generateToken',
    {
      accepts: {arg: 'user-token', type: 'string'},
      returns: {arg: 'clientToken', type: 'string'}
    }
  );

  Payment.registerCard = (userToken, nonce, callback) => {
    validateUserToken(userToken).then(_ => {
      gateway.customer.create({paymentMethodNonce: nonce}, function (err, result) {
        if (result.success) {
          let token = result.customer.creditCards[0].token;
          let paymentMethod = new PaymentMethod({
            customer_id: result.customer.id,
            payment_method_token: token,
            payment_service: 'BrainTree'
          });

          Backendless.Persistence.of(PaymentMethod).save(paymentMethod, new Backendless.Async(obj => {
            callback(null, true);
          }, error => {
            console.log('Error saving payment method.');
            reject(error);
          }));
        } else {
          callback(null, null, result.errors);
        }
      });
    }, callback);
  };

  Payment.remoteMethod('registerCard',
    {
      accepts: [
        {arg: 'user-token', type: 'string'},
        {arg: 'nonce', type: 'string'}
      ],
      returns: [
        {arg: 'success', type: 'string'},
        {arg: 'errors', type: 'string'}
      ]
    }
  );
};
