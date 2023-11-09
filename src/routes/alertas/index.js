const { Router } = require('express');
const router = Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const conexion = mysql.createConnection({
    host: 'localhost',
    database: 'sosecurity',
    user: 'root',
    password: '',
});

/* Conexión de la BD */
conexion.connect(function (err) {
    if (err) {
        console.error('Error de conexión: ' + err.stack);
        return;
    }
    console.log('Conectado con el identificador ' + conexion.threadId);
});

router.get('/', (req, res) => {
    res.json({ message: 'Conexión a BD correctamente!' });
});

// Ruta para obtener todos los tipos de notificaciones de contactos_emergencia
router.get('/alertasALL', (req, res) => {
    conexion.query('SELECT * FROM 		alertas', function (error, results, fields) {
        if (error) {
            console.error('Error al obtener tipos de usuario: ' + error.message);
            res.status(500).json({ error: 'Error al obtener tipos de usuario' });
            return;
        }
        res.json({ alertas: results }); // Enviar todos los tipos de usuario en una sola respuesta
    });
});

module.exports = router;