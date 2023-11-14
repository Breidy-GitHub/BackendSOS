const router = require('express').Router();
const mysql = require('mysql');

const conexion = mysql.createConnection({
    host: 'localhost',
    database: 'sosecurity',
    user: 'root',
    password: '',
});

// Middleware de manejo de errores
function handleDatabaseError(res, error) {
    console.error('Error de la base de datos:', error);
    res.status(500).json({ error: 'Error de la base de datos' });
}

// POST - Crear preferencia
router.post('/notificacionesPreferencia', (req, res) => {
    const { token, latitud, longitud, radio, fk_Id_Usuario } = req.body;

    // Validaciones
    if (!token || !latitud || !longitud || !radio || !fk_Id_Usuario) {
        return res.status(400).json({
            error: 'Faltan datos requeridos'
        });
    }

    // Insertar nuevo registro
    const insertQuery = 'INSERT INTO notificaciones_preferencia SET ?';
    const preferenciaData = {
        token: token,
        latitud: latitud,
        longitud: longitud,
        radio: radio,
        fk_Id_Usuario: fk_Id_Usuario
    };

    conexion.query(insertQuery, preferenciaData, (error, results) => {
        if (error) {
            return handleDatabaseError(res, error);
        }

        res.status(201).json({
            msg: 'Preferencia creada exitosamente',
            id: results.insertId
        });
    });
});

// GET - Obtener todas las preferencias
router.get('/notificacionesPreferencia', (req, res) => {
    const selectQuery = 'SELECT * FROM notificaciones_preferencia';
    conexion.query(selectQuery, (error, results) => {
        if (error) {
            return handleDatabaseError(res, error);
        }

        res.json(results);
    });
});

// GET - Obtener preferencia por ID
router.get('/notificacionesPreferencia/:id', (req, res) => {
    const { id } = req.params;
    const selectQuery = 'SELECT * FROM notificaciones_preferencia WHERE Id_notificaciones_preferencia = ?';

    conexion.query(selectQuery, [id], (error, results) => {
        if (error) {
            return handleDatabaseError(res, error);
        }

        if (results.length === 0) {
            return res.status(404).json({
                msg: 'Preferencia no encontrada'
            });
        }

        res.json(results[0]);
    });
});

// PUT - Actualizar preferencia
router.put('/notificacionesPreferencia/:id', (req, res) => {
    const { id } = req.params;
    const { token, latitud, longitud, radio } = req.body;

    const updateQuery = 'UPDATE notificaciones_preferencia SET token = ?, latitud = ?, longitud = ?, radio = ? WHERE Id_notificaciones_preferencia = ?';
    conexion.query(updateQuery, [token, latitud, longitud, radio, id], (error) => {
        if (error) {
            return handleDatabaseError(res, error);
        }

        res.json({
            mensaje: 'Preferencia actualizada exitosamente'
        });
    });
});

// DELETE - Eliminar preferencia
router.delete('/notificacionesPreferencia/:id', (req, res) => {
    const { id } = req.params;
    const deleteQuery = 'DELETE FROM notificaciones_preferencia WHERE Id_notificaciones_preferencia = ?';

    conexion.query(deleteQuery, [id], (error) => {
        if (error) {
            return handleDatabaseError(res, error);
        }

        res.json({
            mensaje: 'Preferencia eliminada exitosamente'
        });
    });
});

module.exports = router;

