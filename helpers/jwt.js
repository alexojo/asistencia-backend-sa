const jwt = require('jsonwebtoken');


const generarJWT = ( uid, dni ) => {

    return new Promise( (resolve, reject) => {

        const payload = { uid, dni };

        jwt.sign( payload, process.env.SECRET_JWT_SEED, {
            // una semana
            expiresIn: '7d'
        }, (err, accessToken) => {

            if (err) {
                console.log(err);
                reject('No se pudo generar el accessToken');
            }

            resolve( accessToken );

        });

    });

}

module.exports = {
    generarJWT
}