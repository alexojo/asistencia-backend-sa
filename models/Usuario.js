const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    dni: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    nombres: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    numero_celular: {
        type: String
    },
    url_foto: {
        type: String
    },
    rol: {
        type: String,
        required: true,
        enum: ['SuperAdmin','Administrador', 'Registrador', 'Docente']
    },
    sexo : {
        type: String
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

    acceso_grados:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Grado'
        }
    ],

});

module.exports = model( 'Usuario', UsuarioSchema );