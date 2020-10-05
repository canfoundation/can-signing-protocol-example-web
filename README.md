# Can Signing Protocol Example Web

This example is written in [Express](https://expressjs.com/) and demonstrates 'Signing protocal example' for a web app.

## In this example contains:
- Transfer CAT example

## Configuration

Replace the following constants in the `index.js` with your own information. 

```javascript
const client_id = '514744fe2356ecd585789ebddfecb087'; // Replace YOUR_CLIENT_ID here
const client_secret = '6b88c8e215cb1c62deb07c7e176fbb1b66799705246db502127d2dd92cc7bff5'; // Replace YOUR_CLIENT_SECRET here
const redirect_uri = `http://localhost:${PORT}/auth/cryptobadge/callback`; // Replace YOUR_CALLBACK_URL here
```
This example work on test environment

```javascript
const uri = 'https://dev.api.cryptobadge.app/can-keys-test/graphql';
CANpass.config({
  canPassApi: 'https://test.canpass.me/oauth2',
  fetch,
});
```
If you want work on production environment

```javascript
const uri = 'https://prod.api.cryptobadge.app/can-keys/graphql';
CANpass.config({
  canPassApi: 'https://canpass.me/oauth2',
  fetch,
});
```
And replace the env in the `index.ejs` too.

```javascript
data-domain="https://canpass.me"
endPoint: 'https://prod.api.cryptobadge.app/can-keys/graphql';
signTxURL: 'https://canpass.me/auth/sign-transaction'
```
## Getting Started

Install the dependencies and run the server as follows.

```
yarn
yarn start
```

Then, visit [http://localhost:3002](http://localhost:3002). You can login to the example with your CANpass account by hit the yellow button 'Sign in with can-pass'.


## Understanding the Example

After you login to CANPass successfully, you will receive a token like this:
```javascript
token = {
  access_token: 'da54054101352f743b792f52f0f383d2c77519c7',
  token_type: 'Bearer',
  expires_in: 3599,
  refresh_token: 'ba298435dbd0c835b2a56607c0a243bd44ab6298',
  scope: 'email'
}
```
The home page will show when you login success

In Home page you will see a form Transfer CAT Example

- Input your CAN account
- Input CAN account's receiver
- Input quantity - Amount of CAT you want to transfer
- Redirect URL - a callback URL when sign transaction Server Side (use for option 2)

We have 2 option to sign a transaction.

**Option 1**: Click on button 'Transfer Cat' (This is sign transaction with CIF style - a popup or new tab will open)

Request sign transaction in client side with can-pass-js sdk

Build a transaction details and call function signTx of can-pass-js sdk

Need to init values (such as clientId, version, endPoint, signTxURL,...) for CanPass sdk before you call signTx

In signTx we have a callback to get a result when you finished sign a transaction

```javascript
function requestSignTx(tx) {
  canPass.signTx(tx, 'RequestSignTxOptions', (error, tx) => {
    if (error) { //When sign transaction have errors, do somthing here
      console.log('Fail', error);
    } else { // When success
      console.log('Sign Success', tx);
    }
  });
}
```
**Option 2**: Click on button 'Server Side' (Redirect style)

Request sign transaction in server side by call can-keys api

Get input values from client

Call a mutation graphql to get ```headerLocation``` and redirect to ```headerLocation```

After sign a transaction, redirect to Redirect URL (input in client side)

I have write an Redirect URL input example http://localhost:3002/sign-tx-callback

```javascript
app.get('/sign-tx-callback', (req, res) => {
  const trx = req.query.trx;
  if(trx) {
    console.log('Sign Transaction Success!');
    res.redirect('/');
  }
});
```
You can get transaction info in ```req.query```



