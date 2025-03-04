const { createSession } = require("./api");

let cliente;

async function initCliente() {
    if (!cliente) {  // ✅ Evitar múltiples inicializaciones
        cliente = await createSession();
    }
    return cliente;
}

module.exports = { initCliente, cliente };