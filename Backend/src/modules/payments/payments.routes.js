const express = require('express');
const router = express.Router();
const controller = require('./payments.controller');

router.post('/', controller.createPayment);

module.exports = router;