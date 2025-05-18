import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Venta = () => {
  const [productos, setProductos] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/productos')
      .then(res => setProductos(res.data))
      .catch(err => console.error(err));
  }, []);

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(p => p.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(p => p.id === producto.id ? {...p, cantidad: p.cantidad + 1} : p));
    } else {
      setCarrito([...carrito, {...producto, cantidad: 1}]);
    }
  };

  const cambiarCantidad = (id, cantidad) => {
    if (cantidad < 1) return;
    setCarrito(carrito.map(p => p.id === id ? {...p, cantidad} : p));
  };

  const realizarVenta = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const venta = {
      cliente_id: clienteId || null,
      productos: carrito.map(p => ({
        producto_id: p.id,
        cantidad: p.cantidad,
        precio_unitario: p.precio
      }))
    };

    axios.post('http://localhost:5000/api/venta', venta)
      .then(() => {
        alert('Venta realizada con éxito');
        setCarrito([]);
        setClienteId('');
      })
      .catch(() => alert('Error al realizar la venta'));
  };

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 20 }}>
      <h1>Sistema POS - Realizar Venta</h1>

      <div style={{ marginBottom: 10 }}>
        <label>Cliente ID (opcional): </label>
        <input 
          type="text" 
          value={clienteId} 
          onChange={e => setClienteId(e.target.value)} 
          style={{ padding: 5, width: 200 }}
        />
      </div>

      <h2>Productos Disponibles</h2>
      <ul>
        {productos.map(producto => (
          <li key={producto.id} style={{ marginBottom: 5 }}>
            {producto.nombre} - S/. {producto.precio.toFixed(2)} - Stock: {producto.cantidad}
            <button style={{ marginLeft: 10 }} onClick={() => agregarAlCarrito(producto)}>Agregar</button>
          </li>
        ))}
      </ul>

      <h2>Carrito</h2>
      {carrito.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', marginTop: 10 }}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio Unitario</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map(item => (
              <tr key={item.id}>
                <td>{item.nombre}</td>
                <td>S/. {item.precio.toFixed(2)}</td>
                <td>
                  <input 
                    type="number" 
                    min="1" 
                    value={item.cantidad} 
                    onChange={e => cambiarCantidad(item.id, parseInt(e.target.value))}
                    style={{ width: 50 }}
                  />
                </td>
                <td>S/. {(item.precio * item.cantidad).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={realizarVenta} style={{ marginTop: 20, padding: '10px 20px' }}>
        Realizar Venta
      </button>
    </div>
  );
};

export default Venta;
