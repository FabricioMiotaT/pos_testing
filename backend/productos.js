const express = require('express');
const router = express.Router();
const db = require('./db');

// Obtener todos los productos
router.get('/productos', (req, res) => {
  const stmt = db.prepare('SELECT * FROM productos');
  const productos = stmt.all();
  res.json(productos);
});

// Agregar un producto
router.post('/producto', (req, res) => {
  const { nombre, descripcion, precio, cantidad } = req.body;
  if (!nombre || !precio || cantidad == null) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  const stmt = db.prepare('INSERT INTO productos (nombre, descripcion, precio, cantidad) VALUES (?, ?, ?, ?)');
  const info = stmt.run(nombre, descripcion, precio, cantidad);
  res.status(201).json({ message: 'Producto agregado', id: info.lastInsertRowid });
});

// Actualizar un producto por id
router.put('/producto/:id', (req, res) => {
  const id = req.params.id;
  const { nombre, descripcion, precio, cantidad } = req.body;

  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const stmt = db.prepare(`
    UPDATE productos
    SET nombre = ?, descripcion = ?, precio = ?, cantidad = ?
    WHERE id = ?
  `);
  stmt.run(
    nombre || producto.nombre,
    descripcion || producto.descripcion,
    precio !== undefined ? precio : producto.precio,
    cantidad !== undefined ? cantidad : producto.cantidad,
    id
  );

  res.json({ message: 'Producto actualizado' });
});

module.exports = router;


// Eliminar producto por id
router.delete('/producto/:id', (req, res) => {
  const id = req.params.id;

  // Verifica si el producto existe
  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Elimina el producto
  const stmt = db.prepare('DELETE FROM productos WHERE id = ?');
  stmt.run(id);

  res.json({ message: 'Producto eliminado' });
});
