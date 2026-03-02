const paymentsService = require('./payments.service');

exports.createPayment = async(req, res, next) => {
    try {
        const result = await paymentsService.createPayment(req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
};