const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes'); // Importa las rutas
const app = express();

// Configuración del middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/', routes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend iniciado en el puerto ${PORT}`);
});


