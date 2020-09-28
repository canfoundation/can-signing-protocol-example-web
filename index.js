const express = require('express');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const session = require('cookie-session');
const request = require('request');

const app = express();

app.set('view engine', 'ejs');

app.use(session({ name: 'sign-transaction-sample', keys: ['key'], maxAge: 24 * 60 * 60 * 1000 }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('lib'));

app.get('/', (req, res) => res.render('index', { user: req.session.passport.user }));

app.post('/logout', (req, res) => {
  delete req.session.passport;
  res.redirect('/');
});

const PORT = 3002;

// CANpass integration
const clientID = '514744fe2356ecd585789ebddfecb087';
const clientSecret = '6b88c8e215cb1c62deb07c7e176fbb1b66799705246db502127d2dd92cc7bff5';
const callbackURL = `http://localhost:${PORT}/auth/cryptobadge/callback`;

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: 'https://test.canpass.me/oauth2/authorize',
      tokenURL: 'https://test.canpass.me/oauth2/token',
      state: true,
      clientID,
      clientSecret,
      callbackURL,
    },
    (accessToken, refreshToken, params, profile, done) => {
      console.info('accessToken', accessToken);

      request.post(
        {
          url: 'https://dev.api.cryptobadge.app/m1/graphql',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          json: {
            query: `query {
              me {
                id
                name
                email
                path
                resourceUrl
              }
            }`,
          },
        },
        (error, response, { data: { me } }) => {
          if (error || response.statusCode !== 200) {
            console.error('error', error);
            return done(error);
          }
          done(null, me);
        },
      );
    },
  ),
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/auth/cryptobadge', passport.authenticate('oauth2', { scope: ['email'] }));
app.get('/auth/cryptobadge/callback', passport.authenticate('oauth2'), (req, res) => {
  console.info('query.code', res.query.code);
  res.redirect('/');
});

app.listen(PORT, () => {
  console.info(`application is ready on: http://localhost:${PORT}`);
});
