import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

class Database {
  static instance;

  constructor() {
    this.db = knex({
      client: "pg",
      connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
      },
    });
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance.db;
  }
}

export default Database.getInstance();