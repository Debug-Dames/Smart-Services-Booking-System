const toNumber = (value) => Number(value);
const USER_STATUSES = new Set(["Active", "Suspended", "Blocked"]);
const STYLIST_STATUSES = new Set(["Available", "Busy", "Offline"]);

export const validateServiceId = (req, res, next) => {
    const serviceId = toNumber(req.params.id);

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
        return res.status(400).json({ message: "Service id must be a positive integer" });
    }

    next();
};

export const validateCreateService = (req, res, next) => {
    const { name, price, duration } = req.body;
    const normalizedName = String(name || "").trim();
    const numericPrice = Number(price);
    const numericDuration = Number(duration);

    if (!normalizedName) {
        return res.status(400).json({ message: "Service name is required" });
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: "Price must be a valid non-negative number" });
    }

    if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
        return res.status(400).json({ message: "Duration must be a valid positive number" });
    }

    next();
};

export const validateUpdateService = (req, res, next) => {
    const { name, price, duration } = req.body;

    if (name !== undefined && !String(name).trim()) {
        return res.status(400).json({ message: "Service name cannot be empty" });
    }

    if (price !== undefined) {
        const numericPrice = Number(price);
        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
            return res.status(400).json({ message: "Price must be a valid non-negative number" });
        }
    }

    if (duration !== undefined) {
        const numericDuration = Number(duration);
        if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
            return res.status(400).json({ message: "Duration must be a valid positive number" });
        }
    }

    next();
};

export const validateUserId = (req, res, next) => {
    const userId = toNumber(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ message: "User id must be a positive integer" });
    }

    next();
};

export const validateCreateUser = (req, res, next) => {
    const { name, email, password, status } = req.body;

    if (!String(name || "").trim()) {
        return res.status(400).json({ message: "User name is required" });
    }

    if (!String(email || "").trim()) {
        return res.status(400).json({ message: "User email is required" });
    }

    if (!String(password || "").trim()) {
        return res.status(400).json({ message: "User password is required" });
    }

    if (status !== undefined && !USER_STATUSES.has(String(status))) {
        return res.status(400).json({ message: "Invalid user status" });
    }

    next();
};

export const validateUpdateUser = (req, res, next) => {
    const { name, email, password, status } = req.body;

    if (name !== undefined && !String(name).trim()) {
        return res.status(400).json({ message: "User name cannot be empty" });
    }

    if (email !== undefined && !String(email).trim()) {
        return res.status(400).json({ message: "User email cannot be empty" });
    }

    if (password !== undefined && !String(password).trim()) {
        return res.status(400).json({ message: "User password cannot be empty" });
    }

    if (status !== undefined && !USER_STATUSES.has(String(status))) {
        return res.status(400).json({ message: "Invalid user status" });
    }

    next();
};

export const validateStylistId = (req, res, next) => {
    const stylistId = toNumber(req.params.id);

    if (!Number.isInteger(stylistId) || stylistId <= 0) {
        return res.status(400).json({ message: "Stylist id must be a positive integer" });
    }

    next();
};

export const validateCreateStylist = (req, res, next) => {
    const { name, email, password, availability, status, services, specialty, category } = req.body;

    if (!String(name || "").trim()) {
        return res.status(400).json({ message: "Stylist name is required" });
    }

    if (!String(email || "").trim()) {
        return res.status(400).json({ message: "Stylist email is required" });
    }

    if (!String(password || "").trim()) {
        return res.status(400).json({ message: "Stylist password is required" });
    }

    if (specialty !== undefined && !String(specialty).trim() && category === undefined) {
        return res.status(400).json({ message: "Stylist specialty/category cannot be empty" });
    }

    if (category !== undefined && !String(category).trim() && specialty === undefined) {
        return res.status(400).json({ message: "Stylist specialty/category cannot be empty" });
    }

    if (availability !== undefined && !STYLIST_STATUSES.has(String(availability))) {
        return res.status(400).json({ message: "Invalid stylist availability" });
    }

    if (status !== undefined && !STYLIST_STATUSES.has(String(status))) {
        return res.status(400).json({ message: "Invalid stylist status" });
    }

    if (services !== undefined && !Array.isArray(services)) {
        return res.status(400).json({ message: "Services must be an array of service names" });
    }

    next();
};

export const validateUpdateStylist = (req, res, next) => {
    const { name, email, password, availability, status, services, specialty, category } = req.body;

    if (name !== undefined && !String(name).trim()) {
        return res.status(400).json({ message: "Stylist name cannot be empty" });
    }

    if (email !== undefined && !String(email).trim()) {
        return res.status(400).json({ message: "Stylist email cannot be empty" });
    }

    if (password !== undefined && !String(password).trim()) {
        return res.status(400).json({ message: "Stylist password cannot be empty" });
    }

    if (specialty !== undefined && !String(specialty).trim() && category === undefined) {
        return res.status(400).json({ message: "Stylist specialty/category cannot be empty" });
    }

    if (category !== undefined && !String(category).trim() && specialty === undefined) {
        return res.status(400).json({ message: "Stylist specialty/category cannot be empty" });
    }

    if (availability !== undefined && !STYLIST_STATUSES.has(String(availability))) {
        return res.status(400).json({ message: "Invalid stylist availability" });
    }

    if (status !== undefined && !STYLIST_STATUSES.has(String(status))) {
        return res.status(400).json({ message: "Invalid stylist status" });
    }

    if (services !== undefined && !Array.isArray(services)) {
        return res.status(400).json({ message: "Services must be an array of service names" });
    }

    next();
};

