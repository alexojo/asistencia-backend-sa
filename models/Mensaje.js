const { Schema, model } = require('mongoose');

const MensajeSchema = Schema({

    redactado_por: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    contenido: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },

    // Otras Clases

    estudiante: {
        type: Schema.Types.ObjectId,
        ref: 'Estudiante'
    },

});

module.exports = model( 'Mensaje', MensajeSchema );