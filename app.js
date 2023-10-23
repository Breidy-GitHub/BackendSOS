const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const validator = require('validator');

const app = express();
const PORT = 3000;

// Configura el middleware cors
const corsOptions = {
    origin: 'https://tudominio.com', // Reemplaza con tu dominio permitido
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json()); // Analiza los cuerpos de las solicitudes JSON

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

// Obtener todos los tipos de usuario
app.get('/tipo_usuario', (req, res) => {
    const query = 'SELECT * FROM tipo_usuario';
    conexion.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener tipos de usuario: ' + error.message);
            res.status(500).send('Error al obtener tipos de usuario');
            return;
        }
        res.json(results);
    });
});

// Obtener datos médicos de un usuario específico por su ID
app.get('/usuario/:id/datos_medicos', (req, res) => {
    const userId = req.params.id;
    if (!validator.isInt(userId)) {
        res.status(400).send('ID de usuario inválido');
        return;
    }

    const query = 'SELECT * FROM datos_medicos WHERE fk_Id_usuario = ?';
    conexion.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error al obtener datos médicos: ' + error.message);
            res.status(500).send('Error al obtener datos médicos');
            return;
        }
        res.json(results);
    });
});

// Actualizar datos médicos de un usuario específico por su ID
app.put('/usuario/:id/datos_medicos', (req, res) => {
    const userId = req.params.id;
    const { grupo_sanguineo, alergias, otros } = req.body;

    if (!validator.isInt(userId) || !validator.isLength(grupo_sanguineo, { min: 1, max: 3 }) ||
        !validator.isLength(alergias, { min: 1, max: 45 }) ||
        !validator.isLength(otros, { min: 1, max: 300 })) {
        res.status(400).send('Datos inválidos');
        return;
    }

    const query = 'UPDATE datos_medicos SET grupo_sanguineo = ?, alergias = ?, otros = ? WHERE fk_Id_usuario = ?';
    conexion.query(query, [grupo_sanguineo, alergias, otros, userId], (error, result) => {
        if (error) {
            console.error('Error al actualizar datos médicos: ' + error.message);
            res.status(500).send('Error al actualizar datos médicos');
            return;
        }
        res.json({ message: 'Datos médicos actualizados correctamente' });
    });
});

// Actualizar contactos de emergencia de un usuario específico por su ID
app.put('/usuario/:id/contactos_emergencia', (req, res) => {
    const userId = req.params.id;
    const { contactos } = req.body;

    if (!validator.isInt(userId) || !Array.isArray(contactos)) {
        res.status(400).send('Datos inválidos');
        return;
    }

    // Iterar sobre los contactos y actualizar cada uno
    contactos.forEach((contacto) => {
        const { id, nombre, apellidos, parentezco, telefono } = contacto;
        if (!validator.isInt(id) || !validator.isLength(nombre, { min: 1, max: 45 }) ||
            !validator.isLength(apellidos, { min: 1, max: 45 }) ||
            !validator.isLength(parentezco, { min: 1, max: 45 }) ||
            !validator.isLength(telefono, { min: 1, max: 45 })) {
            res.status(400).send('Datos de contacto inválidos');
            return;
        }

        // Consulta para actualizar cada contacto por su ID
        const query = 'UPDATE contactos_emergencia SET nombre = ?, apellidos = ?, parentezco = ?, telefono = ? WHERE Id_contactos_emergencia = ? AND fk_Id_usuario = ?';
        conexion.query(query, [nombre, apellidos, parentezco, telefono, id, userId], (error, result) => {
            if (error) {
                console.error('Error al actualizar contactos de emergencia: ' + error.message);
                res.status(500).send('Error al actualizar contactos de emergencia');
                return;
            }
        });
    });

    res.json({ message: 'Contactos de emergencia actualizados correctamente' });
});

// Agregar un nuevo usuario
app.post('/usuarios', (req, res) => {
    const { correo, contraseña, fk_tipo_usuario } = req.body;

    if (!validator.isEmail(correo) || !validator.isInt(fk_tipo_usuario)) {
        res.status(400).send('Datos de usuario inválidos');
        return;
    }

    // Hash de la contraseña antes de almacenarla en la base de datos
    bcrypt.hash(contraseña, 10, (err, hash) => {
        if (err) {
            console.error('Error al hashear la contraseña: ' + err.message);
            res.status(500).send('Error al crear usuario');
            return;
        }

        const query = 'INSERT INTO usuario (correo, contraseña, fk_tipo_usuario) VALUES (?, ?, ?)';
        conexion.query(query, [correo, hash, fk_tipo_usuario], (error, result) => {
            if (error) {
                console.error('Error al agregar usuario: ' + error.message);
                res.status(500).send('Error al agregar usuario');
                return;
            }
            res.json({ message: 'Usuario agregado correctamente' });
        });
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Manejo de señal SIGINT para cerrar la conexión antes de salir
process.on('SIGINT', () => {
    conexion.end();
    console.log('Conexión a la base de datos cerrada');
    process.exit();
});

// Escucha en el puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor backend iniciado en el puerto ${PORT}`);
});


