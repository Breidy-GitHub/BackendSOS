const { Router } = require('express');
const router = Router();
const mysql = require('mysql');
const { promisify } = require('util');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    database: 'sosecurity',
    user: 'root',
    password: '',
});

const query = promisify(pool.query).bind(pool);

// Middleware para manejar errores
const handleErrors = (res, error, customMessage) => {
    console.error('Error:', error.message);
    const errorMessage = customMessage || 'Error interno del servidor';
    res.status(500).json({ error: errorMessage });
};

// Ruta para obtener todos los tipos de notificaciones de contactos_emergencia
router.get('/alergiasAll', async (req, res) => {
    try {
        const alergias = await query('SELECT * FROM alergias');
        res.json({ alergias });
    } catch (error) {
        handleErrors(res, error, 'Error al obtener alergias');
    }
});

// Ruta para obtener una alergia por ID
router.get('/alergias/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const alergia = await query('SELECT * FROM alergias WHERE id = ?', [id]);
        if (alergia.length === 0) {
            res.status(404).json({ msg: 'Alergia no encontrada' });
        } else {
            res.json({ alergia: alergia[0] });
        }
    } catch (error) {
        handleErrors(res, error, 'Error al obtener alergia');
    }
});

// Ruta para crear una nueva alergia
router.post('/alergias', async (req, res) => {
    const { nombre, descripcion } = req.body;
    try {
        const result = await query('INSERT INTO alergias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
        res.status(201).json({ msg: 'Alergia creada exitosamente', id: result.insertId });
    } catch (error) {
        handleErrors(res, error, 'Error al crear alergia');
    }
});

// Ruta para actualizar una alergia
router.put('/alergias/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
        await query('UPDATE alergias SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion, id]);
        res.json({ msg: 'Alergia actualizada exitosamente' });
    } catch (error) {
        handleErrors(res, error, 'Error al actualizar alergia');
    }
});

// Ruta para eliminar una alergia
router.delete('/alergias/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM alergias WHERE id = ?', [id]);
        res.json({ msg: 'Alergia eliminada exitosamente' });
    } catch (error) {
        handleErrors(res, error, 'Error al eliminar alergia');
    }
});

module.exports = router;
