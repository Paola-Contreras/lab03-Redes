const { client, xml } = require("@xmpp/client");
const NodeHooding = require('./NodeHooding');
const stanzas = require('./stanzas');
const fs = require('fs');

class HoodingClient {
  constructor(jid, password) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // Propiedades del cliente XMPP
    this.jid = jid;
    this.password = password;
    this.roster = new Set();
    this.completeJID = "";
    this.contacts = new Set();
    this.Node = new NodeHooding(this.jid);
    this.getContacts();
  }

  async connect() {
    try {
      // Crear conexión XMPP
      this.xmpp = client({
        service: "xmpp://alumchat.xyz:5222",
        domain: "alumchat.xyz",
        username: this.jid,
        password: this.password,
        tls: {
          rejectUnauthorized: true,
        },
      });

      // Manejar eventos
      this.xmpp.on('online', async (address) => {
        this.completeJID = address.toString();
        const myPresence = stanzas.onlineStanza();
        this.xmpp.send(myPresence);
      });

      this.xmpp.on("stanza", (stanza) => {
        // Verificar si es un mensaje con cuerpo
        if (stanza.is('message') && stanza.getChild('body')) {
          const from = stanza.attrs.from.split('@')[0];
          const messageBody = stanza.getChildText('body');
          try {
            const jsonString = JSON.parse(messageBody);
            const algorithm = jsonString.headers.algorithm;
  
            console.log(`\n- - - - - - - - - - - - - - - - - - - - - - - - - - -\n!!! Mensaje de ${from}. Algoritmo: ${algorithm}\n- - - - - - - - - - - - - - - - - - - - - - - - - - -`);
            if (algorithm.trim() === "Flooding") {   
              const result = this.Node.receivePacket(messageBody);
              const resend = result.resend;
              const packet = result.packet;
              if (resend === 1) {
                console.log(" !! Mensaje recibido y reenviado a nodos vecinos");
                this.sendToNeighbors(packet);
              }
            }
          } catch (error) {
            console.log("\n");
          }
        }
      });

      // Iniciar la conexión
      await this.xmpp.start();

      return 0;

    } catch (error) {
      console.error("@! JID o contraseña incorrecta.\n\n", error);

      return 1;
    }

  }

  getContacts() {
    /*
      Envío de stanza para obtener roster.
      Función utilizada en getContactsInfo.
    */
    const nodeNames = fs.readFileSync('../topo-g4.txt', 'utf8');
    const nodes = JSON.parse(nodeNames);
    const nodeLetter = this.jid[this.jid.length - 1];
    const nodeNeighbors = nodes["config"][nodeLetter];

    nodeNeighbors.forEach(nodeL => {
      this.contacts.add(nodeL);
    })
  }

  sendToNeighbors = (messageString) => {
    return new Promise (async (resolve, reject) => {
      // Enviar mensaje a cada vecino
      this.contacts.forEach(neighbor => {

        const nodeNames = fs.readFileSync('../names-g4.txt', 'utf8');
        const nodes = JSON.parse(nodeNames);
        const completeNei = nodes["config"][neighbor].split('@')[0];

        const neighborMessage = stanzas.privateMessage(messageString, completeNei);
        console.log("Enviado a:", completeNei);
        this.xmpp.send(neighborMessage);
      })
      resolve();
    });
  }

  async privateMessage(message, to) {
    try {
      const packet = this.Node.generatePacket(message, to);
      const stringPacket = JSON.stringify(packet);
      
      // Enviar a vecinos
      await this.sendToNeighbors(stringPacket);

      console.log("!!! Mensaje enviado",);
    } catch (error) {
      console.error(`\nXXX Error al enviar la presencia: ${error}`);
    }
  }


  async disconnect() {
    try {
      if (this.xmpp) {
        const offline = stanzas.offline();
        this.xmpp.send(offline);

        await this.xmpp.stop();
        console.log("Desconectado del servidor.");
      } else {
        console.log("No estás conectado.");
      }
    } catch (error) {
      console.log("@! Error al desconectarse.");
    }
  }


}

module.exports = HoodingClient;