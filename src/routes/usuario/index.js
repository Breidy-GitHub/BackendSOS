const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const conexion = mysql.createConnection({
  host: 'localhost',
  database: 'sosecurity',
  user: 'root',
  password: ''
});

// Conexión a la BD
conexion.connect(error => {
  if (error) {
    console.error('Error conectando a la BD: ' + error.stack);
    return;
  }
  console.log('Conectado a la BD con id ' + conexion.threadId); 
});

// CREATE - Agregar un nuevo usuario
router.post('/user', [
  body('email').isEmail(),
  body('password').isLength({min: 5})
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const {email, password} = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  conexion.query('INSERT INTO usuario (correo, contraseña) VALUES (?,?)', 
    [email, hashedPassword], 
    (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.status(201).send({msg: 'Usuario creado'});  
      }
  });

});

// READ - Obtener un usuario
router.get('/user/:id', (req, res) => {
  
  conexion.query('SELECT * FROM usuario WHERE Id_usuario = ?', [req.params.id],
    (error, results) => {
      if (error) {
        res.status(500).send(error);  
      } else {
        res.send(results);
      }
    }
  );

});

// UPDATE - Actualizar un usuario
router.patch('/user/:id', (req, res) => {

  conexion.query('UPDATE usuario SET ? WHERE Id_usuario = ?',
    [req.body, req.params.id],
    (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.send({msg: 'Usuario actualizado'});
      }
    }
  );
});

// DELETE - Eliminar un usuario  
router.delete('/user/:id', (req, res) => {

  conexion.query('DELETE FROM usuario WHERE Id_usuario = ?', [req.params.id],
    (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.send({msg: 'Usuario eliminado'});
      }
    }
  );

});

module.exports = router;
