const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig');

router.get('/owner-only', (req, res) => {
    res.render('owner/orderInfo')
  })







module.exports = router