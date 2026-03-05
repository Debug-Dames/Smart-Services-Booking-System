import { protect } from "../../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../../middlewares/role.middleware.js";

export const requireAdmin = [protect, roleMiddleware("ADMIN")];

