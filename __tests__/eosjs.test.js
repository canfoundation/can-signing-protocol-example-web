const { Api, JsonRpc } = require('eosjs');
const fetch = require('node-fetch');
const { TextDecoder, TextEncoder } = require('util');

describe('eosjs', () => {
  it('packdata 1', async () => {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    const endpoint = 'https://api.canfoundation.io';
    const rpc = new JsonRpc(endpoint, { fetch });
    const api = new Api({
      rpc,
      textEncoder,
      textDecoder,
    });

    const res = await api.serializeActions([
      {
        account: 'impactcltv.t',
        name: 'issue',
        data: {
          to: 'impactcltv.c',
          quantity: '60 ICV',
          memo: '',
        },
      },
    ]);

    expect(res).toEqual([
      {
        account: 'impactcltv.t',
        authorization: undefined,
        data: '80C0CE116564AA743C00000000000000004943560000000000',
        name: 'issue',
      },
    ]);
  });

  it('packdata 2', async () => {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    const endpoint = 'https://api.canfoundation.io';
    const rpc = new JsonRpc(endpoint, { fetch });
    const api = new Api({
      rpc,
      textEncoder,
      textDecoder,
    });

    const res = await api.serializeActions([
      {
        account: 'impactcltv.t',
        name: 'transfer',
        data: {
          from: 'impactcltv.c',
          to: '35ajsqfvqqmr',
          quantity: '10 ICV',
          memo: '',
        },
      },
    ]);

    expect(res).toEqual([
      {
        account: 'impactcltv.t',
        authorization: undefined,
        data: '80C0CE116564AA7470A5B57B59FC4C190A00000000000000004943560000000000',
        name: 'transfer',
      },
    ]);
  });
});
