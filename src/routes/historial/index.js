// rutas/historial.js
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
    // Cerrar la conexión al finalizar
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
const validateData = (validations) => {
    return [
        ...validations,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Datos de entrada inválidos', details: errors.array() });
            }
            next();
        },
    ];
};

// Mensajes de respuesta
const successResponse = (res, message, data) => {
    res.status(200).json({ success: true, message, data });
};

const errorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({ success: false, error: message });
};

// Ruta para obtener todos los registros de historial
router.get('/historial', handleDBConnection, async (req, res, next) => {
    try {
        const results = await executeQuery(req.dbConnection, 'SELECT * FROM historial');
        successResponse(res, 'Historial obtenido exitosamente', results);
    } catch (error) {
        next(error);
    } finally {
        // Liberar la conexión al finalizar
        req.dbConnection.release();
    }
});

// Ruta para obtener un registro de historial por ID
router.get('/historial/:id', handleDBConnection, async (req, res, next) => {
    const { id } = req.params;
    try {
        const results = await executeQuery(req.dbConnection, 'SELECT * FROM historial WHERE Id_historial = ?', [id]);
        if (results.length === 0) {
            errorResponse(res, 404, 'Historial no encontrado');
        } else {
            successResponse(res, 'Historial obtenido exitosamente', results[0]);
        }
    } catch (error) {
        next(error);
    } finally {
        // Liberar la conexión al finalizar
        req.dbConnection.release();
    }
});

// Ruta para crear un nuevo registro en historial
router.post(
    '/historial',
    handleDBConnection,
    validateData([
        body('ingreso').notEmpty(),
        body('recu_contraseña').notEmpty(),
        body('recu_correo').notEmpty(),
        body('fk_Id_usuario').notEmpty(),
    ]),
    async (req, res, next) => {
        const { ingreso, recu_contraseña, recu_correo, fk_Id_usuario } = req.body;
        try {
            const results = await executeQuery(req.dbConnection, 'INSERT INTO historial SET ?', { ingreso, recu_contraseña, recu_correo, fk_Id_usuario });
            successResponse(res, 'Historial creado exitosamente', { id: results.insertId });
        } catch (error) {
            next(error);
        } finally {
            // Liberar la conexión al finalizar
            req.dbConnection.release();
        }
    }
);

// Ruta para actualizar un registro en historial
router.put(
    '/historial/:id',
    handleDBConnection,
    validateData([
        body('ingreso').notEmpty(),
        body('recu_contraseña').notEmpty(),
        body('recu_correo').notEmpty(),
    ]),
    async (req, res, next) => {
        const { id } = req.params;
        const { ingreso, recu_contraseña, recu_correo } = req.body;
        try {
            await executeQuery(req.dbConnection, 'UPDATE historial SET ingreso = ?, recu_contraseña = ?, recu_correo = ? WHERE Id_historial = ?', [ingreso, recu_contraseña, recu_correo, id]);
            successResponse(res, 'Historial actualizado exitosamente');
        } catch (error) {
            next(error);
        } finally {
            // Liberar la conexión al finalizar
            req.dbConnection.release();
        }
    }
);

// Ruta para eliminar un registro en historial
router.delete('/historial/:id', handleDBConnection, async (req, res, next) => {
    const { id } = req.params;
    try {
        await executeQuery(req.dbConnection, 'DELETE FROM historial WHERE Id_historial = ?', [id]);
        successResponse(res, 'Historial eliminado exitosamente');
    } catch (error) {
        next(error);
    } finally {
        // Liberar la conexión al finalizar
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


