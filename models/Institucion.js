const { Schema, model } = require('mongoose');

const InstitucionSchema = Schema({
    nombre: {
        type: String,
        required: true
    },
    correo_electronico: {
        type: String,
    },
    pais: {
        type: String,
    },
    departamento: {
        type: String,
    },
    region: {
        type: String,
    },
    distrito: {
        type: String,
    },
    direccion: {
        type: String,
    },
    acerca_de: {
        type: String,
    },
    url_logo: {
        type: String,
    },
    hora_limite:{
        type: String,
        required: true
    },
    mensaje_asistencia: {
        type: String,
        required: true
    },
    estado: {
        type: Boolean,
        default: true
    },
    asistencias_general: [{
        fecha: Date,
        hora_llegada: String,
    }],

});

module.exports = model( 'Institucion', InstitucionSchema );