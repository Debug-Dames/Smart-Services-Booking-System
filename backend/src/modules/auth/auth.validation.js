export function validateAuth(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }
  next();
}