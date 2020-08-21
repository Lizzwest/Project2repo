
const db = require('./models');
const user = require('./models/user');
const mealOrder =require('./models/mealorder');
const sosOrder = require('./models/sosorder');

db.user.findOrCreate({
    where: {
      email: 'lizwesterband@gmail.com',
    
    },
    defaults: {name: "Lizz",
        password: "developer",
    isChef: true }

  }).then(function(user, created) {
    console.log(user); // returns info about the user
  });

  db.mealOrder.findOrCreate({
    where: {
      userId: 1,
      days:3,
      protein: "chicken",
      pasta:1,
      quinoa:0,
      rice:0,
      potatoes:2,
      asparagus:0,
      carrots:3,
      medley:0
    
    },

  
    

  }).then(function(mealOrder, created) {
    console.log(mealOrder); // returns info about the user
  })
    db.sOsOrder.findOrCreate({
      where:{
        userId:1,
        cheesecakeFlavor: "Milk n Cookies",
        slice:0,
        eight:0,
        ten:1,
        twelve:0,
        granola:0,
        yogurt:0,
        bbq:1


      }
    }).then(function(sOsOrder, created) {
      console.log(sOsOrder);
  })



  db.address.findOrCreate({
    where:{
      // userId: req.user.id,
      // email: req.body.email,
      // name: req.body.name,
      // address: req.body.address,
      // city: req.body.city,
      // zip: req.body.zip
      // email: "lizwesterband@gmail.com",
      userId: 1,
      address: "21851 camargo",
      city: "Mission Viejo",
      zip: 92691

  }
}).then(function(address, created) {
  console.log(address); // returns info about the user
})
  