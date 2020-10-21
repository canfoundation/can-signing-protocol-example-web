<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of content**

- [Pack action data](#pack-action-data)
  - [Make the first command output](#make-the-first-command-output)
  - [Make the second command output](#make-the-second-command-output)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Pack action data

TODO explain how to use `cif-js`

This file explains how to transform bellow command to the JSON-like to pass to can-pass APIs.

```bash
# issue token to issuer account
cleos -u https://api.canfoundation.io convert pack_action_data impactcltv.t issue '["impactcltv.c", "60 ICV", ""]'
# 80c0ce116564aa743c00000000000000004943560000000000

cleos -u https://api.canfoundation.io push action governance execcode '["impactcltv.c", "sdew2342dsw2", 8, [["issue", "80c0ce116564aa743c00000000000000004943560000000000"]]]' -p sdew2342dsw2

# Transfer to 35ajsqfvqqmr account
cleos -u https://api.canfoundation.io convert pack_action_data impactcltv.t transfer '["impactcltv.c", "35ajsqfvqqmr", "10 ICV", ""]'
# 80c0ce116564aa7470a5b57b59fc4c190a00000000000000004943560000000000

cleos -u https://api.canfoundation.io push action governance execcode '["impactcltv.c", "sdew2342dsw2", 8, [["transfer", "80c0ce116564aa7470a5b57b59fc4c190a00000000000000004943560000000000"]]]' -p sdew2342dsw2
```

To make a `pack_action_data`, we are going to need `eosjs`. I wrote an utils file for this: [PackActionData.js](../lib/PackActionData.js).
Check out this [packActionData.test.js](../__tests__/packActionData.test.js) file for the sample.

## Make the first command output

```javascript
const packActionData = new PackActionData();
const rs = await packActionData.packIssue({
  to: 'impactcltv.c',
  quantity: '60 ICV',
  memo: '',
});

// expect(rs).toEqual('80c0ce116564aa743c00000000000000004943560000000000');
```

Then you can push this action to the can-pass APIs.

```json
[
  {
    "action": "governance",
    "name": "execcode",
    "authorization": [
      {
        "account": "sdew2342dsw2",
        "name": "active"
      }
    ],
    "data": {
      "community_account": "impactcltv.c",
      "exec_account": "sdew2342dsw2",
      "code_id": 8,
      "code_actions": [
        {
          "code_action": "issue",
          "packed_params": "80c0ce116564aa743c00000000000000004943560000000000"
        }
      ]
    }
  }
]
```

## Make the second command output

```javascript
const packActionData = new PackActionData();
const rs = await packActionData.packTransfer({
  from: 'impactcltv.c',
  to: '35ajsqfvqqmr',
  quantity: '10 ICV',
  memo: '',
});

// expect(rs).toEqual('80c0ce116564aa743c00000000000000004943560000000000');
```
