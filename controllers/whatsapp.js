const { response } = require('express');

const { join } = require("path");
const { createReadStream } = require("fs");

const getQR = async(_, res = response) => {
    try {
        const YOUR_PATH_QR = join(process.cwd(), `bot.qr.png`);
        const fileStream = createReadStream(YOUR_PATH_QR);

        res.writeHead(200, { "Content-Type": "image/png" });
        fileStream.pipe(res);
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
}

module.exports = {
    getQR
}