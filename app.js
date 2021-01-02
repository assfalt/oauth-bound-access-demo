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


// Full OIDC request debug
custom.setHttpOptionsDefaults({
    hooks: {
        beforeRequest: [
            (options) => {
                console.log('--> %s %s', options.method.toUpperCase(), options.url.href);
                console.log('--> HEADERS %o', options.headers);
                if (options.body) {
                    console.log('--> BODY %s', options.body);
                }
            },
        ],
        afterResponse: [
            (response) => {
                console.log('<-- %i FROM %s %s', response.statusCode, response.request.options.method.toUpperCase(), response.request.options.url.href);
                console.log('<-- HEADERS %o', response.headers);
                if (response.body) {
                    console.log('<-- BODY %s', response.body);
                }
                return response;
            },
        ],
    },
});

// Discover the Authorization Server
// This procedure populate an Issuer object
Issuer.discover(process.env.oauth_wellknown) // => Promise
    .then(function (issuer) {
        console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);
        logger('Discovered issuer %s %O', issuer.issuer, issuer.metadata);

        // Fetch the key pair (should be base64 encoded)
        const key = Buffer.from(process.env.mtls_privatekey,'base64').toString('ascii');
        const cert = Buffer.from(process.env.mtls_cert,'base64').toString('ascii');

        var client = new issuer.Client({
            client_id: process.env.oauth_clientid,
            token_endpoint_auth_method: 'tls_client_auth',
            tls_client_certificate_bound_access_tokens: true,
            redirect_uris: [process.env.oauth_redirecturi],
            scope: "openid profile"
        });
        // Set Client Certificate
        client[custom.http_options] = (opts) => ({ ...opts, https: { key, certificate: cert } });

        app.use(
            expressSesssion({
                secret: process.env.session_secret,
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
        app.get('/auth/callback', (req, res, next) => {
            passport.authenticate('oidc', {
                successRedirect: '/users',
                failureRedirect: '/'
            })(req, res, next);
        });

        // protected resource
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
