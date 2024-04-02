const { response } = require('express');
const jwt = require('jsonwebtoken');


const validarJWT = (req, res, next) => {
    // x-token headers
    const accessToken = req.header('x-token');

    if (!accessToken) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    try {
        const { uid, dni } = jwt.verify(
            accessToken,
            process.env.SECRET_JWT_SEED
        );

        req.uid = uid;
        req.dni = dni;

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }

    next();
}

module.exports = {
    validarJWT
}