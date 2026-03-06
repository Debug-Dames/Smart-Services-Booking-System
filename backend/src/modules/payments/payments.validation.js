export function validatePayment(req, res, next) {
  if (!req.body.amount) {
    return res.status(400).json({ message: "Amount required" });
  }
  next();
}