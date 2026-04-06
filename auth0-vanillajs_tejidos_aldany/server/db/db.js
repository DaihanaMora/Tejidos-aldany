// db.js
import pkg from 'pg';
const { Pool } = pkg;

class DatabaseConnection {
  constructor() {
    if (!DatabaseConnection.instance) {
      this.pool = new Pool({
        user: 'admin_aldany',
        host: 'localhost',
        database: 'tejidos_aldany_db',
        password: 'password123',
        port: 5432,
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