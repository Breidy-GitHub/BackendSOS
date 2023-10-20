const express = require('express');
const cors = require('cors'); // Importa el paquete cors
const mysql = require('mysql');

const app = express();
const PORT = 3000;

// Configura el middleware cors
app.use(cors());

// Configuración de la conexión a la base de datos
const conexion = mysql.createConnection({
    host: 'localhost',
    database: 'SOSecurity',
    user: 'root',
    password: ''
});

conexion.connect((error) => {
    if (error) {
        console.error('Error al conectar con la base de datos: ' + error.message);
        return;
    }
    console.log('Conexión a la base de datos establecida');
});

// Rutas de tu aplicación
app.get('/tipo_usuario', (req, res) => {
    // Consulta a la base de datos y envío de resultados
});

// Escucha en el puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor backend iniciado en el puerto ${PORT}`);
});

