require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session')
const SECRET_SESSION = process.env.SECRET_SESSION
const passport = require('./config/ppConfig')
const flash = require("connect-flash")
//let moment = require('moment')

//require the auth middleware at the top of the page

const isLoggedIn = require("./middleware/isLoggedIn")

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public')); 
app.use(layouts);
app.use(session({
  //secret: what we give the user to use on our site/ session cookie
  //resave: save the session even is its modified, make this false
  //saveUninitialized: new session we save it, therefor,
  //setting this to true
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized:true
}))


app.use(passport.initialize());
app.use(passport.session())
//flash for temp message to the user
app.use(flash());

//middleware to have our messages accessible for every view

app.use((req, res, next)=>{
  //before every route, we will attach our current user to res.local
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
})
app.get('/', (req, res) => {
  res.render('main/homepage', {alerts: res.locals.alerts});
});

app.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile');
});

app.use('/auth', require('./controllers/auth'));
// app.use('/thegrub', require('./controllers/food'))
// // app.use('/order', require('./controllers/order'))
// app.use('/owner', require('./controllers/owner'))
// // app.use('/smacks-n-snacks', require('./controllers/main'))
// app.use('/contact', require('./controllers/contact'));

app.get('/', (req, res) => {
  res.render('main/homepage')
})
//
app.get('/contact', (req, res) => {
  res.render('main/contact')
})
app.get('/login', (req, res) => {
  res.render('auth/login')
})
app.get('/about', (req, res) => {
  res.render('main/about')
})
app.get('/signup', (req, res) => {
  res.render('auth/signup')
})

app.get('/mealplans', (req, res) => {
  res.render('food/mealPlan')
})
app.get('/bbq-sauce', (req, res) => {
  res.render('food/sauce')
})
app.get('/smacks', (req, res) => {
  res.render('food/smacks')
})

app.get('/snacks', (req, res) => {
  res.render('food/snacks')
})
app.get('/order', (req, res) => {
  res.render('order/order')
})
app.get('/delivery', (req, res) => {
  res.render('order/delivery')
})
app.get('/contact', (req, res) => {
  res.render('orderContact/contact')
})
app.get('/owner-only', (req, res) => {
  res.render('owner/orderInfo')
})


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`);
});

module.exports = server;
