const express = require('express');
const router = express.Router();
const db = require('../models');
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_ACCESS_TOKEN });



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
			'Order Received! You qualify for FREE delivery! We will reach out within 48 hours to confirm date and time of delivery';
	} else if (distance < 24.1402 && distance > 15.9325) {
		msg =
			' Order Received! You qualify for $5 delivery! We will reach out within 48 hours to confirm date and time of delivery ';
	} else if (distance > 24.1402 && distance < 26.2) {
		msg =
			' Order Received! You qualify for $10 delivery! We will reach out within 48 hours to confirm date and time of delivery ';
	} else if(distance>= 26.2){
		msg =
			"We are sorry, we don't currently deliver to this area. We will reach out to schedule a pick up time or to cancel your order.";
	}
	return msg;
}



router.get("/orderStatus", (req, res) =>{
	res.render("order/orderStatus")
})

router.get('/order-meal-plans', (req, res) => {
    res.render('order/orderMP')
  })
  router.get('/order-smack-n-snack', (req, res) => {
    res.render('order/orderSNS')
  })
  router.get('/delivery', (req, res) => {
    
    res.render('order/delivery')
  })

  router.get('/deliveryUpdate', (req, res) => {
    console.log('deliveryupdates page');
    res.render('order/deliveryUpdate');
  });

  // router.post('/order/delivery', (req, res) => {
  //   console.log(req.body, '----------');
  //   console.log(req.user, '--------');
  //   db.address
  //     .findOrCreate({
  //       where: {
  //         userId: req.user.dataValues.id,
  //         email: req.body.email,
  //         name: req.body.name,
  //         address: req.body.address,
  //         city: req.body.city,
  //         zip: req.body.zip
  //       }
  //     })
  //     .then((post) => {
  //       res.redirect('/order/delivery');
  //     })
  //     .catch((error) => {
  //       // res.status(400).render('error not found')
  //       res.send(JSON.stringify(error));
  //     });
  // });

 router.post('/order/delivery', (req, res) => {
    db.user
      .findOne({
        where: {
          
          email: req.body['delivery-email'],
          name: req.body["delivery-name"],
          
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
    // console.log(req.body);
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


    router.post('/order-meal-plans', (req, res) => {
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
    
    router.post('/order-smack-n-snack', (req, res) => {
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

    
    

module.exports = router