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
				passport.authenticate('local', {
					successRedirect: '/'
				})(req, res);
				// res.redirect('/');
			} else {
				//email already exists
				console.log('email already exists');
				res.redirect('/auth/signup');
			}
		})
		.catch((error) => {
			console.log('Error', error);
			res.redirect('/auth/signup');
		});
});
router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/auth/login'
	})
);

router.get(
	'/logout',
	(req,
	res) => {
		req.logOut();
		res.redirect('/');
	})


module.exports = router;
