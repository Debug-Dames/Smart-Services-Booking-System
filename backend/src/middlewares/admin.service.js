import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const normalizeActive = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const raw = String(value || "").toLowerCase();
  return raw === "true" || raw === "1" || raw === "active";
};

export async function getUsers(_req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

export async function getServices(_req, res) {
  try {
    const services = await prisma.service.findMany({
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
    });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch services" });
  }
}

export async function createService(req, res) {
  try {
    const { name, category, price, duration, availability, isActive } = req.body;

    if (!name || !price || !duration || duration <= 0) {
      return res.status(400).json({ message: "Invalid service payload" });
    }

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        category: category || "General",
        price: Number(price),
        duration: Number(duration),
        availability: availability || "Available",
        isActive: isActive ?? true,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: "Failed to create service" });
  }
}

export async function updateService(req, res) {
  const { id } = req.params;

  try {
    const existing = await prisma.service.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Service not found" });
    }

    const updated = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        name: req.body.name ?? existing.name,
        category: req.body.category ?? existing.category,
        price: req.body.price ? Number(req.body.price) : existing.price,
        duration: req.body.duration ? Number(req.body.duration) : existing.duration,
        availability: req.body.availability ?? existing.availability,
        isActive: req.body.isActive ?? existing.isActive,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update service" });
  }
}

export async function deleteService(req, res) {
  const { id } = req.params;

  try {
    await prisma.service.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: "Service not found" });
  }
}

