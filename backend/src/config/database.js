import { Pool } from "pg";
import { env } from "./env.js";

const pool = new Pool(
  env.DATABASE_URL
    ? { connectionString: env.DATABASE_URL }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
      }
);

const convertSql = (sql) => {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
};

const db = {
  async exec(sql) {
    await pool.query(sql);
  },

  async all(sql, params = []) {
    const result = await pool.query(convertSql(sql), params);
    return result.rows;
  },

  async get(sql, params = []) {
    const result = await pool.query(convertSql(sql), params);
    return result.rows[0] || undefined;
  },

  async run(sql, params = []) {
    const text = convertSql(sql);
    const isInsert = /^\s*insert\s+/i.test(sql);
    const finalText =
      isInsert && !/\breturning\b/i.test(text) ? `${text} RETURNING id` : text;

    const result = await pool.query(finalText, params);

    return {
      changes: result.rowCount || 0,
      lastID: result.rows?.[0]?.id,
    };
  },
};

const dbPromise = Promise.resolve(db);

export async function initDB() {
  const db = await dbPromise;

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'customer'
    );
  `);
  await db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    service TEXT,
    appointment_date TEXT,
    appointment_time TEXT,
    status TEXT DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    price REAL NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL DEFAULT 30,
    availability TEXT DEFAULT 'Available',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`);
  await db.exec(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending'`);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_appointments_slot
    ON appointments (appointment_date, appointment_time);
  `);

  return db;
}

export default dbPromise;
