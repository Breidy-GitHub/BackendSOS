const { Router } = require('express');
const router = Router();
const mysql = require('mysql');
const { body, validationResult } = require('express-validator');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    database: 'sosecurity',
    user: 'root',
    password: '',
});

// Middleware para manejar errores
const handleErrors = (error, req, res, next) => {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });

    // Liberar la conexión al finalizar
    if (req.dbConnection) {
        req.dbConnection.release();
    }
};

// Middleware para manejar la conexión a la base de datos
const handleDBConnection = (req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) {
            return next(err);
        }
        req.dbConnection = connection;
        next();
    });
};

// Middleware para validar datos
const validateData = (validations) => [
    ...validations,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Datos de entrada inválidos', details: errors.array() });
        }
        next();
    },
];

// Mensajes de respuesta
const successResponse = (res, message, data) => {
    res.status(200).json({ success: true, message, data });
};

const errorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({ success: false, error: message });
};

// Rutas para operaciones CRUD en la tabla 'contactos_emergencia'
router.get('/contactos_emergencia', handleDBConnection, async (req, res, next) => {
    try {
        const results = await executeQuery(req.dbConnection, 'SELECT * FROM contactos_emergencia');
        successResponse(res, 'Contactos de emergencia obtenidos exitosamente', results);
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.get('/contactos_emergencia/:id', handleDBConnection, async (req, res, next) => {
    const { id } = req.params;
    try {
        const results = await executeQuery(req.dbConnection, 'SELECT * FROM contactos_emergencia WHERE Id_contactos_emergencia = ?', [id]);
        if (results.length === 0) {
            errorResponse(res, 404, 'Contacto de emergencia no encontrado');
        } else {
            successResponse(res, 'Contacto de emergencia obtenido exitosamente', results[0]);
        }
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.post('/contactos_emergencia', handleDBConnection, validateData([
    body('nombre').notEmpty(),
    body('apellidos').notEmpty(),
    body('parentezco').notEmpty(),
    body('telefono').notEmpty(),
    body('fk_Id_usuario').notEmpty(),
]), async (req, res, next) => {
    const { nombre, apellidos, parentezco, telefono, fk_Id_usuario } = req.body;
    try {
        const results = await executeQuery(req.dbConnection, 'INSERT INTO contactos_emergencia SET ?', {
            nombre,
            apellidos,
            parentezco,
            telefono,
            fk_Id_usuario,
        });
        successResponse(res, 'Contacto de emergencia creado exitosamente', { id: results.insertId });
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.put('/contactos_emergencia/:id', handleDBConnection, validateData([
    body('nombre').notEmpty(),
    body('apellidos').notEmpty(),
    body('parentezco').notEmpty(),
    body('telefono').notEmpty(),
]), async (req, res, next) => {
    const { id } = req.params;
    const { nombre, apellidos, parentezco, telefono } = req.body;
    try {
        await executeQuery(
            req.dbConnection,
            'UPDATE contactos_emergencia SET nombre = ?, apellidos = ?, parentezco = ?, telefono = ? WHERE Id_contactos_emergencia = ?',
            [nombre, apellidos, parentezco, telefono, id]
        );
        successResponse(res, 'Contacto de emergencia actualizado exitosamente');
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.delete('/contactos_emergencia/:id', handleDBConnection, async (req, res, next) => {
    const { id } = req.params;
    try {
        await executeQuery(req.dbConnection, 'DELETE FROM contactos_emergencia WHERE Id_contactos_emergencia = ?', [id]);
        successResponse(res, 'Contacto de emergencia eliminado exitosamente');
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

// Función para ejecutar consultas a la base de datos
const executeQuery = (connection, sql, values = []) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

// Middleware para manejar errores
router.use(handleErrors);

module.exports = router;


