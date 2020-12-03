const express = require('express');
const session = require('cookie-session');
const CANpass = require('can-pass-verify').default;

const { createHttpLink } = require('apollo-link-http');
const { execute, makePromise } = require('apollo-link');
const fetch = require('node-fetch');
const gql = require('graphql-tag');
const uri = 'https://prod.api.cryptobadge.app/can-keys/graphql';
const link = createHttpLink({ uri, fetch });
const uriCB = 'https://api.cryptobadge.app/graphql';
const linkCB = createHttpLink({ uri: uriCB, fetch });
const PORT = 3002;
const app = express();
app.use(express.json());

app.set('view engine', 'ejs');
app.use(session({ name: 'sign-transaction-sample', keys: ['key'], maxAge: 24 * 60 * 60 * 1000 }));
app.use(express.static('lib'));

app.get('/', (req, res) => res.render('index', { token: req.session.token }));
app.get('/check-balance', (req, res) => res.render('checkBalance', { token: req.session.token }));
app.get('/tranfer-history', (req, res) => res.render('transferHistory', { token: req.session.token }));

// CANpass integration
const client_id = 'ba1f6c8c4e30deba32ab1c415029e5db'; // Replace YOUR_CLIENT_ID here
const client_secret = 'fb9ca42cbdf00eb37ef2cd311f93f6c2199dbc131c1baa8f6c1627d5bd8b8d54'; // Replace YOUR_CLIENT_SECRET here
const redirect_uri = `http://localhost:${PORT}/auth/cryptobadge/callback`; // Need to config redirect_uri in your application when login success

CANpass.config({
  canPassApi: 'https://canpass.me/oauth2',
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

app.get('/sign-tx-callback', (req, res) => {
  const trx = req.query.trx;
  if(trx) {
    console.log('Sign Transaction Success!');
    res.redirect('/');
  }
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
  const { from, to, quantity, redirectUrl } = req.body;
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
          redirectUrl: "${redirectUrl}"
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
app.get('/getMyCanAccount', (req, res) => {
  const operation = {
    query: gql`
      query {
        me {
          canAccounts
        }
      }
    `,
    context: { 
      headers: {
          "Authorization": `Bearer ${req.session.token.access_token}`
      }
    },
  };
  makePromise(execute(linkCB, operation))
    .then(data => {
      res.json(data.data.me.canAccounts[0]);
  }).catch(error => {
      res.json(JSON.stringify(error, null, 2));
  })
})

app.listen(PORT, () => {
  console.info(`application is ready on: http://localhost:${PORT}`);
});
