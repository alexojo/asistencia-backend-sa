/*
    Rutas de Instituciones / Auth
    host + /api/grados
*/

const express = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { getGradosByInstitutionId, getNivelesByInstitutionId, crearGrado, actualizarGrado, eliminarGrado } = require('../controllers/grados');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = express.Router();

// Todas tienen que pasar por la validación del JWT
router.use( validarJWT );

// Obtener grados por institución
router.get( '/institucion', getGradosByInstitutionId );

// Obtener niveles de un grado por institución
router.get( '/niveles', getNivelesByInstitutionId );

router.post(
    '/',
    [ // middlewares
        check('grado', 'El grado es obligatorio').not().isEmpty(),
        check('seccion', 'La sección es obligatoria').not().isEmpty(),
        validarCampos
    ], 
    crearGrado );

router.put(
    '/', 
    [ // middlewares
        check('grado', 'El grado es obligatorio').not().isEmpty(),
        check('seccion', 'La sección es obligatoria').not().isEmpty(),
        validarCampos
    ],
    actualizarGrado );

router.delete('/', eliminarGrado );





module.exports = router;