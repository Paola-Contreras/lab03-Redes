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
        this.id = id;
        this.neighbors = [];
        this.readyToSend = false;
        this.receivedMessages = new Set();
    }

    
    /**
     * Genera un identificador único para mensajes.
     * @returns {string} - Identificador único generado.
    */
    generateUniqueId() {
        const timestamp = Date.now().toString(16);
        const randomValue = Math.random().toString(16).substr(2);
        return `${timestamp}-${randomValue}`;
    }


    /**
     * Agregar un vecino a la lista de vecinos.
     * @param {string} neighborNode - Identificador del nodo vecino.
     */
    addNeighbor(neighborNode) {
        this.neighbors.push(neighborNode);
        console.log(` !! Nodo vecino "${neighborNode}" agregado.`);
        console.log("   Vecinos ", this.neighbors)
    }


    /**
     * Enviar mensaje a vecinos.
     * @param {dict} packet - Estructura JSON con info de mensaje a enviar.
     */
    sendPacket(packet) {
        for (let i = 0; i < this.neighbors.length; i++) {
            const neighbor = this.neighbors[i];
            packet.headers.to = neighbor; // Indicar receptor.
            console.log(" !! Mensaje enviado a ", neighbor, " de ID: ", this.id)
            // Enviar packet -> TODO para siguiente lab
        }
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
        const messageId = this.generateUniqueId();
    
        const packet = {
            "type": packetType,
            "headers": {
                "messageId": messageId,
                "from": this.id,
                "to": to,
                "hop_count": hop_count,
                "recievers": recievers
            },
            "payload": payload
        }
    
        // Crear un nombre de archivo único basado en el messageId
        const fileName = `./Packets/packet_${messageId}.json`;
    
        // Guardar el paquete como un archivo JSON
        fs.writeFileSync(fileName, JSON.stringify(packet, null, 2), 'utf8');
    
        // Mostrar un mensaje de confirmación
        console.log(`Paquete creado y guardado como ${fileName}`);
    
        // Enviar packet
        this.sendPacket(packet);
    
        return packet;

    }
    

    /**
     * Recibir y enviar a nodos vecinos de ser necesario.
     * @param {dict} paquete - Paquete recibido.
     */
     receivePacket(packet) {
        const messageId = packet.headers.messageId;
        const received = new Set(packet.headers.recievers);
    
        if (!received.has(this.id)) {
            if (packet.headers.to === this.id) {
                console.log(" !! Mensaje recibido. ID:", this.id);
                this.receivedMessages.add(messageId);
            } else {
                this.sendPacket(packet);
                packet.headers.hop_count = packet.headers.hop_count + 1;
                console.log(" !! Mensaje recibido y reenviado a nodos vecinos.");
            }
    
            received.add(this.id);
            packet.headers.recievers = Array.from(received);
    
            // Obtener nombre de archivo mensaje
            const fileName = `./Packets/packet_${messageId}.json`;
    
            // Reescribir JSON
            fs.writeFileSync(fileName, JSON.stringify(packet, null, 2), 'utf8');
        } else {
            console.log(" !! Mensaje descartado. El nodo ya ha recibido este mensaje.");
        }

    }    


}

module.exports = NodeHooding;
