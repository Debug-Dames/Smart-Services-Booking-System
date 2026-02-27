exports.authenticate = (req, res, next) => {
    // TODO: verify JWT / session
    req.user = req.user || null; // placeholder
    next();
};