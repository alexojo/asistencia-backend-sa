const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const lodash = require('lodash');
const { generarJWT } = require('../helpers/jwt');


const getUsuarios = async(req, res = response) => {

    const usuarios = await Usuario.find().
                                    populate('institucion', 'nombre');

    res.json({
        ok: true,
        usuarios
    });
}

const getUsuarioById = async(req, res = response) => {
    
        const usuarioId = req.query.id;
    
        try {
    
            const usuario = await Usuario.findById( usuarioId ).
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

const getUsuariosByInstitutionId = async(req, res = response) => {

    try{

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

const crearUsuario =  async(req, res = response ) => {

    const { dni, password } = req.body;

    try {
        let usuario = await Usuario.findOne({ dni });

        if (usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Un usuario existe con este dni'
            });
        }

        usuario = new Usuario( req.body );

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );

        await usuario.save();

        // Generar JWT
        const accessToken = await generarJWT( usuario.id, usuario.dni );
        

        res.status(201).json({
            ok: true,
            uid: usuario.id,
            dni: usuario.dni,
            accessToken
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

const actualizarUsuario = async(req, res = response) => {

    const usuarioId = req.query.id;

    try {

        const usuarioDB = await Usuario.findById( usuarioId );

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con ese id'
            });
        }

        // Actualizaciones
        const { password, ...campos } = req.body;

        const usuarioActualizado = await Usuario.findByIdAndUpdate( usuarioId, campos, { new: true } );

        res.json({
            ok: true,
            usuario: usuarioActualizado
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

const eliminarUsuario = async(req, res = response) => {

    const usuarioId = req.query.id;

    try {

        const usuarioDB = await Usuario.findById( usuarioId );

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con ese id'
            });
        }

        await Usuario.findByIdAndDelete( usuarioId );

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

const loginUsuario =  async (req, res = response ) => {

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
        const validPassword = bcrypt.compareSync( password, usuario.password );

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            });
        }

        // Generar el JWT
        const accessToken = await generarJWT( usuario.id, usuario.dni );

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
    const accessToken = await generarJWT( uid, dni );

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