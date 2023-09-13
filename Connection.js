// Este documento representa la conexión con el cliente
// Imports de los módulos necesarios
const { client, xml } = require("@xmpp/client");

// Desactivación de certificados SSL/TLS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Función para crear una conexión XMPP
function createXMPPConnection(username, password) {
  const xmpp = client({
    service: "xmpp://alumchat.xyz:5222",
    domain: "alumchat.xyz",
    username: username,
    password: password,

    tls: {
      rejectUnauthorized: true,
    }
  });
  console.log(`\n Connecting to XMPP server as ${username}`);
  return {
    xmpp
  };
}

function message_one_one(user, person, text) {
  const messageXml = xml(
      "message",
      { from: `${user}`, to: `${person}`, type: "chat"},
      xml("body", {}, text)
  );
  return messageXml;
}


// Exportar la función de creación de conexión
module.exports = {
  createXMPPConnection,
  message_one_one,
};
