const { response } = require('express');
const Mensaje = require('../models/Mensaje');
const Estudiante = require('../models/Estudiante');

// -------------------------------------------------------------------

const getMensajesByEstudianteId = async (req, res = response) => {
    try {
        const { estudianteId } = req.query;

        // Obtener mensajes ordenados por fecha (más reciente primero)
        const mensajes = await Mensaje.find({ estudiante: estudianteId })
            .populate('estudiante', 'nombres apellidos dni')
            .populate('redactado_por', 'nombres apellidos dni url_foto')
            .sort({ fecha: -1 }); // Ordenar por fecha DESCENDENTE

        res.json({
            ok: true,
            mensajes
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
};


// Crear un nuevo mensaje
const crearMensaje = async (req, res = response) => {
    const { redactado_por, contenido, fecha, dni } = req.body;

    try {
        // Buscar al estudiante por DNI
        const estudiante = await Estudiante.findOne({ dni });

        if (!estudiante) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un estudiante con ese DNI'
            });
        }

        // Verificar si tiene apoderado válido
        if (!['padre', 'madre', 'apoderado'].includes(estudiante.apoderado)) {
            return res.status(400).json({
                ok: false,
                msg: 'El estudiante no tiene un apoderado válido para recibir mensajes'
            });
        }

        // Intentar enviar el mensaje por WhatsApp antes de guardarlo en la BD
        const enviado = await enviarMensaje(req, estudiante, contenido);

        if (!enviado) {
            return res.status(500).json({
                ok: false,
                msg: 'El mensaje no se pudo enviar por WhatsApp'
            });
        }

        // Solo se guarda si el mensaje fue enviado correctamente
        const nuevoMensaje = new Mensaje({ redactado_por, contenido, fecha, estudiante });
        const mensajeDB = await nuevoMensaje.save();

        return res.json({
            ok: true,
            mensaje: mensajeDB
        });

    } catch (error) {
        console.error("Error en crearMensaje:", error);
        return res.status(500).json({
            ok: false,
            msg: 'Error interno, por favor hable con el administrador'
        });
    }
};

// Crear mensaje para varios estudiantes
const crearMensajeVarios = async (req, res = response) => {

    const { redactado_por, contenido, fecha, estudiantes } = req.body;

    try {

        // recorrer el array de estudiantes
        estudiantes.forEach(async (estudiante) => {

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
const enviarMensaje = async (req, estudiante, contenido) => {

    const cliente = req.app.locals.cliente;

    try {

        if (estudiante.apoderado !== "ninguno") {

            const numero = estudiante.apoderado === 'padre' || estudiante.apoderado === 'apoderado' ? estudiante.nro_padre : estudiante.nro_madre;

            const numero_whatsapp = `51${numero}@c.us`;

            await cliente.sendText(numero_whatsapp, contenido);
            console.log(`Mensaje enviado a ${numero_whatsapp}`);

            return true;

        }

    }
    catch (error) {
        console.error("Error enviando mensaje de WhatsApp:", error);
        return false;
    }

}

module.exports = {
    getMensajesByEstudianteId,
    crearMensaje,
    crearMensajeVarios
}