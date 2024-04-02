const { response } = require('express');
const Grado = require('../models/Grado');

const getGradosByInstitutionId = async(req, res = response) => {

    try{

        const { institucionId } = req.query;

        // obtener grado por institucion
        const gradosBD = await Grado.find({ institucion: institucionId }).
                                                            populate('institucion', 'nombre');

        // extraer grado y _id de grados, guardar en nueva variable sin duplicados
        let grados = gradosBD.map( grado => ( grado.grado ) );

        // eliminar duplicados del array grados
        grados = grados.filter((valor, indiceActual, arreglo) => arreglo.indexOf(valor) === indiceActual);

        // ordenar por grado de forma descendente (1-6) y si incluye primaria que sea la primera
        grados.sort((a, b) => {
            if (a.includes('primaria')) {
                return -1;
            }
            if (b.includes('primaria')) {
                return 1;
            }
            if (a > b) {
                return 1;
            }
            if (a < b) {
                return -1;
            }
            return 0;
        });

        // convertir grados a objeto { value: "0", label: grado }
        // const gradosOptions = grados.map((grado, index) => ({ value: index.toString(), label: grado }));

        let seccionesOptions = [];

        // recorrer grados
        for (let i = 0; i < grados.length; i++) {
            
            // obtener secciones por grado
            const secciones = gradosBD.filter( grado => grado.grado === grados[i] );

            // filtrar variales seccion e grado._id
            let secciones1 = secciones.map( seccion => ( { label: seccion.seccion, value: seccion._id } ) );

            // ordenar por seccion de forma ascendente (A-Z) y si es unica que sea la primera
            secciones1.sort((a, b) => {
                if (a.label === 'Unica') {
                    return -1;
                }
                if (b.label === 'Unica') {
                    return 1;
                }
                if (a.label > b.label) {
                    return 1;
                }
                if (a.label < b.label) {
                    return -1;
                }
                return 0;
            });

            seccionesOptions.push( { grado: grados[i], secciones: secciones1 } );
        }


        res.json({
            ok: true,
            institucionId,
            gradosBD,
            grados,
            secciones : seccionesOptions
        });

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
}

// recuperar niveles de un mismo grado de una institucion
const getNivelesByInstitutionId = async(req, res = response) => {

    try{

        const { institucionId, grado } = req.query;

        // obtener grado por institucion Y solo retornar atributo seccion y institucion _id
        const grados = await Grado.find({ institucion: institucionId, grado: grado }).
                                                            select('seccion institucion._id');

        // ordenar por seccion de forma ascendente (A-Z) y si es unica que sea la primera
        grados.sort((a, b) => {
            if (a.seccion === 'Unica') {
                return -1;
            }
            if (b.seccion === 'Unica') {
                return 1;
            }
            if (a.seccion > b.seccion) {
                return 1;
            }
            if (a.seccion < b.seccion) {
                return -1;
            }
            return 0;
        });


        res.json({
            ok: true,
            grados
        });

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
}



const crearGrado = async(req, res = response) => {

    const { grado, seccion, institucion } = req.body;

    

    try {
        const existeGrado = await Grado.findOne({ grado, seccion, institucion });

        if ( existeGrado ) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe un grado con el mismo nombre, nivel y sección en la misma institución.'
            });
        }

        const nuevoGrado = new Grado(req.body);
            
        const gradoDB = await nuevoGrado.save();

        res.json({
            ok: true,
            grado: gradoDB
        });
    
    }
    catch (error) {
        
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const actualizarGrado = async(req, res = response) => {

    const gradoId = req.query.id;

    try {

        const gradoDB = await Grado.findById( gradoId );

        if ( !gradoDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un grado con ese id'
            });
        }

        const nuevoGrado = {
            ...req.body
        }

        const gradoActualizado = await Grado.findByIdAndUpdate( gradoId, nuevoGrado, { new: true } );

        res.json({
            ok: true,
            grado: gradoActualizado
        });
    }
    catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
    
}

const eliminarGrado = async(req, res = response) => {
    
        const gradoId = req.query.id;
    
        try {
    
            const gradoDB = await Grado.findById( gradoId );

            if ( !gradoDB ) {
                return res.status(404).json({
                    ok: false,
                    msg: 'No existe un grado con ese id'
                });
            }

            await Grado.findByIdAndDelete( gradoId );

            res.json({
                ok: true,
                msg: 'Grado eliminado'
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
    getGradosByInstitutionId,
    getNivelesByInstitutionId,
    crearGrado,
    actualizarGrado,
    eliminarGrado
}