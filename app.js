const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const { dbConnection } = require('./database/config');
const { initCliente } = require('./whatsapp/whatsapp');
const { createSession } = require('./whatsapp/api');
const port = process.env.PORT || 4000;

// Crear el servidor de express
const app = express();


// Base de datos
dbConnection();

// CORS
app.use(cors());


// Directorio público
app.use( express.static('public') );

// Lectura y parseo del body
app.use(express.json({ limit: '50mb' }));


// Rutas
app.use('/api/auth', require('./routes/auth') );
app.use('/api/instituciones', require('./routes/instituciones') );
app.use('/api/grados', require('./routes/grados') );
app.use('/api/estudiantes', require('./routes/estudiantes') );
app.use('/api/mensajes', require('./routes/mensajes') );
app.use('/api/whatsapp', require('./routes/whatsapp') );

// Crear el cliente de whatsapp
/* (async () => { 
    const provider = await createSession();
    app.locals.provider = provider; // Guardar cliente como una variable global
})(); */


// Escuchar peticiones
app.listen( port, () => {
    console.log(`Servidor corriendo en puerto ${ port }`);
});
