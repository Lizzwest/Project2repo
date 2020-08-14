require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session')
const SECRET_SESSION = process.env.SECRET_SESSION
const passport = require('./config/ppConfig')
const flash = require("connect-flash")

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
  res.local.alerts = req.flash();
  res.local.currentUser = req.user;
  next();
})
app.get('/', (req, res) => {
  res.render('index', {alert: req.flash});
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.use('/auth', require('./routes/auth'));



const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`);
});

module.exports = server;
