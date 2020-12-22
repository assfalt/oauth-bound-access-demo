var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSesssion = require('express-session');
const passport = require('passport');
const { Issuer, Strategy ,custom } = require('openid-client');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

Issuer.discover('https://auth.myexample.com:8443/oauth/v2/oauth-anonymous/.well-known/openid-configuration') // => Promise
    .then(function (issuer) {
        console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);


const key = `Add Key`;


const cert = `Add Cert`;



var client = new issuer.Client({
        client_id: 'test12',
          token_endpoint_auth_method: 'tls_client_auth',
          tls_client_certificate_bound_access_tokens: true,
        redirect_uris: ['http://localhost:3000/auth/callback'],
      });
      client[custom.http_options] = (opts) => ({ ...opts, https: { key, certificate: cert } });

      app.use(
          expressSesssion({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: true
          })
      );

      app.use(passport.initialize());
      app.use(passport.session());

      passport.use(
          'oidc',
          new Strategy({ client }, (tokenSet, done) => {
            return done(null, tokenSet.claims());
          })
      );

      // handles serialization and deserialization of authenticated user
      passport.serializeUser(function(user, done) {
        done(null, user);
      });
      passport.deserializeUser(function(user, done) {
        done(null, user);
      });

      // start authentication request
      app.get('/auth', (req, res, next) => {
        passport.authenticate('oidc')(req, res, next);
      });

      // authentication callback
      app.get('/auth/callback',
          function (req, res, next) {
              // call passport authentication passing the "local" strategy name and a callback function
              passport.authenticate('oidc', function (error, user, info) {
                  // this will execute in any case, even if a passport strategy will find an error
                  // log everything to console
                  console.log(error);
                  console.log(user);
                  console.log(info);

                  if (error) {
                      res.status(401).send(error);
                  } else if (!user) {
                      res.status(401).send(info);
                  } else {
                      next();
                  }

                  res.status(401).send(info);
              })(req, res);
          },

          // function to call once successfully authenticated
          function (req, res) {
              res.status(200).send('logged in!');
          });

      app.use('/users', usersRouter);
      // start logout request
      app.get('/logout', (req, res) => {
        res.redirect(client.endSessionUrl());
      });

      // logout callback
      app.get('/logout/callback', (req, res) => {
        // clears the persisted user from the local storage
        req.logout();
        // redirects the user to a public route
        res.redirect('/');
      });


      // do the rest of setup here


// catch 404 and forward to error handler
      app.use(function (req, res, next) {
        next(createError(404));
      });

// error handler
      app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
      });


    });
module.exports = app;





