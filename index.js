const express = require('express');
require('https').globalAgent.options.rejectUnauthorized = false;
const passport = require('passport');
const session = require('cookie-session');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const app = express();


app.set('view engine', 'ejs');
app.use(session({name: '3rd-party', keys: ['key'], maxAge: 24 * 60 * 60 * 1000}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('lib'));

app.get('/', (req, res) => res.render('index', { user: req.session.passport.user }));

app.post('/logout', (req, res) => {
  delete req.session.passport;
  res.redirect('/');
});

// CANpass integration
const clientID = 'd7e3d4b694728340a108a05379142213';
const clientSecret = 'YOUR_CLIENT_SECRET';
const callbackURL = 'http://localhost:3000/auth/callback';

passport.use(new OAuth2Strategy({
  authorizationURL: 'https://test.canpass.me/oauth2/authorize',
  tokenURL: 'https://test.canpass.me/oauth2/token',
  state: true,
  clientID,
  callbackURL
}, (accessToken, refreshToken, params, profile, done) => {
    console.log('accessToken', accessToken);
  request.post({
    url: 'https://dev.api.cryptobadge.app/m1/graphql',
    headers: {
      'Authorization': `Bearer ${accessToken}`
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
      }`
    }
  }, (error, response, {data: {me}}) => {
    if (error || response.statusCode !== 200) {
        console.log('error', error);
      return done(error);
    }
    done(null, me);
  });
}));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/auth/login', passport.authenticate('oauth2', {scope: ['email']}));
app.get('/auth/callback', passport.authenticate('oauth2'), (req, res) => res.redirect('/home'));

const PORT = 3000;

app.listen(PORT, () => {
  console.info(`application is ready on: http://localhost:${PORT}`);
});
