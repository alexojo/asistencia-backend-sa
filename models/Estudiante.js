const { Schema, model } = require('mongoose');

const EstudianteSchema = Schema({
    dni: {
        type: String,
        required: true,
        unique: true
    },
    nombres: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    fecha_nacimiento: {
        type: String,
    },
    apoderado:{
        type: String,
        default: 'padre',
        enum: ['padre', 'madre', 'apoderado','ninguno'],
    },
    padre: {
        type: String,
    },
    nro_padre: {
        type: String,
    },
    madre: {
        type: String,
    },
    nro_madre: {
        type: String,
    },
    url_foto: {
        type: String
    },
    asistencias: [{
        fecha: Date,
        hora_llegada: String,
        estado: { type: String, enum: ['puntual', 'tarde', 'falta'] },
    }],
    estado_diario: {
        type: String,
        default: 'falta',
        estado: { type: String, enum: ['puntual', 'tarde', 'falta'] },
    },
    sexo : {
        type: String,
        enum: ['Masculino', 'Femenino']
    },
    estado : {
        type: Boolean,
        required: true,
        default: true,
    },
    // Otras Clases
    
    institucion: {
        type: Schema.Types.ObjectId,
        ref: 'Institucion'
    },

    grado: {
        type: Schema.Types.ObjectId,
        ref: 'Grado'
    },

});

module.exports = model( 'Estudiante', EstudianteSchema );