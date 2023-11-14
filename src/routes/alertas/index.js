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

// Rutas para operaciones CRUD en la tabla 'alertas'
router.get('/alertas', handleDBConnection, async (req, res, next) => {
    try {
        const results = await executeQuery(req.dbConnection, 'SELECT * FROM alertas');
        successResponse(res, 'Alertas obtenidas exitosamente', results);
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.get('/alertas/:id', handleDBConnection, async (req, res, next) => {
    const { id } = req.params;
    try {
        const results = await executeQuery(req.dbConnection, 'SELECT * FROM alertas WHERE Id_alertas = ?', [id]);
        if (results.length === 0) {
            errorResponse(res, 404, 'Alerta no encontrada');
        } else {
            successResponse(res, 'Alerta obtenida exitosamente', results[0]);
        }
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.post('/alertas', handleDBConnection, validateData([
    body('usuario_latitud').notEmpty(),
    body('usuario_longuitud').notEmpty(),
    body('sanitaria_latitud').notEmpty(),
    body('saniataria_longuitud').notEmpty(),
    body('aceptada').notEmpty(),
    body('fk_Id_Usuario').notEmpty(),
]), async (req, res, next) => {
    const { usuario_latitud, usuario_longuitud, sanitaria_latitud, saniataria_longuitud, aceptada, fk_Id_Usuario } = req.body;
    try {
        const results = await executeQuery(req.dbConnection, 'INSERT INTO alertas SET ?', {
            usuario_latitud,
            usuario_longuitud,
            sanitaria_latitud,
            saniataria_longuitud,
            aceptada,
            fk_Id_Usuario,
        });
        successResponse(res, 'Alerta creada exitosamente', { id: results.insertId });
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.put('/alertas/:id', handleDBConnection, validateData([
    body('usuario_latitud').notEmpty(),
    body('usuario_longuitud').notEmpty(),
    body('sanitaria_latitud').notEmpty(),
    body('saniataria_longuitud').notEmpty(),
    body('aceptada').notEmpty(),
]), async (req, res, next) => {
    const { id } = req.params;
    const { usuario_latitud, usuario_longuitud, sanitaria_latitud, saniataria_longuitud, aceptada } = req.body;
    try {
        await executeQuery(
            req.dbConnection,
            'UPDATE alertas SET usuario_latitud = ?, usuario_longuitud = ?, sanitaria_latitud = ?, saniataria_longuitud = ?, aceptada = ? WHERE Id_alertas = ?',
            [usuario_latitud, usuario_longuitud, sanitaria_latitud, saniataria_longuitud, aceptada, id]
        );
        successResponse(res, 'Alerta actualizada exitosamente');
    } catch (error) {
        next(error);
    } finally {
        req.dbConnection.release();
    }
});

router.delete('/alertas/:id', handleDBConnection, async (req, res, next) => {
    const { id } = req.params;
    try {
        await executeQuery(req.dbConnection, 'DELETE FROM alertas WHERE Id_alertas = ?', [id]);
        successResponse(res, 'Alerta eliminada exitosamente');
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


