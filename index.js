const express = require('express');
const session = require('cookie-session');
const CANpass = require('can-pass-verify').default;

const { createHttpLink } = require('apollo-link-http');
const { execute, makePromise } = require('apollo-link');
const fetch = require('node-fetch');
const gql = require('graphql-tag');
const uri = 'https://dev.api.cryptobadge.app/can-keys-test/graphql';
const link = createHttpLink({ uri, fetch });

const PORT = 3002;
const app = express();
app.use(express.json());

app.set('view engine', 'ejs');
app.use(session({ name: 'sign-transaction-sample', keys: ['key'], maxAge: 24 * 60 * 60 * 1000 }));
app.use(express.static('lib'));

app.get('/', (req, res) => res.render('index', { token: req.session.token }));

// CANpass integration
const client_id = '514744fe2356ecd585789ebddfecb087';
const client_secret = '6b88c8e215cb1c62deb07c7e176fbb1b66799705246db502127d2dd92cc7bff5';
const redirect_uri = `http://localhost:${PORT}/auth/cryptobadge/callback`;

CANpass.config({
  canPassApi: 'https://test.canpass.me/oauth2',
  fetch,
});

app.get('/auth/cryptobadge/callback', (req, res) => {
  CANpass.getToken(
    {
      code: req.query.code,
      redirect_uri,
    },
    {
      client_id,
      client_secret,
    },
  ).then((token) => {
    console.log('-- retrieve token:', token);
    req.session.token = token;
    res.redirect('/');
  });
});

app.get('/logout', (req, res) => {
  delete req.session.token;
  res.redirect('/');
});

/**
  * Transfer CAT by call can-keys API to get redirect link to sign transaction
  * Receive {from, to , quantity} from client side
  * redirectUrl is where you go back when you signed a transaction
*/
app.post('/transferCat', (req, res) => {
  const { from, to, quantity } = req.body;
  const operation = {
    query: gql`
      mutation {
        requestSignTransaction(
          input: {
          transaction: {
            actions: {
              account: "eosio.token"
              name: "transfer"
              authorization: { actor: "${from}", permission: "active" }
              data: {
                  from: "${from}"
                  to: "${to}"
                  quantity: "${quantity} CAT"
                  memo: "Transfer CAT"
              }
            }
          }
          redirectUrl: "http://localhost:3002/"
          }
        ) {
          headerLocation
        }
      }
    `,
    context: { 
      headers: {
          "Authorization": `Bearer ${req.session.token.access_token}`
      }
    },
  };
  makePromise(execute(link, operation))
    .then(data => {
      //response a redirect url where user can sign transaction
      res.json(data.data.requestSignTransaction.headerLocation);
  }).catch(error => {
      console.log(`received error ${JSON.stringify(error, null, 2)}`)
      res.json(JSON.stringify(error, null, 2));
  })
  
})

app.listen(PORT, () => {
  console.info(`application is ready on: http://localhost:${PORT}`);
});
