const { Router } = require('express');
const router = Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Configuración de variables de entorno (puedes cargar estas desde un archivo .env)
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'sosecurity',
};

const conexion = mysql.createConnection(dbConfig);

/* Conexión a la BD */
conexion.connect(function (err) {
    if (err) {
        console.error('Error de conexión: ' + err.stack);
        return;
    }
    console.log('Conectado con el identificador ' + conexion.threadId);
});

// Middleware para verificar el token JWT
const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ mensaje: 'Acceso denegado, token no proporcionado' });

    jwt.verify(token, process.env.JWT_SECRET || 'tuclaveSecreta', (error, usuario) => {
        if (error) return res.status(403).json({ mensaje: 'Token no válido' });

        req.usuario = usuario;
        next();
    });
};

// Ruta para obtener todos los usuarios
router.get('/usuarios', verificarToken, (req, res) => {
    conexion.query('SELECT * FROM usuario', function (error, results) {
        if (error) {
            console.error('Error al obtener usuarios: ' + error.message);
            res.status(500).json({ error: 'Error al obtener usuarios' });
            return;
        }
        res.json({ usuarios: results });
    });
});

// Ruta para obtener un usuario por ID
router.get('/usuarios/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    conexion.query('SELECT * FROM usuario WHERE id = ?', [id], function (error, results) {
        if (error) {
            console.error('Error al obtener usuario por ID: ' + error.message);
            res.status(500).json({ error: 'Error al obtener usuario por ID' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ mensaje: 'Usuario no encontrado' });
        } else {
            res.json(results[0]);
        }
    });
});

// Ruta para crear un nuevo usuario
router.post('/usuarios', [
    body('nombre').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, email, password } = req.body;

    try {
        const hash = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO usuario SET ?';
        const userData = {
            nombre: nombre,
            email: email,
            password: hash,
        };

        conexion.query(insertQuery, userData, (error, results) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al crear el usuario',
                });
            }
            res.status(201).json({
                mensaje: 'Usuario creado correctamente',
                id: results.insertId,
            });
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Error al encriptar la contraseña',
        });
    }
});

// Ruta para actualizar un usuario por ID
router.put('/usuarios/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, email, password } = req.body;

    try {
        const hash = await bcrypt.hash(password, 10);
        const updateQuery = 'UPDATE usuario SET nombre = ?, email = ?, password = ? WHERE id = ?';

        conexion.query(updateQuery, [nombre, email, hash, id], (error) => {
            if (error) {
                return res.status(500).json({
                    error: 'Error al actualizar el usuario',
                });
            }
            res.json({
                mensaje: 'Usuario actualizado correctamente',
            });
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Error al encriptar la contraseña',
        });
    }
});

// Ruta para eliminar un usuario por ID
router.delete('/usuarios/:id', verificarToken, (req, res) => {
    const { id } = req.params;

    conexion.query('DELETE FROM usuario WHERE id = ?', [id], (error) => {
        if (error) {
            return res.status(500).json({
                error: 'Error al eliminar el usuario',
            });
        }
        res.json({
            mensaje: 'Usuario eliminado correctamente',
        });
    });
});

module.exports = router;

