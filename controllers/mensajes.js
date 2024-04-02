const { response } = require('express');
const Mensaje = require('../models/Mensaje');

const getMensajesByEstudianteId = async(req, res = response) => {

    try{
            
        const { estudianteId } = req.query;

        // obtener mensaje por estudiante, con populate estudiante y datos del usuario que redacta
        const mensajes = await Mensaje.find({ estudiante: estudianteId })
                                    .populate('estudiante', 'nombres apellidos dni')
                                    .populate('redactado_por', 'nombres apellidos dni url_foto');

        res.json({
            ok: true,
            mensajes
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

// Crear un nuevo mensaje
const crearMensaje = async(req, res = response) => {

    const { redactado_por, contenido, fecha, estudiante } = req.body;

    try {

        const nuevoMensaje = new Mensaje(req.body);
            
        const mensajeDB = await nuevoMensaje.save();

        // Enviar mensaje por whatsapp
        enviarMensaje(req, estudiante, contenido);

        res.json({
            ok: true,
            mensaje: mensajeDB
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

// Crear mensaje para varios estudiantes
const crearMensajeVarios = async(req, res = response) => {

    const { redactado_por, contenido, fecha, estudiantes } = req.body;

    try {

        // recorrer el array de estudiantes
        estudiantes.forEach(async(estudiante) => {

            const nuevoMensaje = new Mensaje({
                redactado_por,
                contenido,
                fecha,
                estudiante
            });
                
            await nuevoMensaje.save();

            enviarMensaje(req, estudiante, contenido);

        });

        res.json({
            ok: true,
            msg: 'Mensajes enviados',
            redactado_por,
            contenido,
            fecha,
            estudiantes
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

// Enviar mensaje por whatsapp
const enviarMensaje = async(req, estudiante, mensaje) => {
    
    const cliente = req.app.locals.cliente;
    
        try {
    
            if( estudiante.apoderado !== "ninguno"){

                const numero = estudiante.apoderado === 'padre' || estudiante.apoderado === 'apoderado' ? estudiante.nro_padre : estudiante.nro_madre;
    
                const numero_whatsapp = `51${numero}@c.us`
        
                cliente.sendMessage( numero_whatsapp, mensaje );
    
            }
        
        }
        catch (error) {
            console.log(error)
        }
    
    }

module.exports = {
    getMensajesByEstudianteId,
    crearMensaje,
    crearMensajeVarios
}