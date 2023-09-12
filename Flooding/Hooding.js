const fs = require('fs');
const readline = require('readline');
const { stringify } = require('querystring');
const NodeHooding = require('./NodeHooding');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


let currentNodeId; // Variable para almacenar el identificador del nodo actual


// Función para solicitar el identificador del nodo
function enterNodeId() {
    rl.question("Ingrese el identificador del nodo: ", (id) => {
        currentNodeId = id;
        const myNode = new NodeHooding(currentNodeId); // Pasa el identificador actual al constructor
        showMenu(myNode);
    });
}


// Función para mostrar el menú principal
function showMenu(node) {
    console.log(`\n\n - MENU HOODING ALGORITHM - \n`);
    console.log(`Nodo actual: ${currentNodeId}\n`);
    rl.question("1. Agregar nodo vecino\n2. Enviar un mensaje\n3. Recibir un mensaje\n4. Salir\n\nIngrese la opción elegida: ", (choice) => {
        switch (choice) {
            case "1":
                enterNeighborId(node);
                break;
            case "2":
                handleSendMessage(node);
                break;
            case "3":
                handleReceiveMessage(node);
                break;
            case "4":
                rl.close();
                break;
            default:
                console.log("Opción no válida. Por favor, elija una opción válida.");
                showMenu(node);
        }
    });
}


// Función para solicitar el identificador del vecino
function enterNeighborId(node) {
    rl.question("Ingrese el identificador del nodo vecino: ", (neighborId) => {
        node.addNeighbor(neighborId)
        showMenu(node);
    });
}


// Lógica para enviar un mensaje
async function handleSendMessage(node) {
    let to;
    let payload;

    to = await askQuestion("Ingrese el id del destinatario: ");
    payload = await askQuestion("Ingrese el mensaje a enviar: ");

    // Generate Packet
    packet = node.generatePacket(payload, to);
    showMenu(node);
}


async function handleReceiveMessage(node) {
    let paquete = {
        type: 'message',
        headers: {},
        payload: ''
    };

    rl.question("Ingrese la ruta del archivo JSON: ", async (filePath) => {
        try {
            const jsonInput = fs.readFileSync(filePath, 'utf8');
            paquete = JSON.parse(jsonInput);
            node.receivePacket(paquete);
        } catch (error) {
            console.error('Error al leer o analizar el archivo JSON:', error);
        }

        showMenu(node);
    });

}


function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(` >> ${question}`, (answer) => {
            resolve(answer);
        });
    });
}


// Comenzar solicitando el identificador del nodo
enterNodeId();
