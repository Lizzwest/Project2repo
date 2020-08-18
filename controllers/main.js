const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig');


router.get('/', (req, res) => {
    res.render('main/homepage')
  })
  router.get('/about', (req, res) => {
    res.render('main/about')
  })
  router.get('/contact', (req, res) => {
    res.render('main/contact')
  })
  router.get('/chefs-page', (req, res) => {
  res.render('main/recipe')
})



module.exports = router