export async function createPayment(req, res) {
  res.json({
    message: "Payment processed (mock)",
    user: req.user.id
  });
}