import 'dotenv/config';
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Helper para procesar CRUD
const queryDB = async (sql, params, res) => {
  try {
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// CRUD COMPLETO POR TABLAS
// ==========================================

const setupCRUD = (route, table, idField, columns) => {
  const colList = columns.join(', ');
  const valList = columns.map((_, i) => `$${i + 1}`).join(', ');
  const updateList = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

  // Create
  app.post(`/api/${route}`, (req, res) => {
    const values = columns.map(col => req.body[col]);
    queryDB(`INSERT INTO ${table} (${colList}) VALUES (${valList}) RETURNING *`, values, res);
  });
  // Read All
  app.get(`/api/${route}`, (req, res) => queryDB(`SELECT * FROM ${table}`, [], res));
  // Update
  app.put(`/api/${route}/:id`, (req, res) => {
    const values = [...columns.map(col => req.body[col]), req.params.id];
    queryDB(`UPDATE ${table} SET ${updateList} WHERE ${idField} = $${columns.length + 1} RETURNING *`, values, res);
  });
  // Delete
  app.delete(`/api/${route}/:id`, (req, res) => queryDB(`DELETE FROM ${table} WHERE ${idField} = $1`, [req.params.id], res));
};

// Mapeo de todas las tablas 
setupCRUD('proveedores', 'Proveedor', 'idproveedor', ['nombre', 'materialDisponible']);
setupCRUD('clientes', 'Cliente', 'idCliente', ['nombre', 'contacto']);
setupCRUD('costos', 'CostoPedido', 'idCostoPedido', ['Total']);
setupCRUD('confeccionistas', 'ConfeccionistaExterno', 'idConfeccionistaExterno', ['Nombre', 'Especialidad']);
setupCRUD('materiales', 'Material', 'idMaterial', ['tipo', 'color', 'Proveedor_idproveedor']);
setupCRUD('usuarios', 'Usuario', 'idUsuario', ['Nombre', 'Rol']);
setupCRUD('pedidos', 'Pedido', 'idPedido', ['codigo', 'estado', 'Cliente_idCliente', 'CostoPedido_idCostoPedido', 'Usuario_idUsuario', 'Confeccionista_id']);
setupCRUD('supervisores', 'Supervisor', 'idsupervisor', ['Nombre', 'Contacto', 'Pedido_idPedido']);
setupCRUD('tejedores', 'Tejedor', 'idTejedor', ['nombre', 'Produccion', 'Supervisor_idsupervisor']);
setupCRUD('items', 'ItemPedidos', 'idItemPedidos', ['talla', 'color', 'Material_idMaterial', 'Pedido_idPedido']);

const API_PORT = 3000; 

app.listen(API_PORT, () => {
    console.log(`🚀 API conectada y escuchando en http://localhost:${API_PORT}`);
});