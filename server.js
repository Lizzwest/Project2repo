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
app.get('/', (req, res) => {
	res.render('main/homepage', { alerts: res.locals.alerts });
});

app.get('/profile', isLoggedIn, (req, res) => {
	res.render('profile');
});

app.use('/auth', require('./controllers/auth'));
app.use('/', require('./controllers/food'))
app.use('/', require('./controllers/order'))
app.use('/', require('./controllers/owner'))
app.use('/', require('./controllers/main'))

//

app.get('/login', (req, res) => {
	res.render('auth/login');
});

app.get('/signup', (req, res) => {
	res.render('auth/signup');
});

// app.get('/mealplans', (req, res) => {
// 	res.render('food/mealPlan');
// });
// app.get('/bbq-sauce', (req, res) => {
// 	res.render('food/sauce');
// });
// app.get('/smacks', (req, res) => {
// 	res.render('food/smacks');
// });

// app.get('/snacks', (req, res) => {
// 	res.render('food/snacks');
// });
// app.get('/order-meal-plans', (req, res) => {
// 	res.render('order/orderMP');
// });
// app.get('/order-smack-n-snack', (req, res) => {
// 	res.render('order/orderSNS');
// });

// app.get('/delivery', (req, res) => {
// 	//fetch call goes here
// 	console.log('this is the delivery page');
// 	res.render('order/delivery');
// });

app.get('/deliveryUpdate', (req, res) => {
	console.log('deliveryupdates page');
	res.render('order/deliveryUpdate');
});

// app.get("/orderStatus", (req, res) =>{
// 	res.render("order/orderStatus")
// })



app.post('/order/delivery', (req, res) => {
	db.user
		.findOne({
			where: {
				// userId: req.user.id,
				email: req.body['delivery-email'],
				name: req.body["delivery-name"],
				// address: req.body.address,
				// city: req.body.city,
				// zip: req.body.zip
      }
      

      //edge case, security of changing delivery address
		})
		.then(function(user) {
			console.log(user.get()); // returns info about the user
			db.address
				.findOrCreate({
					where: {
						userId: user.get().id
					},
					defaults: {
						address: req.body['delivery-address'],
						city: req.body['delivery-city'],
						zip: req.body['delivery-zip']
					}
				})
				.then(function([ address, created ]) {
					if (created) {
						geocodingClient
							.forwardGeocode({
								query: query
							})
							.send()
							.then((response) => {
								const match = response.body;
								// console.log(match);
								const features = match.features;
								// console.log("feature[0]");
								// console.log(features[0]);
								const coords = features[0].center;
								const lat = coords[1];
								const lon = coords[0];
								// console.log(query)
								let distance = calculateDistanceToFarm(lat, lon);
								let msg = sendMessage(distance);

								res.render('order/deliveryStatus', { msg: msg, email: email });
							});
					}else{
            db.address.update({
              address: req.body["delivery-address"],
              city: req.body["delivery-city"],
              zip: req.body["delivery-zip"]
            }, {
              where: { userId: user.get().id }
            }).then(response => {
               console.log(response);
            })
             
          }
				});
		});
	console.log(req.body);
	let email = req.body['delivery-email'];
	const query = [ req.body['delivery-address'], req.body['delivery-city'], req.body['delivery-zip'] ].join(',');
	geocodingClient
		.forwardGeocode({
			query: query
		})
		.send()
		.then((response) => {
			const match = response.body;
			// console.log(match);
			const features = match.features;
			// console.log("feature[0]");
			// console.log(features[0]);
			const coords = features[0].center;
			const lat = coords[1];
			const lon = coords[0];
			// console.log(query)
			let distance = calculateDistanceToFarm(lat, lon);
			let msg = sendMessage(distance);

			res.render('order/deliveryStatus', { msg: msg, email: email });
		});
});



app.get('/contact', (req, res) => {
	res.render('main/contact');
});
app.get('/owner-only', (req, res) => {
	res.render('owner/orderInfo');
});
app.get('/about', (req, res) => {
	res.render('main/about');
});
app.post('/order-meal-plans', (req, res) => {
	console.log(req.body);
	console.log(req.user);
	db.mealOrder
		.findOrCreate({
			where: {
				userId: req.user.id,
				// email: req.body.email,
				days: req.body.days,
				protein: req.body.protein,
				pasta: req.body.pasta,
				quinoa: req.body.quinoa,
				rice: req.body.rice,
				potatoes: req.body.potatoes,
				asparagus: req.body.asparagus,
				carrots: req.body.carrots,
				medley: req.body.medley
			}
		})
		.then((post) => {
			res.render('order/orderStatus', {msg: "Your order has been recieved! We will contact you within 48 hours to set up a pickup time!"})
		})
		.catch((error) => {
			// res.status(400).render('error not found')
			res.send(JSON.stringify(error));
		});
});

app.post('/order/delivery', (req, res) => {
	console.log(req.body, '----------');
	console.log(req.user, '--------');
	db.address
		.findOrCreate({
			where: {
				userId: req.body.user.id,
				// email: req.body.email,
				name: req.body.name,
				address: req.body.address,
				city: req.body.city,
				zip: req.body.zip
			}
		})
		.then((post) => {
			res.redirect('/order/delivery');
		})
		.catch((error) => {
			// res.status(400).render('error not found')
			res.send(JSON.stringify(error));
		});
});

// -117.997072, 33.843075437500005   lat long knotts
//why wont you work
app.post('/order-smack-n-snack', (req, res) => {
	console.log(req.body);
	console.log(req.user);
	let payload = {userId: req.user.id,
		cheesecakeFlavor: req.body.cheesecakeFlavor,
		slice: req.body.slice,
		eight: req.body.eight,
		ten: req.body.ten,
		twelve: req.body.twelve,
		granola: req.body.granola,
		bbq: req.body.bbq
	}
	console.log(payload)
	db.sOsOrder
		.findOrCreate({
			where: payload
		})
		.then((post) => {
			res.render('order/orderStatus', {msg: "Your order has been recieved! We will contact you within 48 hours to set up a pickup time!"})
		})
		.catch((error) => {
			// res.status(400).render('error not found')
			res.send(JSON.stringify(error));
		});
});

// app.post("/order/delivery-update")

// geocodingClient
// 	.forwardGeocode({
// 		query: "Knott's Berry Farm, Buena Park, CA"
// 	})
// 	.send()
// 	.then((response) => {
// 		const match = response.body;
// 		let featureCoordinates = match.features[0].center;
// 		console.log('Querying the coords for Knotts Berry Farm here:', featureCoordinates);
// 	});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`);
});

// Functions after the server
Number.prototype.toRad = function() {
	return this * Math.PI / 180;
};

// calculateDistanceToFarm(33.812511,-117.918976)
function calculateDistanceToFarm(clientLat, clientLon) {
	// -117.997072, 33.843075437500005
	var farmLat = 33.843075437500005;
	var farmLon = -117.997072;
	// var clientLat = 42.806911;
	// var clientLon = -71.290611;

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

//delete not working maybe ask zintis
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
console.log(sendMessage(15.888));

// module.exports = server
