const enviarMensaje = async (cliente, contacto, mensaje) => {
    if (!cliente) {
        console.error("❌ Error: Cliente de WhatsApp no inicializado.");
        return;
    }
    
    try {
        await cliente.sendMessage(contacto, mensaje);
        console.log("✅ Mensaje enviado correctamente.");
    } catch (error) {
        console.error("❌ Error enviando mensaje:", error);
    }
};

module.exports = { enviarMensaje };
