const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig');

router.get('/signup', (req, res) => {
	res.render('auth/signup');
});

router.get('/login', (req, res) => {
	res.render('auth/login');
});

router.post('/signup', (req, res) => {
	console.log(req.body);
	db.user
		.findOrCreate({
			where: { email: req.body.email },
			defaults: {
				name: req.body.name,
				password: req.body.password
			}
		})
		.then(([ user, created ]) => {
			if (created) {
        console.log(`${user.name} was created`);
        
        //flash message
				passport.authenticate('local', {
          successRedirect: '/',
          successFlash:'Account created and logging in'
				})(req, res);
				// res.redirect('/');
			} else {
				//email already exists
        console.log('email already exists');
        req.flash("Email already exists, PLease try again")
				res.redirect('/auth/signup');
			}
		})
		.catch((error) => {
      console.log('Error', error);
      req.flash("Error unfortunately...")
			res.redirect('/auth/signup');
		});
});
router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/',
    failureRedirect: '/auth/login',
    successFlash: "Welcome back", 
    failureFlash: "Either email or password is incorrect, please try again"
	})
);

router.get(
	'/logout',
	(req,
	res) => {
    req.logOut();
    req.flash("see you soon, logging out")
		res.redirect('/');
	})


module.exports = router;
