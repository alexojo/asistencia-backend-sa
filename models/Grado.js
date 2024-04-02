const { Schema, model } = require('mongoose');

const GradoSchema = Schema({
    grado: {
        type: String,
        required: true
    },
    /* nivel: {
        type: String,
        required: true,
        enum: ['Primaria', 'Secundaria']
    }, */
    seccion: {
        type: String,
        required: true,
        default: 'Unica'
    },

    // Otras Clases

    institucion: {
        type: Schema.Types.ObjectId,
        ref: 'Institucion'
    },

});

module.exports = model( 'Grado', GradoSchema );