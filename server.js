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
const methodOverride = require("method-override");
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
// app.use('/thegrub', require('./controllers/food'))
// // app.use('/order', require('./controllers/order'))
// app.use('/owner', require('./controllers/owner'))
// // app.use('/smacks-n-snacks', require('./controllers/main'))

//

app.get('/login', (req, res) => {
	res.render('auth/login');
});

app.get('/signup', (req, res) => {
	res.render('auth/signup');
});

app.get('/mealplans', (req, res) => {
	res.render('food/mealPlan');
});
app.get('/bbq-sauce', (req, res) => {
	res.render('food/sauce');
});
app.get('/smacks', (req, res) => {
	res.render('food/smacks');
});

app.get('/snacks', (req, res) => {
	res.render('food/snacks');
});
app.get('/order-meal-plans', (req, res) => {
	res.render('order/orderMP');
});
app.get('/order-smack-n-snack', (req, res) => {
	res.render('order/orderSNS');
});


app.get('/delivery', (req, res) => {
	//fetch call goes here
	res.render('order/delivery');
});

app.post('/order/delivery', (req, res)=>{
  // console.log(req.body);
  let email = req.body["delivery-email"]
  const query = [req.body["delivery-address"], req.body["delivery-city"], req.body["delivery-zip"]].join(",")
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
    const coords= features[0].center
    const lat = coords[1]
    const lon= coords[0]
    // console.log(query)
    let distance = calculateDistanceToFarm(lat,lon)
    let msg = sendMessage(distance)

    res.render("order/deliveryStatus", { msg: msg, email: email});

  });
  
})

app.post("/order/delivery-update", (req, res)=>{
  let email = req.body["delivery-email"]
  const query = [req.body["delivery-address"], req.body["delivery-city"], req.body["delivery-zip"]].join(",")
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
    const coords= features[0].center
    const lat = coords[1]
    const lon= coords[0]
    // console.log(query)
    let distance = calculateDistanceToFarm(lat,lon)
    let msg = sendMessage(distance)

    res.render("order/deliveryStatus", { msg: msg, email: email});

  });
})

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
  console.log(req.body)
  console.log(req.user)
  db.mealOrder.findOrCreate({
    where:{
      userId: req.user.id,
      // email: req.body.email,
    days: req.body.days,
      protein: req.body.protein,
      pasta:req.body.pasta,
      quinoa:req.body.quinoa,
      rice:req.body.rice,
      potatoes:req.body.potatoes,
      asparagus:req.body.asparagus,
      carrots:req.body.carrots,
      medley:req.body.medley

  }
})
  .then((post) => {
    res.redirect('/')
  })
  .catch((error) => {
    // res.status(400).render('error not found')
    res.send(JSON.stringify(error))
  })
})

// -117.997072, 33.843075437500005   lat long knotts
//why wont you work
app.post('/order-smack-n-snack', (req, res)=>{
  console.log(req.body)
  console.log(req.user)
  db.sOsOrder.findOrCreate({
    where:{
      userId: req.user.dataValues.id,
      days: req.body.days,
      cheesecake: req.body.cheesecake,
      slice: req.body.slice,
      eight: req.body.eight,
      ten: req.body.ten,
      twelve: req.body.twelve,
      granola: req.body.granola,
      bbq: req.body.bbq

    }
  }).then((post) => {
    res.redirect('/')
  })
  .catch((error) => {
    // res.status(400).render('error not found')
    res.send(JSON.stringify(error))
  })
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
	var farmLat = 33.843075437500005
	var farmLon = -117.997072
	// var clientLat = 42.806911;
	// var clientLon = -71.290611;

	var R = 6371; // km
	//has a problem with the .toRad() method below.
	var x1 = farmLat - clientLat;
	var dLat = x1.toRad();
	var x2 = farmLon - clientLon;
	var dLon = x2.toRad();
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(clientLat.toRad()) * Math.cos(farmLat.toRad()) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	console.log(d)
	return d;
}


app.delete("/homepage", async (req, res) => {
  try {
    await db.user.destroy({
      where: {
        userId: req.user.dataValues.id,
      },
    });
    res.redirect("/");
  } catch (error) {
    res.render("error");
  }
});


function sendMessage(distance) {
  let msg;
  if(distance < 15.9325){
      msg = "Order Recieved! You qualify for FREE delivery! We will reach out within 48 hours to confirm date and time of delivery"
    }else if(distance < 24.1402 && distance > 15.9325){
      msg = " Order Recieved! You qualify for $5 delivery! We will reach out within 48 hours to confirm date and time of delivery "
    }else if(distance > 24.1402 && distance < 26.2 ){
      msg = " Order Recieved! You qualify for $10 delivery! We will reach out within 48 hours to confirm date and time of delivery "
    }else{
      msg = "We are sorry, we don't currently deliver to this area. We will reach out to schedule a pick up time or to cancel your order."
    }
    return msg;
}
console.log(sendMessage(15.888));


// module.exports = server
