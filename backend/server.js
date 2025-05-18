const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const productosRoutes = require('./productos');
const ventasRoutes = require('./ventas');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', productosRoutes);
app.use('/api', ventasRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
