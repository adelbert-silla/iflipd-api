'use strict';

module.exports = class PaymentMethod {
  constructor(args) {
    args = args || {};
    this.customer_id = args.customer_id || '';
    this.payment_method_token = args.payment_method_token || '';
    this.payment_service = args.payment_service || '';
    this.___class = 'PaymentMethod';
  }
};
