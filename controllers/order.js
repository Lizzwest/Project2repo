const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig');



router.get('/order-meal-plans', (req, res) => {
    res.render('order/orderMP')
  })
  router.get('/order-smack-n-snack', (req, res) => {
    res.render('order/orderSNS')
  })
  router.get('order/delivery', (req, res) => {
    //fetch call goes here

    res.render('order/delivery')
  })


module.exports = router