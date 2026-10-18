import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl:
    process.env.DB_SSL === "true"
      ? {
          ca: readFileSync(process.env.DB_SSL_CA_PATH, "utf8"),
          rejectUnauthorized: true,
        }
      : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
