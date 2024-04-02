const { createSession } = require("./api");


let cliente;

async function initCliente() {
    cliente = await createSession();
}

module.exports = {
    initCliente,
    cliente
  };