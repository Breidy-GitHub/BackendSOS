const { Router } = require('express');
const router = Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    database: 'sosecurity',
    user: 'root',
    password: ''
});

// Ruta principal
router.get('/', (req, res) => {
    res.json({ message: 'Conexion a BD correctamente!' });
});

// Ruta para registrar usuarios
router.post('/usuarios', [
    body('correo').isEmail(),
    body('contraseña').isLength({ min: 6 }),
    body('fk_tipo_usuario').isInt()
], async (req, res) => {
    // Validación de datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Obtener datos del cuerpo de la solicitud
    const { correo, contraseña, fk_tipo_usuario } = req.body;

    try {
        // Hashear la contraseña antes de almacenarla en la base de datos
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Almacena el usuario en la base de datos junto con la contraseña hasheada
        const query = 'INSERT INTO usuarios (correo, contraseña, fk_tipo_usuario) VALUES (?, ?, ?)';
        pool.query(query, [correo, hashedPassword, fk_tipo_usuario], (error, result) => {
            if (error) {
                console.error('Error al agregar usuario: ' + error.message);
                res.status(500).json({ error: 'Error al agregar usuario' });
                return;
            }
            const token = jwt.sign({ correo, fk_tipo_usuario }, 'secreto'); // Firma el token JWT
            res.json({ message: 'Usuario registrado correctamente', token });
        });
    } catch (error) {
        console.error('Error al hashear la contraseña: ' + error.message);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Ruta para iniciar sesión de usuarios
router.post('/login', [
    body('correo').isEmail(),
    body('contraseña').isLength({ min: 6 })
], async (req, res) => {
    // Validación de datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Obtener datos del cuerpo de la solicitud
    const { correo, contraseña } = req.body;

    try {
        // Obtener el usuario de la base de datos por correo electrónico
        const query = 'SELECT * FROM usuarios WHERE correo = ?';
        pool.query(query, [correo], async (error, results) => {
            if (error) {
                console.error('Error al buscar usuario: ' + error.message);
                res.status(500).json({ error: 'Error al buscar usuario' });
                return;
            }

            if (results.length === 0) {
                res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos' });
                return;
            }

            const usuario = results[0];

            // Verificar la contraseña utilizando bcrypt
            const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

            if (!contraseñaValida) {
                res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos' });
                return;
            }

            // En este punto, el inicio de sesión fue exitoso
            const token = jwt.sign({ correo: usuario.correo, fk_tipo_usuario: usuario.fk_tipo_usuario }, 'secreto');
            res.json({ message: 'Inicio de sesión exitoso', token, usuario });
        });
    } catch (error) {
        console.error('Error al iniciar sesión: ' + error.message);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

module.exports = router;

