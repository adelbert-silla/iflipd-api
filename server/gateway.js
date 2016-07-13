'use strict';

let braintree = require('braintree');
let environment, gateway;
var app = require('./server.js');
let BT_ENV = app.get('BT');

environment = BT_ENV.ENVIRONMENT.charAt(0).toUpperCase() + BT_ENV.ENVIRONMENT.slice(1);

gateway = braintree.connect({
  environment: braintree.Environment[environment],
  merchantId: BT_ENV.MERCHANT_ID,
  publicKey: BT_ENV.PUBLIC_KEY,
  privateKey: BT_ENV.PRIVATE_KEY
});

module.exports = gateway;
