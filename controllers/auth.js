const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const lodash = require('lodash')
const axios = require('axios');
const { generarJWT } = require('../helpers/jwt');


const getUsuarios = async (req, res = response) => {

    const usuarios = await Usuario.find().
        populate('institucion', 'nombre');

    res.json({
        ok: true,
        usuarios
    });
}

const getUsuarioById = async (req, res = response) => {

    const usuarioId = req.query.id;

    try {

        const usuario = await Usuario.findById(usuarioId).
            populate('institucion', 'nombre');

        res.json({
            ok: true,
            usuario
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

const getUsuariosByInstitutionId = async (req, res = response) => {

    try {

        const { institucionId } = req.query;

        // obtener usuarios por institucion
        const usuarios = await Usuario.find({ institucion: institucionId });

        res.json({
            ok: true,
            usuarios
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

const crearUsuario = async (req, res = response) => {

    const { dni, password, foto64 } = req.body;

    try {
        let usuario = await Usuario.findOne({ dni });

        if (usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Un usuario existe con este dni'
            });
        }

        usuario = new Usuario(req.body);

        // subir imagen a IMGBB
        const blob = new Blob([Buffer.from(foto64.replace(/^data:image\/\w+;base64,/, ''), 'base64')], { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('image', blob, 'imagen.jpg');

        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, formData);

        usuario.url_foto = response.data.data.url ? response.data.data.url : '';

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        await usuario.save();

        res.status(201).json({
            ok: true,
            uid: usuario.id,
            dni: usuario.dni,
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

const actualizarUsuario = async (req, res) => {
    const usuarioId = req.query.id; // Se recibe el id desde req.params
    const { foto64, password, ...campos } = req.body; // Extraemos password para no actualizarlo

    try {
        const usuarioDB = await Usuario.findById(usuarioId);

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con ese id'
            });
        }

        // Si hay imagen Base64, la subimos a IMGBB
        if (foto64 ) {
            try {
                const blob = new Blob([Buffer.from(foto64.replace(/^data:image\/\w+;base64,/, ''), 'base64')], { type: 'image/jpeg' });

                const formData = new FormData();
                formData.append('image', blob, { filename: 'imagen.jpg' });

                const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, formData);
                
                // Asignar la URL de la imagen al campo de usuario
                if (response.data.data.url) {
                    campos.url_foto = response.data.data.url;
                }

            } catch (uploadError) {
                console.error('Error subiendo la imagen a IMGBB:', uploadError);
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al subir la imagen'
                });
            }
        }

        // Actualizar usuario
        const usuarioActualizado = await Usuario.findByIdAndUpdate(usuarioId, campos, { new: true, runValidators: true });

        res.json({
            ok: true,
            usuario: usuarioActualizado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
};

const eliminarUsuario = async (req, res = response) => {

    const usuarioId = req.query.id;

    try {

        const usuarioDB = await Usuario.findById(usuarioId);

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con ese id'
            });
        }

        await Usuario.findByIdAndDelete(usuarioId);

        res.json({
            ok: true,
            msg: 'Usuario eliminado'
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

const loginUsuario = async (req, res = response) => {

    const { dni, password } = req.body;

    try {
        // recuperar datos de institucion
        const usuario = await Usuario.findOne({ dni }).
            populate('institucion', 'nombre hora_limite mensaje_asistencia');

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con este dni'
            });
        }

        // Confirmar los passwords
        const validPassword = bcrypt.compareSync(password, usuario.password);

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            });
        }

        // Generar el JWT
        const accessToken = await generarJWT(usuario.id, usuario.dni);

        // Eliminar el password del objeto que se retorna
        const usuarioObj = usuario.toJSON();
        delete usuarioObj.password;

        res.json({
            user: usuarioObj,
            accessToken
        });

    }

    catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }



}

const revalidarToken = async (req, res) => {

    const { uid, dni } = req;

    console.log(uid, dni);

    // Generar un nuevo JWT y retornarlo en esta petición
    const accessToken = await generarJWT(uid, dni);

    // Obtener el usuario por dni
    const usuario = await Usuario.findOne({ dni }).
        populate('institucion', 'nombre hora_limite mensaje_asistencia');

    // Eliminar el password del objeto que se retorna
    const usuarioObj = usuario.toJSON();
    delete usuarioObj.password;

    res.json({
        user: usuarioObj,
        accessToken
    });

}





module.exports = {
    getUsuarios,
    getUsuarioById,
    getUsuariosByInstitutionId,
    actualizarUsuario,
    eliminarUsuario,
    crearUsuario,
    loginUsuario,
    revalidarToken
}