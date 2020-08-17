
const db = require('./models');
const user = require('./models/user');
const mealOrder =require('./models/mealorder');
const sosOrder = require('./models/smackorsnackorder');

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