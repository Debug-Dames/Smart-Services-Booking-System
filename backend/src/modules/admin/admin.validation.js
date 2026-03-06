const toNumber = (value) => Number(value);

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

