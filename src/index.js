const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const usuario = require('./routes/usuario');
const notificacion = require('./routes/notificaciones');
const historial = require('./routes/historial');
const datosUsuario = require('./routes/datosUsuarios');
const datosMedicos = require('./routes/datosMedicos');
const contactoEmergencia = require('./routes/contactosEmergencia');
const alertas = require('./routes/alertas');
const alergias = require('./routes/alergias');
const app = express();

//Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('json spaces', 2)

// Configuración del middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/', usuario);
app.use('/', notificacion);
app.use('/', historial);
app.use('/', datosUsuario);
app.use('/', datosMedicos);
app.use('/', contactoEmergencia);
app.use('/', alertas);
app.use('/', alergias);



// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar el servidor
app.listen(app.get('port'),()=>{
    console.log(`Server listening on port ${app.get('port')}`);
});


