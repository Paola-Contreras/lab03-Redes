const { NONAME } = require('dns');
const fs = require('fs');

/**
 * Clase que representa un nodo en el algoritmo Hooding de enrolamiento.
 * @class NodeHooding
*/

class NodeHooding {
    /**
     * Constructor de la clase NodeHooding.
     * @constructor
     * @param {string} id - Identificador único del nodo.
    */
    constructor(id) {
        this.id = id[id.length - 1];
    }

    /**
     * Creación de paquete.
     * @param {string} payload - Contenido de mensaje a enviar.
     * @param {string} to - Nodo a enviar.
     * @param {int} hop_count - Cantidad de nodos recorridos.
     * @param {string} packetType - Tipo de paquete. default: "message"
     * @returns packet 
     */
    generatePacket(payload, to, recievers = [], hop_count = 0, packetType = "message") {
    
        const packet = {
            "type": packetType,
            "headers": {
                "from": this.id,
                "to": to,
                "hop_count": hop_count,
                "recievers": recievers,
                "algorithm":"Flooding"
            },
            "payload": payload
        }
    
        return packet;

    }
    

    /**
     * Recibir y enviar a nodos vecinos de ser necesario.
     * @param {dict} stringPacket - Paquete recibido como string <body de stanza>.
     * @returns 0 cuando no se debe reenviar, 1 cuando se debe reenviar a nodos vecinos.
     */
     receivePacket(stringPacket) {
        const packet = JSON.parse(stringPacket);
        const received = new Set();
        packet.headers.recievers.forEach(element => {
            received.add(element);
        });
        const payload = packet.payload;
    
        if (!received.has(this.id)) {
            received.add(this.id);
            packet.headers.recievers = Array.from(received);
            if (packet.headers.to === this.id) {
                console.log(" !! Mensaje recibido. ID:", this.id);
                console.log("CONTENIDO DEL MENSAJE: ", payload);
            } else {
                const stringPacket = JSON.stringify(packet);
                return { resend: 1, packet: stringPacket }; // Devuelve un objeto con los valores
            }
        } else {
            console.log(" !! Mensaje descartado. El nodo ya ha recibido este mensaje.");
        }
    
        const stringPacket2 = JSON.stringify(packet);
        return { resend: 0, packet: stringPacket2 }; // Devuelve un objeto con los valores
    }
      


}

module.exports = NodeHooding;
