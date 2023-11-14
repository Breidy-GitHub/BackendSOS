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

// Rutas para operaciones CRUD en la tabla 'datos_usuarios'
router.get('/datos_usuarios', handleDBConnection, async (req, res, next) => {
    try {
        const results = await executeQuery(req.dbConnection, 'SELECT * FROM datos_usuarios');
        successResponse(res, 'Datos de usuarios obtenidos exitosamente', results);
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.get('/datos_usuarios/:id', handleDBConnection, async (req, res, next) => {
    const { id } = req.params;
    try {
        const results = await executeQuery(req.dbConnection, 'SELECT * FROM datos_usuarios WHERE Id_datos_usuarios = ?', [id]);
        if (results.length === 0) {
            errorResponse(res, 404, 'Datos de usuario no encontrados');
        } else {
            successResponse(res, 'Datos de usuario obtenidos exitosamente', results[0]);
        }
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.post('/datos_usuarios', handleDBConnection, validateData([
    body('nombre').notEmpty(),
    body('apellidos').notEmpty(),
    body('tipo_identificacion').notEmpty(),
    body('telefono').notEmpty(),
    body('fecha_nacimiento').notEmpty(),
    body('sexo').notEmpty(),
    body('fk_Id_usuario').notEmpty(),
]), async (req, res, next) => {
    const { nombre, apellidos, tipo_identificacion, telefono, fecha_nacimiento, sexo, fk_Id_usuario } = req.body;
    try {
        const results = await executeQuery(req.dbConnection, 'INSERT INTO datos_usuarios SET ?', {
            nombre,
            apellidos,
            tipo_identificacion,
            telefono,
            fecha_nacimiento,
            sexo,
            fk_Id_usuario,
        });
        successResponse(res, 'Datos de usuario creados exitosamente', { id: results.insertId });
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.put('/datos_usuarios/:id', handleDBConnection, validateData([
    body('nombre').notEmpty(),
    body('apellidos').notEmpty(),
    body('tipo_identificacion').notEmpty(),
    body('telefono').notEmpty(),
    body('fecha_nacimiento').notEmpty(),
    body('sexo').notEmpty(),
]), async (req, res, next) => {
    const { id } = req.params;
    const { nombre, apellidos, tipo_identificacion, telefono, fecha_nacimiento, sexo } = req.body;
    try {
        await executeQuery(req.dbConnection, 'UPDATE datos_usuarios SET nombre = ?, apellidos = ?, tipo_identificacion = ?, telefono = ?, fecha_nacimiento = ?, sexo = ? WHERE Id_datos_usuarios = ?', [nombre, apellidos, tipo_identificacion, telefono, fecha_nacimiento, sexo, id]);
        successResponse(res, 'Datos de usuario actualizados exitosamente');
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.delete('/datos_usuarios/:id', handleDBConnection, async (req, res, next) => {
    const { id } = req.params;
    try {
        await executeQuery(req.dbConnection, 'DELETE FROM datos_usuarios WHERE Id_datos_usuarios = ?', [id]);
        successResponse(res, 'Datos de usuario eliminados exitosamente');
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
