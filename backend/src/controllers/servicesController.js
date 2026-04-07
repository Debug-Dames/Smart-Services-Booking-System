import prisma from "../config/database.js";

export const getServices = async (_req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });
    return res.json(services);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
