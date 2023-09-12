const fs = require('fs');
const readline = require('readline');
const HoodingClient = require('./HoodingClient'); 
const { xml, client } = require('@xmpp/client');

let cliente;
let jid;
let password;

function questionAsync(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function start() {
    const myClient = new HoodingClient(jid, password);
    const isConnected = await myClient.connect();
    cliente = myClient;

    return isConnected;
}

const askForChoice = () => {
    rl.question('>> Ingrese el número de opción: ', (choice) => {
        handleChoice(choice);
    });
};

const displayMainMenu = () => {
    console.log('\n\n---------------------------------------------');
    console.log('                   MENU');
    console.log('1. Enviar mensaje');
    console.log('2. Salir.');
    console.log('\n\n---------------------------------------------');
}

const handleChoice = async (choice) => {
    switch (choice) {
        case '1':
            const to = await questionAsync(">> Ingresa el destinatario: ");
            const messagePrivate = await questionAsync(">> Ingresa el mensaje que deseas enviar: ");

            await cliente.privateMessage(messagePrivate, to);

            displayMainMenu();
            askForChoice();
            break;

        case '2':
            rl.close();
            await cliente.disconnect();
            console.log(`Adiós ${jid}!`);
            break;

        default:
            console.log('\n\n\n Opción no válida');
            displayMainMenu();
            askForChoice();
            break;
    }
}

const handleLoginChoice = async () => {

    const nodeNames = fs.readFileSync('../names-g4.txt', 'utf8');
    const nodes = JSON.parse(nodeNames);
    const nodesKey = Object.keys(nodes["config"]);

    console.log('\n                   NODOS ')
    const printKeys = nodesKey.map( key => {
        console.log(" - ",key);
    })
    console.log('')


    jid = await questionAsync(">> Ingresa el JID del nodo a utilizar: ");
    password = "redes2023"

    try {
        jid = nodes["config"][jid].split('@')[0];
    } catch (error) {
        console.log(" @! Error. Ingresa un nodo válido.")
    }

    const isConnected = await start();
    if (isConnected === 0) { 
        console.log("CONECTADO");
        displayMainMenu();
        askForChoice();
    } else {
        rl.close();
        process.exit(0);
    }
}

handleLoginChoice();
