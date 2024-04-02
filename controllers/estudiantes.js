const { response } = require('express');
const cron = require('cron');
const Estudiante = require('../models/Estudiante');
const axios = require('axios');

// Obtener estudiantes por institución
const getEstudiantesByInstitutionId = async(req, res = response) => {

    try{

        const { institucionId } = req.query;

        // obtener estudiantes por institucion y populate los datos de grado e institucion
        const estudiantes = await Estudiante.find({ institucion: institucionId })
                                            .populate('grado', 'grado nivel seccion')
                                            .populate('institucion', 'nombre');

        res.json({
            ok: true,
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

// Obtener estudiantes por grado de una institución
const getEstudiantesByGradoId = async(req, res = response) => {

    try{
        const { gradoId } = req.params;

        // obtener estudiantes por grado de una institucion
        const estudiantes = await Estudiante.find({ grado: gradoId });

        res.json({
            ok: true,
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

// Obtener estudiante por id
const getEstudianteById = async(req, res = response) => {
    
    try{
        const { id } = req.query;

        // obtener estudiante por id
        const estudiante = await Estudiante.findById( id )
                                            .populate('grado', 'grado nivel seccion')
                                            .populate('institucion', 'nombre');;

        if ( !estudiante ) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un estudiante con ese id'
            });
        }

        // Modificar el atributo estado del estudiante y retornar como valores booleanos (true o false)
        estudiante.estado = Boolean((estudiante.estado === 'Activo') ? true : false);


        res.json({
            ok: true,
            estudiante
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

// Obtener el estado de las asistencias ( 'puntual', 'tarde', 'falta' ) desde el mes de marzo hasta diciembre
const getAsistenciaEstudiante = async(req, res = response) => {
        
    try{
        const { id } = req.query;

        // obtener asistencias del modelo estudiante
        const estudiantes = await Estudiante.findById( id );

        // obtener asistencias del estudiante
        const asistencias = estudiantes.asistencias;

        // Crear un objeto para almacenar las estadísticas de asistencias por mes
        const estadisticasPorMes = {
            puntual: [],
            tarde: [],
            falta: []
        };

        // Iterar sobre los meses y contar las asistencias por tipo
        for (let mes = 3; mes <= 12; mes++) {

            // Obtener las asistencias del estudiante para el mes actual en Perú (meses de marzo a diciembre)
            const asistenciasMes = asistencias.filter(asistencia => asistencia.fecha.getUTCMonth() + 1 === mes);

            // Inicializar el contador de asistencias por tipo para el mes actual
            const estadisticasMes = { puntual: 0, tarde: 0, falta: 0 };

            // Contar las asistencias por tipo
            asistenciasMes.forEach(asistencia => {
                estadisticasMes[asistencia.estado]++;
            });

            // Agregar las estadísticas del mes a la variable estadisticasPorMes
            estadisticasPorMes.puntual.push(estadisticasMes.puntual);
            estadisticasPorMes.tarde.push(estadisticasMes.tarde);
            estadisticasPorMes.falta.push(estadisticasMes.falta);
        }

        // Enviar las estadísticas de asistencias por mes como respuesta
        res.json({ 
            ok:true,
            estadisticasPorMes 
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

// Obtener asistencias de un estudiante
const getAsistenciasEstudiante = async(req, res = response) => {
        
    try{
        const { id } = req.query;

        // obtener asistencias del modelo estudiante
        const { asistencias } = await Estudiante.findById( id );

        res.json({
            ok: true,
            asistencias
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

// Obtener asistencia de un mes
const getAsistenciaEstudianteMes =  async(req, res = response) => {
            
        try{
            const { id, mes } = req.query;
    
            // obtener asistencia de estudiante
            const { asistencias } = await Estudiante.findById( id );

            // filtrar asistencias por mes
            let asistenciasMes = asistencias.filter(asistencia => asistencia.fecha.getUTCMonth() + 1 === parseInt(mes));

    
            // ordenar las asistencias por fecha
            asistenciasMes.sort((a, b) => a.fecha - b.fecha);

            res.json({
                ok: true,
                asistenciasMes
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

// Obtener asistencia de un rango de fechas
const getAsistenciaEstudianteRango = async(req, res = response) => {
                
    try{
        const { id, fechaInicio, fechaFin } = req.params;

        // obtener asistencia de un rango de fechas de estudiante
        const { asistencias } = await Estudiante.findById( id );

        // filtrar asistencias por rango de fechas
        const asistenciasFiltradas = asistencias.filter(asistencia => asistencia.fecha >= new Date(fechaInicio) && asistencia.fecha <= new Date(fechaFin));

        // ordenar las asistencias por fecha
        asistenciasFiltradas.sort((a, b) => a.fecha - b.fecha);

        res.json({
            ok: true,
            asistenciasFiltradas
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

// Crear un nuevo estudiante
const crearEstudiante = async(req, res = response) => {

    const { dni, foto64 } = req.body;

    try {

        let estudiante = await Estudiante.findOne( { dni } );

        if (estudiante) {
            return res.status(400).json({
                ok: false,
                msg: 'Un estudiante existe con este dni'
            });
        }

        estudiante = new Estudiante( req.body );

        // subir imagen a IMGBB
        const blob = new Blob([Buffer.from(foto64.replace(/^data:image\/\w+;base64,/, ''), 'base64')], { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('image', blob, 'imagen.jpg');

        const response = await axios.post( `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, formData );

        // cambiar url_foto por la url de la imagen subida
        estudiante.url_foto = response.data.data.url ? response.data.data.url : '';
        delete estudiante.foto64;

        const estudianteBD = await estudiante.save();

        res.status(201).json({
            ok: true,
            estudiante: estudianteBD
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

// Actualizar estudiante
const actualizarEstudiante = async(req, res = response) => {

    const estudianteId = req.query.id;
    const { foto64 } = req.body;

    try {

        const estudianteDB = await Estudiante.findById( estudianteId );

        if ( !estudianteDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un estudiante con ese id'
            });
        }

        const nuevoEstudiante = {
            ...req.body
        }

        if ( foto64 ) {
            // subir imagen a IMGBB
            const blob = new Blob([Buffer.from(foto64.replace(/^data:image\/\w+;base64,/, ''), 'base64')], { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('image', blob, 'imagen.jpg');

            const response = await axios.post( `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, formData );

            // cambiar url_foto por la url de la imagen subida
            nuevoEstudiante.url_foto = response.data.data.url ? response.data.data.url : '';
        }
        else {
            // eliminar foto de IMG BB
            if ( estudianteDB.url_foto ) {
                console.log(estudianteDB.url_foto)
                const url = estudianteDB.url_foto.split('/');
                console.log(url)
                console.log(url[url.length - 2])
                const deleteUrl = `https://api.imgbb.com/1/image/${url[url.length - 2]}?key=${process.env.IMGBB_API_KEY}`;
                // await axios.delete( deleteUrl );
            }
        }
        
        delete nuevoEstudiante.foto64;

        const estudianteActualizado = await Estudiante.findByIdAndUpdate( estudianteId, nuevoEstudiante, { new: true } );

        res.json({
            ok: true,
            estudiante: estudianteActualizado
        });

    }
    catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe un estudiante con este dni'
            });
        }

        return res.status(500).json({
            ok: false,
            msg: error
        });
    }
}

// Eliminar estudiante
const eliminarEstudiante = async(req, res = response) => {
    
        const estudianteId = req.query.id;
    
        try {
    
            const estudianteDB = await Estudiante.findById( estudianteId );

            if ( !estudianteDB ) {
                return res.status(404).json({
                    ok: false,
                    msg: 'No existe un estudiante con ese id'
                });
            }

            await Estudiante.findByIdAndDelete( estudianteId );

            res.json({
                ok: true,
                msg: 'Estudiante eliminado'
            });

        }
        catch (error) {
            res.status(500).json({
                ok: false,
                msg: 'Hable con el administrador'
            });
        }

}

// Registrar asistencia de un estudiante
const registrarAsistencia = async(req, res = response) => {
    
    const { dni, hora_llegada, estado } = req.body;

    const fecha = new Date(req.body.fecha);

    try {

        // recuperar estudiante por dni
        const estudiante = await Estudiante.findOne({ dni });

        if (!estudiante) {
            return res.json({
                ok: false,
                msg: 'No existe un estudiante con ese dni'
            });
        }

        //validar que el estudiante no haya registrado asistencia el dia de hoy
        const asistenciaExistente = estudiante.asistencias.find(asistencia => asistencia.fecha.getDate() === fecha.getDate());

        if (asistenciaExistente) {
            return res.json({
                ok: false,
                msg: 'Ya registro asistencia el día de hoy',
                estudiante: estudiante.nombres
            });
        }

        // Formatear body a asistencia
        const nuevaAsistencia = {
            fecha,
            hora_llegada,
            estado
        }

        // ingresar asistencia al inicio del arreglo de asistencias del modelo estudiante
        estudiante.asistencias.unshift(nuevaAsistencia);

        // Actualizar estado_diario del estudiante
        estudiante.estado_diario = estado;

        // guardar el estudiante con la nueva asistencia
        await estudiante.save();

        enviarMensajeAsistencia(req, estudiante, nuevaAsistencia);

        res.json({
            ok: true,
            msg: 'Asistencia registrada exitosamente',
            estudiante: estudiante.nombres
        });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            error,
            msg: 'Hable con el administrador'
        });
    }
}

// Enviar mensaje por la API de WhatsApp con la asistencia del estudiante
const enviarMensajeAsistencia = async(req, estudiante, asistencia) => {

    const provider = req.app.locals.provider;

    try {

        if( estudiante.apoderado !== "ninguno"){

            const numero = estudiante.apoderado === 'padre' || estudiante.apoderado === 'apoderado' ? estudiante.nro_padre : estudiante.nro_madre;

            const numero_whatsapp = `51${numero}@c.us`

            const mensaje = `Estimado(a) apoderado(a), su hijo(a) *${estudiante.nombres} ${estudiante.apellidos}* ha registrado asistencia el día *${asistencia.fecha.getDate()}/${asistencia.fecha.getMonth() + 1}/${asistencia.fecha.getFullYear()}* a las *${asistencia.hora_llegada}* con el estado *${asistencia.estado}*.`;

            provider.sendText( numero_whatsapp, mensaje );

        }

    }
    catch (error) {
        console.error('Error al enviar mensaje', error);
    }
}

// Enviar mensaje por la API de WhatsApp


// Actualizar estado de todos los estudiantes a falta y verificar si faltaron el dia anterior
const actualizarEstadoEstudiante = async(req, res = response) => {
        
    try {

        // Obtener la fecha del día anterior
        const fechaDiaAnterior = new Date();
        fechaDiaAnterior.setDate(fechaDiaAnterior.getDate() - 1);

        // Validar que sea entre marzo y diciembre
        if (fechaDiaAnterior.getMonth() > 2 ) {

            // Obtener todas las instituciones
            const instituciones = await Institucion.find();
        
            // Iterar sobre cada institución
            for (const institucion of instituciones) {

                // Validar que la institucion haya registrado asistencias el día anterior
                const asistenciaDiaAnterior = institucion.asistencias_general.find(asistencia => asistencia.fecha.getDate() === fechaDiaAnterior.getDate());

                // Obtener todos los estudiantes de la institución
                const estudiantes = await Estudiante.find({ institucion: institucion._id });

                if (!asistenciaDiaAnterior) {

                    // Cambiar estado_diario de todos los estudiantes a falta
                    for (const estudiante of estudiantes) {
                        estudiante.estado_diario = 'falta';
                        await estudiante.save();
                    }

                    console.log(`La institución ${institucion.nombre} no ha registrado asistencias el día anterior.`);
                    continue;
                }

                else {

                    // Iterar sobre cada estudiante
                    for (const estudiante of estudiantes) {

                        // Obtener el primer elemento del arreglo de asistencias del estudiante
                        const asistencia = estudiante.asistencias[0];

                        // Si la fecha de la asistencia es igual a la fecha del día anterior, actualizar el estado_diario del estudiante
                        if (asistencia.fecha.getDate() === fechaDiaAnterior.getDate()) {
                            estudiante.estado_diario = 'falta';
                            await estudiante.save();
                        }
                        else{ // Si no hay asistencia del día anterior, añadir asistencia con estado 'falta'
                            const nuevaAsistencia = {
                                fecha: fechaDiaAnterior,
                                hora_llegada: '00:00:00 AM',
                                estado: 'falta'
                            }
                            estudiante.asistencias.unshift(nuevaAsistencia);
                            estudiante.estado_diario = 'falta';
                            await estudiante.save();
                        }
                    }

                    console.log(`Se ha actualizado el estado de los estudiantes de la institución ${institucion.nombre}.`);

                }
            }
            
        }
        else {
            console.log('No se puede actualizar el estado de los estudiantes en enero o febrero.');
        }

    }
    catch (error) {
        console.error(error.message);
    }

}

// Obtener promedio de asistencias por dia del dia anterior de todos los estudiantes de cada institucion
const obtenerPromedioAsistenciasPorDia = async (req, res) => {

    try {
      // Obtener la fecha del día anterior
      const fechaDiaAnterior = new Date();
      fechaDiaAnterior.setDate(fechaDiaAnterior.getDate() - 1);

      // Validar que sea entre marzo y diciembre
      if (fechaDiaAnterior.getMonth() > 2 ) {

          // Obtener todas las instituciones
          const instituciones = await Institucion.find();
      
          // Iterar sobre cada institución
          for (const institucion of instituciones) {
    
            // Obtener todos los estudiantes de la institución
            const estudiantes = await Estudiante.find({ institucion: institucion._id });
    
            // Inicializar variable asistencias
            const asistencias = [];
    
            // Iterar sobre cada estudiante
            for (const estudiante of estudiantes) {
    
                // Obtener el primer elemento del arreglo de asistencias del estudiante
                const asistencia = estudiante.asistencias[0];
    
                // Si la fecha de la asistencia es igual a la fecha del día anterior, agregar la hora de llegada al arreglo de asistencias
                if (asistencia.fecha.getDate() === fechaDiaAnterior.getDate()) {
                    asistencias.push(asistencia.hora_llegada);
                }
            }
    
            // Validar que existan asistencias
            if (asistencias.length > 0) {
                // Calcular el promedio de hora de llegada del arreglo de asistencias
                const segundosTotales = strings.reduce((acumulador, tiempo) => {
                    const [horas, minutos, segundos] = tiempo.split(':').map(Number);
                    return acumulador + horas * 3600 + minutos * 60 + segundos;
                }, 0);
    
                // Calcular el promedio en segundos
                const promedioSegundos = segundosTotales / strings.length;
    
                // Convertir el promedio de segundos a formato 'HH:mm:ss'
                const horas = Math.floor(promedioSegundos / 3600);
                const minutos = Math.floor((promedioSegundos % 3600) / 60);
                const segundos = Math.floor(promedioSegundos % 60);
    
                // Formatear el resultado
                const resultado = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    
                // Formato asistencias_general
                const asistencias_general = {
                    fecha: fechaDiaAnterior,
                    promedio_asistencias: resultado
                }
                // Guardar el promedio de asistencias en la posicion 0 del arreglo de asistencias_general de la institución
                institucion.asistencias_general.unshift(asistencias_general);
    
                // Guardar la institución con el nuevo promedio de asistencias
                await institucion.save(); 
            }
    
          }

      }
      else {
            console.log('No se puede obtener el promedio de asistencias por día en enero o febrero.');
      }
  

    } catch (error) {
      // Manejar errores
      console.error('Error al obtener el promedio de asistencias por día:', error);
      res.status(500).json({ error: 'Hubo un error al obtener el promedio de asistencias por día.' });
    }
};

// Funciones de cron
const funcionesCron = async () => {
    console.log("Funcion Realizada")
    
    await actualizarEstadoEstudiante();
    await obtenerPromedioAsistenciasPorDia();

};

const job = new cron.CronJob('0 * * * * *', funcionesCron);

// job.start();


module.exports = {
    getEstudiantesByInstitutionId,
    getEstudiantesByGradoId,
    getEstudianteById,
    getAsistenciasEstudiante,
    getAsistenciaEstudiante,
    getAsistenciaEstudianteMes,
    getAsistenciaEstudianteRango,
    crearEstudiante,
    actualizarEstudiante,
    eliminarEstudiante,
    registrarAsistencia,
    actualizarEstadoEstudiante
}