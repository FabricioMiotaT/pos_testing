const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/venta', (req, res) => {
  const { cliente_id, productos } = req.body;

  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Debe enviar al menos un producto' });
  }

  // Verificar que hay stock suficiente para cada producto
  for (const p of productos) {
    const productoActual = db.prepare('SELECT cantidad FROM productos WHERE id = ?').get(p.producto_id);
    if (!productoActual) {
      return res.status(400).json({ error: `Producto con ID ${p.producto_id} no existe` });
    }
    if (productoActual.cantidad < p.cantidad) {
      return res.status(400).json({ error: `Stock insuficiente para producto ID ${p.producto_id}` });
    }
  }

  // Calcular total
  let total = 0;
  productos.forEach(p => {
    total += p.precio_unitario * p.cantidad;
  });

  // Insertar venta
  const ventaStmt = db.prepare('INSERT INTO ventas (cliente_id, total) VALUES (?, ?)');
  const infoVenta = ventaStmt.run(cliente_id || null, total);
  const venta_id = infoVenta.lastInsertRowid;

  // Preparar para insertar detalles venta y actualizar stock
  const detalleStmt = db.prepare('INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)');
  const updateStockStmt = db.prepare('UPDATE productos SET cantidad = cantidad - ? WHERE id = ?');

  const insertMany = db.transaction((productos) => {
    for (const p of productos) {
      detalleStmt.run(venta_id, p.producto_id, p.cantidad, p.precio_unitario);
      updateStockStmt.run(p.cantidad, p.producto_id);
    }
  });

  insertMany(productos);

  res.status(201).json({ message: 'Venta registrada y stock actualizado', venta_id });
});

module.exports = router;
