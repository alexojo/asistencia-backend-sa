/*
    Rutas de Whatsapp
    host + /api/whatsapp
*/

const { getQR } = require('../controllers/whatsapp');

const express = require('express');

const router = express.Router();

router.get('/get-qr', getQR);







module.exports = router;