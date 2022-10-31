const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const usersRouter = require('./src/routers/usersRouter');
const adminRouter = require('./src/routers/adminRouter');
const authRouter = require('./src/routers/authRouter');
const reportRouter = require('./src/routers/reportROuter');

const PORT = process.env.PORT || 8080;
const app = express();

app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '/public/')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: 'mrroboto'}))

require('./src/config/passport.js')(app);

app.set('views', './src/views');
app.set('view engine', 'ejs');

app.get('/report', authRouter.checkAuthenticated, (req, res) => {
    res.render('report', {user: req.user});
});

app.get('/register', authRouter.checkAuthenticated, (req, res) => {
    res.render('register');
});

app.get('/change_password', authRouter.checkAuthenticated, (req, res) => {
    res.render('change_password', {user: req.user});
});

app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter.authRouter);
app.use('/reports', reportRouter);

app.get('/', authRouter.checkAuthenticated, (req, res) => {
    const user = req.user
    if(req.user.role === 1){
        res.render('change_password', {user: user});
    } else {
        res.redirect('/report');
    }
});

app.listen(PORT, () => {
    debug(`Listening on port ${chalk.green(PORT)}`);
});