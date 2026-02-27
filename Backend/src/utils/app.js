const express = require('express');
const app = express();
const authRoutes = require('../modules/auth/auth.routes');
const paymentsRoutes = require('../modules/payments/payments.routes');
const errorHandler = require('../middlewares/error.middleware');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentsRoutes);

app.use(errorHandler);

module.exports = app;