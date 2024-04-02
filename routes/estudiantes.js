/*
    Rutas de Estudiantes
    host + /api/estudiantes
*/

const express = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { getEstudiantesByInstitutionId, getEstudiantesByGradoId, getEstudianteById, crearEstudiante, actualizarEstudiante, eliminarEstudiante, getAsistenciaEstudiante, getAsistenciasEstudiante, getAsistenciaEstudianteMes, getAsistenciaEstudianteRango, registrarAsistencia } = require('../controllers/estudiantes');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = express.Router();

// Todas tienen que pasar por la validación del JWT
router.use( validarJWT );

// Obtener estudiantes por institución
router.get( '/institution', getEstudiantesByInstitutionId );

// Obtener estudiantes por grado de una institución
router.get( '/grado/:gradoId', getEstudiantesByGradoId );

// Obtener estudiante por id
router.get( '/', getEstudianteById );

// Obtener asistencias de un estudiante
router.get( '/asistencias', getAsistenciasEstudiante );

// Obtener asistencia de todos los meses
router.get( '/asistencia/total', getAsistenciaEstudiante );

// Obtener asistencia de un mes
router.get( '/asistencia/mes', getAsistenciaEstudianteMes );

// Obtener asistencia de un rango de fechas
router.get( '/asistencia/rango/:id/:fechaInicio/:fechaFin', getAsistenciaEstudianteRango );

// Registrar asistencia
router.post( 
    '/asistencia', 
    [
        check('dni', 'El estudiante es obligatorio').not().isEmpty(),
        check('fecha', 'La fecha es obligatoria').not().isEmpty(),
        check('hora_llegada', 'La hora de llegada es obligatoria').not().isEmpty(),
        check('estado', 'El estado es obligatorio').not().isEmpty(),
        validarCampos
    ],
    registrarAsistencia );

// Crear un nuevo estudiante
router.post (
    '/', 
    [ // middlewares
        check('dni', 'El dni es obligatorio').not().isEmpty().isLength({ min: 8 }),
        check('nombres', 'El nombre es obligatorio').not().isEmpty(),
        check('apellidos', 'El apellido es obligatorio').not().isEmpty(),
        check('institucion', 'La institución es obligatoria').not().isEmpty(),
        validarCampos
    ], 
    crearEstudiante );


// Actualizar estudiante
router.put(
    '/', 
    [ // middlewares
        check('dni', 'El dni es obligatorio').not().isEmpty().isLength({ min: 8 }),
        check('nombres', 'El nombre es obligatorio').not().isEmpty(),
        check('apellidos', 'El apellido es obligatorio').not().isEmpty(),
        check('institucion', 'La institución es obligatoria').not().isEmpty(),
        validarCampos
    ], 
    actualizarEstudiante );

// Eliminar estudiante
router.delete('/', eliminarEstudiante );

// Actualizar estado de estudiantes
// router.put('/estado', actualizarEstadoEstudiante );





module.exports = router;