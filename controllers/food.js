const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig');


router.get('/mealplans', (req, res) => {
    res.render('food/mealPlan')
  })

  router.get('/bbq-sauce', (req, res) => {
    res.render('food/sauce')
  })
  router.get('/smacks', (req, res) => {
    res.render('food/smacks')
  })
  
  router.get('/snacks', (req, res) => {
    res.render('food/snacks')
  })



module.exports = router