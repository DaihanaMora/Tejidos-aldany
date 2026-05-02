// db.js
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

class DatabaseConnection {
  constructor() {
    if (!DatabaseConnection.instance) {
      this.pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      });
      DatabaseConnection.instance = this;
      console.log("Conexión Singleton establecida con PostgreSQL.");
    }
    return DatabaseConnection.instance;
  }

  async query(text, params) {
    return this.pool.query(text, params);
  }
}

const instance = new DatabaseConnection();
Object.freeze(instance);
export default instance;