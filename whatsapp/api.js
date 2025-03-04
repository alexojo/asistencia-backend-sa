const { MemoryDB, addKeyword, createBot, createFlow, createProvider } = require("@bot-whatsapp/bot");
const { BaileysProvider } = require("@bot-whatsapp/provider-baileys");
const express = require("express");
const router = express.Router();
let qrCodeData = ""; // 📌 Almacena el QR temporalmente

// 📌 Flujo de bienvenida
const flowBienvenida = addKeyword(['hola']).addAnswer('Este es un control de asistencia');

// 📌 Función para crear la sesión de WhatsApp
const createSession = async () => {
    try {
        const provider = createProvider(BaileysProvider);

        provider.on('qr', async (qr) => {
            console.log("📌 Nuevo QR generado");
        });

        provider.on('ready', () => {
            console.log("✅ Cliente de WhatsApp conectado correctamente.");
        });

        provider.on('disconnected', () => {
            console.error("⚠️ Cliente de WhatsApp desconectado.");
            qrCodeData = "";  // Reiniciar QR en caso de desconexión
        });

        await createBot({
            flow: createFlow([flowBienvenida]),
            database: new MemoryDB(),
            provider,
        });

        return provider;
    } catch (error) {
        console.error("❌ Error iniciando la sesión de WhatsApp:", error);
        throw error;
    }
};

module.exports = { createSession, router };
