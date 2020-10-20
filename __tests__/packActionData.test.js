const PackActionData = require('../lib/PackActionData');

describe('pack action data', () => {
  const packActionData = new PackActionData();
  it('packIssue', async () => {
    const rs = await packActionData.packIssue({
      to: 'impactcltv.c',
      quantity: '60 ICV',
      memo: '',
    });
    expect(rs).toEqual('80c0ce116564aa743c00000000000000004943560000000000');
  });

  it('packTransfer', async () => {
    const rs = await packActionData.packTransfer({
      from: 'impactcltv.c',
      to: '35ajsqfvqqmr',
      quantity: '10 ICV',
      memo: '',
    });
    expect(rs).toEqual('80c0ce116564aa7470a5b57b59fc4c190a00000000000000004943560000000000');
  });
});
