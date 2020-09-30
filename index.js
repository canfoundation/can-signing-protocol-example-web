const express = require('express');
const session = require('cookie-session');
const CANpass = require('can-pass-verify').default;

const PORT = 3002;
const app = express();

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
  fetch: require('node-fetch'),
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

app.listen(PORT, () => {
  console.info(`application is ready on: http://localhost:${PORT}`);
});
