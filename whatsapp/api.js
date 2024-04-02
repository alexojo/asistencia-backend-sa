const { response } = require('express');

const { MemoryDB, addKeyword, createBot, createFlow, createProvider } = require("@bot-whatsapp/bot");
const { BaileysProvider } = require("@bot-whatsapp/provider-baileys");



const flowBienvenida = addKeyword('hola').addAnswer('Este es un control de asistencia'); // More informative greeting

const createSession = async(req) => {

    const provider = createProvider(BaileysProvider, {
        // Add BaileysProvider options here (e.g., auth strategy, connection info)
      });
    
    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider,
    });

    return provider;

}

module.exports = {
    createSession
}