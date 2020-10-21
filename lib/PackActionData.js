const { Api, JsonRpc } = require('eosjs');

// https://github.com/EOSIO/eosjs#commonjs
const fetch = require('node-fetch'); // only need in node-js
const { TextDecoder, TextEncoder } = require('util'); // only need in node-js

module.exports = function PackActionData(endpoint = 'https://api.canfoundation.io') {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  const rpc = new JsonRpc(endpoint, { fetch });

  /**
   * create API instance
   */
  const api = new Api({
    rpc,
    textEncoder,
    textDecoder,
  });

  this.packActionData = function packActionData(actions) {
    return api
      .serializeActions(actions)
      .then((d) => d[0].data)
      .then((rs = '') => rs.toLowerCase());
  };

  this.packIssue = function packIssue({
    to,
    quantity,
    memo = '',
    options: { account = 'impactcltv.t' } = {},
  }) {
    return this.packActionData([
      {
        account,
        name: 'issue',
        data: {
          to,
          quantity,
          memo,
        },
      },
    ]);
  };

  this.packTransfer = function packTransfer({
    from,
    to,
    quantity,
    memo = '',
    options: { account = 'impactcltv.t' } = {},
  }) {
    return this.packActionData([
      {
        account,
        name: 'transfer',
        data: {
          from,
          to,
          quantity,
          memo,
        },
      },
    ]);
  };

  return this;
};
