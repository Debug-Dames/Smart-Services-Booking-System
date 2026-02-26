const service = require("./payments.service");
const { validateCreatePaymentInput } = require("./payments.validation");

const create = (req, res, next) => {
  try {
    const validation = validateCreatePaymentInput(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const payment = service.createPayment(req.body, req.user);
    return res.status(201).json({ payment });
  } catch (error) {
    return next(error);
  }
};

const list = (req, res, next) => {
  try {
    const payments = service.listPayments(req.user);
    return res.json({ payments });
  } catch (error) {
    return next(error);
  }
};

const markRefunded = (req, res, next) => {
  try {
    const payment = service.updateStatus(req.params.id, "refunded");
    return res.json({ payment });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  create,
  list,
  markRefunded,
};
