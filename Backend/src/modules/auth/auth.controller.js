const authService = require('./auth.service');

exports.login = async(req, res, next) => {
    try {
        const token = await authService.login(req.body);
        res.json({ token });
    } catch (err) {
        next(err);
    }
};