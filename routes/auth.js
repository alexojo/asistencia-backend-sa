/*
    Rutas de Usuarios / Auth
    host + /api/auth
*/

const express = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { crearUsuario, loginUsuario, actualizarUsuario, eliminarUsuario, revalidarToken, getUsuarios, getUsuarioById, getUsuariosByInstitutionId } = require('../controllers/auth');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = express.Router();


router.post(
    '/new', 
    [ // middlewares
    check('dni', 'El dni es obligatorio').not().isEmpty().isLength({ min: 8 }),
    check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
    check('nombres', 'El nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El apellido es obligatorio').not().isEmpty(),
    check('rol', 'El rol no es válido').isIn(['SuperAdmin','Administrador', 'Registrador', 'Docente']),
    validarCampos
],
crearUsuario );

router.post(
    '/', 
    [ // middlewares
    check('dni', 'El dni es obligatorio').not().isEmpty().isLength({ min: 8 }),
    check('password', 'El password es obligatorio').not().isEmpty(),
    validarCampos
],
loginUsuario );

// Todas tienen que pasar por la validación del JWT //
router.use( validarJWT );

// Actualizar usuario
router.put( 
    '/',
    [ // middlewares
        check('nombres', 'El nombre es obligatorio').not().isEmpty(),
        check('apellidos', 'El apellido es obligatorio').not().isEmpty(),
        check('rol', 'El rol no es válido').isIn(['SuperAdmin','Administrador', 'Registrador', 'Docente']),
    ],
    actualizarUsuario ); 

// Eliminar usuario
router.delete('/', eliminarUsuario );

router.get( '/renew', revalidarToken );

// Obtener usuarios
router.get( '/', getUsuarios );

// Obtener usuario by id
router.get( '/usuario', getUsuarioById );

// Obtener usuarios por institución con parametro institucionId
router.get( '/institution', getUsuariosByInstitutionId );





module.exports = router;