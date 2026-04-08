import bcrypt from "bcryptjs";
import prisma from "../../config/database.js";

export async function getUsers(_req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    res.set("Cache-Control", "no-store");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

export async function getBookings(_req, res) {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });
    res.set("Cache-Control", "no-store");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
}

export async function createUser(req, res) {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const status = String(req.body.status || "Active");

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: "",
        role: "CUSTOMER",
      },
    });

    await prisma.$executeRaw`
      UPDATE "User"
      SET "status" = ${status}
      WHERE "id" = ${user.id}
    `;

    const [createdUser] = await prisma.$queryRaw`
      SELECT "id", "name", "email", "role", "status", "createdAt"
      FROM "User"
      WHERE "id" = ${user.id}
    `;

    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to create user" });
  }
}

export async function updateUser(req, res) {
  const id = Number(req.params.id);

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    const nextEmail =
      req.body.email !== undefined ? String(req.body.email).trim().toLowerCase() : existing.email;

    if (nextEmail !== existing.email) {
      const emailOwner = await prisma.user.findUnique({
        where: { email: nextEmail },
        select: { id: true },
      });

      if (emailOwner && emailOwner.id !== id) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    const data = {
      ...(req.body.name !== undefined ? { name: String(req.body.name).trim() } : {}),
      ...(req.body.email !== undefined ? { email: nextEmail } : {}),
    };

    if (req.body.password !== undefined) {
      data.password = await bcrypt.hash(String(req.body.password), 10);
    }

    await prisma.user.update({
      where: { id },
      data,
    });

    if (req.body.status !== undefined) {
      await prisma.$executeRaw`
        UPDATE "User"
        SET "status" = ${String(req.body.status)}
        WHERE "id" = ${id}
      `;
    }

    const [updated] = await prisma.$queryRaw`
      SELECT "id", "name", "email", "role", "status", "createdAt"
      FROM "User"
      WHERE "id" = ${id}
    `;

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
}

export async function deleteUser(req, res) {
  const id = Number(req.params.id);

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existing._count.bookings > 0) {
      return res.status(400).json({ message: "Cannot delete a user with existing bookings" });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
}

const normalizeStylistServices = (services, fallbackSpecialty) => {
  if (Array.isArray(services)) {
    return services
      .map((service) => String(service || "").trim())
      .filter(Boolean);
  }

  if (typeof services === "string" && services.trim()) {
    return [services.trim()];
  }

  if (typeof fallbackSpecialty === "string" && fallbackSpecialty.trim()) {
    return [fallbackSpecialty.trim()];
  }

  return [];
};

const normalizeStylistCategory = (body) => {
  const value = body.specialty ?? body.category;
  return String(value || "").trim();
};

export async function getStylists(_req, res) {
  try {
    const stylists = await prisma.stylist.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        availability: true,
        workingHours: true,
        status: true,
        services: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(
      stylists.map((stylist) => ({
        ...stylist,
        category: stylist.specialty || "",
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stylists" });
  }
}

export async function createStylist(req, res) {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const specialty = normalizeStylistCategory(req.body);
    const availability = String(req.body.availability || req.body.status || "Available");
    const workingHours = String(req.body.workingHours || "09:00 - 17:00");
    const status = String(req.body.status || req.body.availability || "Available");
    const services = normalizeStylistServices(req.body.services, specialty);

    const existing = await prisma.stylist.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return res.status(400).json({ message: "Stylist already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const stylist = await prisma.stylist.create({
      data: {
        name,
        email,
        password: hashedPassword,
        specialty: specialty || null,
        availability,
        workingHours,
        status,
        services,
      },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        availability: true,
        workingHours: true,
        status: true,
        services: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      ...stylist,
      category: stylist.specialty || "",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create stylist" });
  }
}

export async function updateStylist(req, res) {
  const id = Number(req.params.id);

  try {
    const existing = await prisma.stylist.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        specialty: true,
        availability: true,
        status: true,
        workingHours: true,
        services: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Stylist not found" });
    }

    const nextEmail =
      req.body.email !== undefined ? String(req.body.email).trim().toLowerCase() : existing.email;

    if (nextEmail !== existing.email) {
      const emailOwner = await prisma.stylist.findUnique({
        where: { email: nextEmail },
        select: { id: true },
      });

      if (emailOwner && emailOwner.id !== id) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    const hasAvailability = req.body.availability !== undefined;
    const hasStatus = req.body.status !== undefined;
    const resolvedAvailability = hasAvailability
      ? String(req.body.availability)
      : hasStatus
        ? String(req.body.status)
        : undefined;
    const resolvedStatus = hasStatus
      ? String(req.body.status)
      : hasAvailability
        ? String(req.body.availability)
        : undefined;
    const normalizedSpecialty =
      req.body.specialty !== undefined || req.body.category !== undefined
        ? normalizeStylistCategory(req.body)
        : undefined;

    const data = {
      ...(req.body.name !== undefined ? { name: String(req.body.name).trim() } : {}),
      ...(req.body.email !== undefined ? { email: nextEmail } : {}),
      ...(normalizedSpecialty !== undefined ? { specialty: normalizedSpecialty || null } : {}),
      ...(resolvedAvailability !== undefined ? { availability: resolvedAvailability } : {}),
      ...(req.body.workingHours !== undefined ? { workingHours: String(req.body.workingHours) } : {}),
      ...(resolvedStatus !== undefined ? { status: resolvedStatus } : {}),
      ...(req.body.services !== undefined
        ? { services: normalizeStylistServices(req.body.services, normalizedSpecialty) }
        : {}),
      updatedAt: new Date(),
    };

    if (req.body.password !== undefined) {
      data.password = await bcrypt.hash(String(req.body.password), 10);
    }

    const updated = await prisma.stylist.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        availability: true,
        workingHours: true,
        status: true,
        services: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      ...updated,
      category: updated.specialty || "",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update stylist" });
  }
}

export async function deleteStylist(req, res) {
  const id = Number(req.params.id);

  try {
    const existing = await prisma.stylist.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Stylist not found" });
    }

    await prisma.stylist.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete stylist" });
  }
}

export async function getServices(_req, res) {
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    // Keep response shape compatible with the Admin UI while persisting only real DB columns.
    const normalized = services.map((service) => ({
      ...service,
      category: "General",
      availability: "Available",
      isActive: true,
    }));

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch services" });
  }
}

export async function createService(req, res) {
  try {
    const { name, description, price, duration } = req.body;
    const normalizedName = String(name || "").trim();
    const numericPrice = Number(price);
    const numericDuration = Number(duration);

    if (!normalizedName || !Number.isFinite(numericPrice) || numericPrice < 0 || !Number.isFinite(numericDuration) || numericDuration <= 0) {
      return res.status(400).json({ message: "Invalid service payload" });
    }

    const service = await prisma.service.create({
      data: {
        name: normalizedName,
        description: description !== undefined ? String(description || "").trim() || null : null,
        price: numericPrice,
        duration: numericDuration,
      },
    });

    res.status(201).json({
      ...service,
      category: "General",
      availability: "Available",
      isActive: true,
    });
  } catch (error) {
    console.error("createService error:", error);
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
        name: req.body.name !== undefined ? String(req.body.name).trim() : existing.name,
        description:
          req.body.description !== undefined
            ? (String(req.body.description || "").trim() || null)
            : existing.description,
        price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
        duration: req.body.duration !== undefined ? Number(req.body.duration) : existing.duration,
      },
    });

    res.json({
      ...updated,
      category: "General",
      availability: "Available",
      isActive: true,
    });
  } catch (error) {
    console.error("updateService error:", error);
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
