/*
    Rutas de Instituciones / Mensajes
    host + /api/mensajes
*/

const express = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { getMensajesByEstudianteId, crearMensaje, crearMensajeVarios } = require('../controllers/mensajes');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = express.Router();

// Todas tienen que pasar por la validación del JWT
router.use( validarJWT );

// Obtener mensajes por estudiante
router.get( '/estudiante', getMensajesByEstudianteId );

// Crear un nuevo mensaje
router.post (
    '/', 
    [ // middlewares
        check('redactado_por', 'El usuario que redacta es obligatorio').not().isEmpty(),
        check('contenido', 'El contenido es obligatorio').not().isEmpty(),
        check('fecha', 'La fecha es obligatoria').not().isEmpty(),
        check('dni', 'El dni es obligatorio').not().isEmpty(),
        validarCampos
    ], 
    crearMensaje );

// Crear mensaje para varios estudiantes
router.post (
    '/varios', 
    [ // middlewares
        check('redactado_por', 'El usuario que redacta es obligatorio').not().isEmpty(),
        check('contenido', 'El contenido es obligatorio').not().isEmpty(),
        check('fecha', 'La fecha es obligatoria').not().isEmpty(),
        check('estudiantes', 'Los estudiantes son obligatorios').not().isEmpty(),
        validarCampos
    ], 
    crearMensajeVarios );


module.exports = router;