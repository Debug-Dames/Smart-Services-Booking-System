import dbPromise, { initDB } from "../../config/database.js";

await initDB();

const normalizeActive = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const raw = String(value || "").toLowerCase();
  return raw === "true" || raw === "1" || raw === "active";
};

export async function getUsers(_req, res) {
  const db = await dbPromise;
  const users = await db.all(
    `SELECT id, name, email, role FROM users ORDER BY id DESC`
  );
  res.json(users);
}

export async function getServices(_req, res) {
  const db = await dbPromise;
  const services = await db.all(`
    SELECT
      id,
      name,
      category,
      price,
      duration,
      availability,
      is_active AS isActive,
      created_at AS createdAt
    FROM services
    ORDER BY created_at DESC, id DESC
  `);

  res.json(
    services.map((service) => ({
      ...service,
      isActive: Boolean(service.isActive),
    }))
  );
}

export async function createService(req, res) {
  const { name, category, price, duration, availability, isActive } = req.body;
  const db = await dbPromise;

  const serviceName = String(name || "").trim();
  const servicePrice = Number(price);
  const serviceDuration = Number(duration);

  if (!serviceName || !Number.isFinite(servicePrice) || !Number.isFinite(serviceDuration) || serviceDuration <= 0) {
    return res.status(400).json({ message: "Invalid service payload" });
  }

  const result = await db.run(
    `INSERT INTO services (name, category, price, duration, availability, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      serviceName,
      category || "General",
      servicePrice,
      serviceDuration,
      availability || "Available",
      normalizeActive(isActive ?? true),
    ]
  );

  const created = await db.get(
    `SELECT id, name, category, price, duration, availability, is_active AS isActive
     FROM services
     WHERE id = ?`,
    [result.lastID]
  );

  res.status(201).json({
    ...created,
    isActive: Boolean(created.isActive),
  });
}

export async function updateService(req, res) {
  const { id } = req.params;
  const db = await dbPromise;
  const current = await db.get(`SELECT * FROM services WHERE id = ?`, [id]);

  if (!current) {
    return res.status(404).json({ message: "Service not found" });
  }

  const nextName = String(req.body.name ?? current.name).trim();
  const nextCategory = req.body.category ?? current.category;
  const nextPrice = Number(req.body.price ?? current.price);
  const nextDuration = Number(req.body.duration ?? current.duration);
  const nextAvailability = req.body.availability ?? current.availability;
  const nextIsActive = normalizeActive(req.body.isActive ?? current.is_active);

  if (!nextName || !Number.isFinite(nextPrice) || !Number.isFinite(nextDuration) || nextDuration <= 0) {
    return res.status(400).json({ message: "Invalid service payload" });
  }

  await db.run(
    `UPDATE services
     SET name = ?, category = ?, price = ?, duration = ?, availability = ?, is_active = ?
     WHERE id = ?`,
    [nextName, nextCategory, nextPrice, nextDuration, nextAvailability, nextIsActive, id]
  );

  const updated = await db.get(
    `SELECT id, name, category, price, duration, availability, is_active AS isActive
     FROM services
     WHERE id = ?`,
    [id]
  );

  res.json({
    ...updated,
    isActive: Boolean(updated.isActive),
  });
}

export async function deleteService(req, res) {
  const { id } = req.params;
  const db = await dbPromise;

  const current = await db.get(`SELECT id FROM services WHERE id = ?`, [id]);
  if (!current) {
    return res.status(404).json({ message: "Service not found" });
  }

  await db.run(`DELETE FROM services WHERE id = ?`, [id]);
  res.status(204).send();
}
