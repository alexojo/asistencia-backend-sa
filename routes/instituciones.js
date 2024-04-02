/*
    Rutas de Instituciones / Auth
    host + /api/instituciones
*/

const express = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { getInstituciones, getInstitucionById, crearInstitucion, actualizarInstitucion } = require('../controllers/instituciones');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = express.Router();

// Todas tienen que pasar por la validación del JWT
router.use( validarJWT );

router.get('/', getInstituciones);

router.get('/institucion', getInstitucionById);

router.post(
    '/',
    [ // middlewares
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('hora_limite', 'La hora límite es obligatoria').not().isEmpty(),
        validarCampos
    ], 
    crearInstitucion );

router.put(
    '/', 
    [ // middlewares
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('hora_limite', 'La hora límite es obligatoria').not().isEmpty(),
        validarCampos
    ],
    actualizarInstitucion );

// router.delete('/:id', borrarInstitucion );





module.exports = router;