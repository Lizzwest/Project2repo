require('dotenv').config();
const db = require('./models');
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const SECRET_SESSION = process.env.SECRET_SESSION;
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_ACCESS_TOKEN });
const passport = require('./config/ppConfig');
const flash = require('connect-flash');
const methodOverride = require('method-override');
//let moment = require('moment')

//require the auth middleware at the top of the page

const isLoggedIn = require('./middleware/isLoggedIn');
const createServiceFactory = require('@mapbox/mapbox-sdk/services/service-helpers/create-service-factory');

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);
app.use(
	session({
		//secret: what we give the user to use on our site/ session cookie
		//resave: save the session even is its modified, make this false
		//saveUninitialized: new session we save it, therefor,
		//setting this to true
		secret: SECRET_SESSION,
		resave: false,
		saveUninitialized: true
	})
);

app.use(passport.initialize());
app.use(passport.session());
//flash for temp message to the user
app.use(flash());
app.use(methodOverride('_method'));

//middleware to have our messages accessible for every view

app.use((req, res, next) => {
	//before every route, we will attach our current user to res.local
	res.locals.alerts = req.flash();
	res.locals.currentUser = req.user;
	next();
});


app.get('/profile', isLoggedIn, (req, res) => {
	res.render('profile');
});
//helper functions
Number.prototype.toRad = function() {
	return this * Math.PI / 180;
};

function calculateDistanceToFarm(clientLat, clientLon) {
	// -117.997072, 33.843075437500005
	var farmLat = 33.843075437500005;
	var farmLon = -117.997072;
	

	var R = 6371; // km
	//has a problem with the .toRad() method below.
	var x1 = farmLat - clientLat;
	var dLat = x1.toRad();
	var x2 = farmLon - clientLon;
	var dLon = x2.toRad();
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(clientLat.toRad()) * Math.cos(farmLat.toRad()) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	console.log(d);
	return d;
}



function sendMessage(distance) {
	let msg = "no distance entered";
	if (distance < 15.9325) {
		msg =
			'Order Recieved! You qualify for FREE delivery! We will reach out within 48 hours to confirm date and time of delivery';
	} else if (distance < 24.1402 && distance > 15.9325) {
		msg =
			' Order Recieved! You qualify for $5 delivery! We will reach out within 48 hours to confirm date and time of delivery ';
	} else if (distance > 24.1402 && distance < 26.2) {
		msg =
			' Order Recieved! You qualify for $10 delivery! We will reach out within 48 hours to confirm date and time of delivery ';
	} else if(distance>= 26.2){
		msg =
			"We are sorry, we don't currently deliver to this area. We will reach out to schedule a pick up time or to cancel your order.";
	}
	return msg;
}

app.use('/auth', require('./controllers/auth'));
app.use('/', require('./controllers/food'))
app.use('/', require('./controllers/order'))
app.use('/', require('./controllers/owner'))
app.use('/', require('./controllers/main'))




app.get('/owner-only', (req, res) => {
	res.render('owner/orderInfo');
});




// Functions after the server


app.delete('/homepage', (req, res) => {
	console.log(req.user);
	try {
		db.user.destroy({
			where: {
				id: req.user.dataValues.id
			}
		});
		res.redirect('/');
	} catch (error) {
		res.render('error');
	}
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
	console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`);
});

module.exports = server
