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

// POST - Crear nuevo tipo
router.post('/tiposUsuario', (req, res) => {
    const { descripcion } = req.body;

    // Validaciones
    if (!descripcion) {
        return res.status(400).json({
            error: 'La descripción es requerida'
        });
    }

    // Insertar nuevo tipo en la BD
    const insertQuery = 'INSERT INTO tipo_usuario SET ?';
    const tipoUsuarioData = {
        descripcion: descripcion
    };

    conexion.query(insertQuery, tipoUsuarioData, (error, results) => {
        if (error) {
            return handleDatabaseError(res, error);
        }

        res.status(201).json({
            msg: 'Tipo de usuario creado exitosamente',
            id: results.insertId
        });
    });
});

// GET - Obtener todos los tipos
router.get('/tiposUsuario', (req, res) => {
    const selectQuery = 'SELECT Id_tipo_usuario, descripcion FROM tipo_usuario';
    conexion.query(selectQuery, (error, results) => {
        if (error) {
            return handleDatabaseError(res, error);
        }

        res.json(results);
    });
});

// GET - Obtener tipo por ID
router.get('/tiposUsuario/:id', (req, res) => {
    const { id } = req.params;
    const selectQuery = 'SELECT Id_tipo_usuario, descripcion FROM tipo_usuario WHERE Id_tipo_usuario = ?';

    conexion.query(selectQuery, [id], (error, results) => {
        if (error) {
            return handleDatabaseError(res, error);
        }

        if (results.length === 0) {
            return res.status(404).json({
                msg: 'Tipo de usuario no encontrado'
            });
        }

        res.json(results[0]);
    });
});

// PUT - Actualizar tipo
router.put('/tiposUsuario/:id', (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;

    const updateQuery = 'UPDATE tipo_usuario SET descripcion = ? WHERE Id_tipo_usuario = ?';
    conexion.query(updateQuery, [descripcion, id], (error) => {
        if (error) {
            return handleDatabaseError(res, error);
        }

        res.json({
            mensaje: 'Tipo de usuario actualizado exitosamente'
        });
    });
});

// DELETE - Eliminar tipo
router.delete('/tiposUsuario/:id', (req, res) => {
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM tipo_usuario WHERE Id_tipo_usuario = ?';
    conexion.query(deleteQuery, [id], (error) => {
        if (error) {
            return handleDatabaseError(res, error);
        }

        res.json({
            mensaje: 'Tipo de usuario eliminado exitosamente'
        });
    });
});

module.exports = router;

