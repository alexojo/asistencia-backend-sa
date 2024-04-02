const { response } = require('express');
const Institucion = require('../models/Institucion');

const getInstituciones = async(req, res = response) => {

    const instituciones = await Institucion.find()
                                            .populate();

    res.json({
        ok: true,
        instituciones
    });
}

const getInstitucionById = async(req, res = response) => {

    try {
        const { institucionId } = req.query;

        const institucion = await Institucion.findById( institucionId );

        res.json({
            ok: true,
            institucion
        });
    }

    catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const crearInstitucion = async(req, res = response) => {

    const { nombre } = req.body;

    try {

        let institucion = await Institucion.findOne({ nombre: { $regex: nombre, $options: 'i' }});

        if ( institucion ) {
            return res.status(400).json({
                ok: false,
                msg: 'La institución ya existe'
            });
        }

        institucion = new Institucion(req.body);
            
        const institucionDB = await institucion.save();

        res.json({
            ok: true,
            institucion: institucionDB
        });
    
    }
    catch (error) {
        
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const actualizarInstitucion = async(req, res = response) => {

    const institucionId = req.query.id;

    try {

        const institucionDB = await Institucion.findById( institucionId );

        if ( !institucionDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe una institución con ese id'
            });
        }

        const nuevaInstitucion = {
            ...req.body
        }

        const institucionActualizada = await Institucion.findByIdAndUpdate( institucionId, nuevaInstitucion, { new: true } );

        res.json({
            ok: true,
            institucion: institucionActualizada
        });
    }
    catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
    
}



module.exports = {
    getInstituciones,
    getInstitucionById,
    crearInstitucion,
    actualizarInstitucion
}