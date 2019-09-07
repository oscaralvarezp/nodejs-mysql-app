const express = require('express');
const morgan = require('morgan');
const path = require('path');
const expresshbs = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const mysqlStore = require('express-mysql-session')(session);

const { database } = require('./keys');

// Initializations
const app = express();
require('./lib/passport');


// Settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

// Template engine config
app.engine('.hbs', expresshbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: 'nodemysqlapp',
    resave: false,
    saveUninitialized: false,
    store: new mysqlStore(database)
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Glogal variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});

// Routes
app.use(require('./routes'));
app.use(require('./routes/auth'));
app.use('/links' ,require('./routes/links'));

// public
app.use(express.static(path.join(__dirname, 'public')));

// Starting the server
app.listen(app.get('port'), () => {
    console.log(`Starting the server on port ${app.get('port')} link: http://localhost:${app.get('port')}`);
});