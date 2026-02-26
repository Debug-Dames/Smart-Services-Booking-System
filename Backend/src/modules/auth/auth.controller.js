const authService = require("./auth.service");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("./auth.validation");

const register = (req, res, next) => {
  try {
    const validation = validateRegisterInput(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const data = authService.register(req.body);
    return res.status(201).json(data);
  } catch (error) {
    return next(error);
  }
};

const login = (req, res, next) => {
  try {
    const validation = validateLoginInput(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const data = authService.login(req.body);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

const me = (req, res) => {
  return res.json({ user: req.user });
};

module.exports = {
  register,
  login,
  me,
};
