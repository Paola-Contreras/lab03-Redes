const fs = require('fs');
const readline = require('readline');
const Server = require('./Connection');
const { xml, client } = require('@xmpp/client');
const { Console } = require('console');


let vecin = [];
let matrix = [];
let topology = [];
let actual_node = "";
let nodoIngresado = false; 
const password = "redes2023";
const topog4 = 'topo-g4.txt';
const namesg4 = 'names-g4.txt';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function ask_nodo() {
    return new Promise((resolve) => {
        if (!nodoIngresado) { 
            rl.question("Que nodo eres: ", (node) => {
                actual_node = node;
                nodoIngresado = true; 
                resolve();
            });
        } else {
            resolve(); 
        }
    });
    
}

function menu_funcionamiento() {
    console.log("\n--- MENU PARA SIMULAR ---");
    console.log("1. Enviar Mensaje");
    console.log("2. Recibir Mensaje");
    console.log("3. Ver Matriz");
    console.log("4. Salir");     

    rl.question("Ingresa tu selección: ", function(choice) {
        Choice_FuncMenu(choice);
      });
}


function generate_matrix(nodes){
    for (var i=0; i < nodes; i++){
        var row = [];
        for (var j =0; j < nodes; j++){
            row.push(999);
        }
        matrix.push(row);
    }

    return matrix;
}

function bellmanFord(matrizDistancias, numNodos) {
    for (let k = 0; k < numNodos; k++) {
      for (let i = 0; i < numNodos; i++) {
        for (let j = 0; j < numNodos; j++) {
          if (matrizDistancias[i][k] + matrizDistancias[k][j] < matrizDistancias[i][j]) {
            matrizDistancias[i][j] = matrizDistancias[i][k] + matrizDistancias[k][j];
          }
        }
      }
    }
  
    return matrizDistancias;
}

function shortesPath(matrix, matrizAristas, numNodos) {
    for (let i = 0; i < numNodos; i++) {
      for (let j = 0; j < numNodos; j++) {
        if (matrizAristas[i][j] !== 999) {
            matrix[i][j] = matrizAristas[i][j];
        }
      }
    }
  
    const matrizDistancias = bellmanFord(matrix, numNodos);
  
    return matrizDistancias;
}

async function Spackage (item, origin, destin, table) {
    const mensaje = {
        type: "message",
        headers: {
          from: origin,
          to: destin,
          "algorithm": "Distance Vector"
        },
        payload: table
      };
    
    const jsonString = JSON.stringify(mensaje);

    const user1 = await get_email(namesg4,origin)
    const user2 = await get_email(namesg4,destin)

    console.log(user2)
    console.log(item,":",jsonString);
      
    st = Server.message_one_one(user1,user2,jsonString);
    xmppInstance.send(st);
      
}

async function get_email(archivo, clave) {
    try {
      const data = await fs.promises.readFile(archivo, 'utf8'); 
      const config = JSON.parse(data);
  
      if (config.config.hasOwnProperty(clave)) {
        const valor = config.config[clave];
        return valor;
      } else {
        console.log(`La clave ${clave} no existe en el objeto "config".`);
      }
    } catch (err) {
      console.error(`Error al leer ${archivo}: ${err}`);
    }
}

async function get_vecin(archivo, clave) {
    try {
      const data = await fs.promises.readFile(archivo, 'utf8'); 
      const config = JSON.parse(data);
  
      if (config.config.hasOwnProperty(clave)) {
        const valor = config.config[clave];

        for (let i = 0; i < valor.length; i++) {
            const caracter = valor[i];
            vecin.push(caracter);

        }

        for (let i = 0; i < vecin.length; i++) {
            const node = valor[i];
            topology.push([clave, node, 1]);
        }
        
      } else {
        console.log(`La clave ${clave} no existe en el objeto "config".`);
      }
    } catch (err) {
      console.error(`Error al leer ${archivo}: ${err}`);
    }
    console.log(vecin)
    console.log(topology);
}


async function readJSON(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
  
        try {
          const jsonData = JSON.parse(data);
  
          if (jsonData.hasOwnProperty('config')) {
            const using_nodes = Object.keys(jsonData.config);
            resolve(using_nodes);
          } else {
            reject(new Error('El archivo JSON no contiene la propiedad "config"'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
}

function getMatrixJSON (input) {
    const objetoJSON = JSON.parse(input);
    const matriz = objetoJSON.payload;
    
    console.log(matriz, "DE MENSAJE");
    return matriz
    
}


async function processLogin(user,password) {
  const parts = user.split('@');
  const username = parts[0];
  /// CONECTION 
  const { xmpp } = Server.createXMPPConnection(username, password);
  xmpp.start().catch(console.error);
  xmpp.on('stanza', (stanza) => {
   
    if (stanza.is('message') && stanza.attrs.type == 'chat') {
      console.log(matrix)
        const from = stanza.attrs.from
        const body = stanza.getChildText('body') 
        if (body !== null){
          console.log(`> ${from}: ${body}`)
          const jsonObject = JSON.parse(body);
          
          console.log(jsonObject.headers.algorithm)
          algorithm = jsonObject.headers.algorithm
          if (algorithm == "Distance Vector"){
            matrizAristas = getMatrixJSON(body);

            const numNodos = matrix.length;
            const new_matrix = shortesPath(matrix, matrizAristas, numNodos);
            matrix = new_matrix
          }
    }
  }
})

xmpp.on('online', async (address) => {
  const online_stanza = xml('presence', { type: 'online' })
  xmpp.send(online_stanza)
})

  // INSTANCE 
    xmppInstance  = xmpp; 
    console.log(`\n--- Bienvenida ${username} ---`);
    
    xmpp.on('online', () => {
        console.log('XMPP connection online');
        mainMenu();
      });
}

async function mainMenu() {
    await get_vecin(topog4,actual_node);
    await readJSON(topog4)
        .then(using_nodes => {
            console.log(using_nodes)
            let uniqueNodes = Array.from(new Set(using_nodes.flatMap(item => item.slice(0, 2))));
            let costs = using_nodes.map(() => 999);
            let indexOfActualNode = using_nodes.indexOf(actual_node);
    
            topology.forEach(([nodeA, nodeB, cost]) => {
                let indexA = uniqueNodes.indexOf(nodeA);
                let indexB = uniqueNodes.indexOf(nodeB);
            
                if (indexA !== -1 && indexB !== -1) {
                costs[indexB] = parseInt(cost, 10);
                }
                if (indexOfActualNode !== -1) {
                costs[indexOfActualNode] = 0;
                }
            });
    
            // console.log(topology,"topology");
            generate_matrix(using_nodes.length);
            matrix[indexOfActualNode] = costs;
            console.log("\n *MATRIZ INICIAL*.");
            console.log(matrix);
            
            vecin.forEach(item => {
                Spackage(item,actual_node,item,matrix);
            });
    
        })            
}


async function main (){
  await ask_nodo();
  user = await get_email(namesg4, actual_node);
  await processLogin(user,password)
}

main();