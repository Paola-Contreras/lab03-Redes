const fs = require('fs');
const readline = require('readline');
const Server = require('./Connection');
const { xml, client } = require('@xmpp/client');
const { Console } = require('console');


let vecin = [];
let pt = null;
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
    console.log("2. Ver Tabla de Enrrutamiento");
    console.log("3. Salir");     

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
        type: item,
        headers: {
          from: origin,
          to: destin,
          "algorithm": "DVR"
        },
        payload: table
      };
    
    const jsonString = JSON.stringify(mensaje);

    const user1 = await get_email(namesg4,origin)
    const user2 = await get_email(namesg4,destin)

   
    // console.log(item,":",jsonString);
      
    st = Server.message_one_one(user1,user2,jsonString);
    xmppInstance.send(st);
      
}

async function Spackage2 (item, origin, destino, table) {
  const mensaje = {
      type: item,
      headers: {
        from: origin,
        to: destino,
        "algorithm": "DVR"
      },
      payload: table
    };
  
  const jsonString = JSON.stringify(mensaje);
  return jsonString;

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
    // console.log(vecin)
    // console.log(topology);
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
    
    return matriz
    
}

function sameMatrix(matriz1, matriz2) {
  // Verificar dimensiones
  if (matriz1.length !== matriz2.length || matriz1[0].length !== matriz2[0].length) {
      return false;
  }

  // Comparar elemento por elemento
  for (let i = 0; i < matriz1.length; i++) {
      for (let j = 0; j < matriz1[i].length; j++) {
          if (matriz1[i][j] !== matriz2[i][j]) {
              return false;
          }
      }
  }

  return true;
}


async function getPath(origin, destin) {
  return new Promise(async (resolve, reject) => {
    try {
      const using_nodes = await readJSON(topog4);

      origen = using_nodes.indexOf(origin);
      destino = using_nodes.indexOf(destin);

      indexVecin = [];

      for (const v of vecin) {
        val = using_nodes.indexOf(v);
        indexVecin.push(val);
      }

      let ruta = [];

      let DistMin = 999;
      for (const vecino of indexVecin) {
        const distancia = matrix[origen][vecino] + matrix[vecino][destino];

        if (distancia < DistMin) {
          DistMin = distancia;
          ruta = [using_nodes[origen], using_nodes[vecino], using_nodes[destino]];
        }
      }

      // Imprimir la ruta
      // console.log(`Ruta desde A hasta D: ${ruta.join(" -> ")}`);
      // console.log(ruta[1]);
      let intermedio = ruta[1];
      
      // Resuelve la promesa con el valor intermedio
      resolve(intermedio);
    } catch (error) {
      // En caso de error, rechaza la promesa
      reject(error);
    }
  });
}

async function processLogin(user,password) {
  const parts = user.split('@');
  const username = parts[0];
  /// CONECTION 
  const { xmpp } = Server.createXMPPConnection(username, password);
  xmpp.start().catch(console.error);
  xmpp.on('stanza', async (stanza) => {
   
    if (stanza.is('message') && stanza.attrs.type == 'chat') {
        const from = stanza.attrs.from
        const body = stanza.getChildText('body') 
        if (body !== null){
          const jsonObject = JSON.parse(body);
          
          Mtype = jsonObject.type
          algorithm = jsonObject.headers.algorithm
          // console.log(Mtype)
          if (algorithm == "DVR" && Mtype == "info"){
            matrizAristas = getMatrixJSON(body);

            const numNodos = matrix.length;
            const new_matrix = shortesPath(matrix, matrizAristas, numNodos);
            // matrix = new_matrix
            if (!sameMatrix(matrix, matrizAristas)){
              matrix = new_matrix;
            
              vecin.forEach(item => {
                Spackage("info", actual_node, item, matrix);
              });
            } 
          } 
          if (Mtype == "message"){

                getDestin = jsonObject.headers.to;

                if (getDestin === actual_node){
                  getOrigin = jsonObject.headers.from;
                  console.log(">>>> Message from:", getOrigin, jsonObject.payload)

                }else {
                  getIntermedio = await getPath(actual_node,getDestin);

                  const user1 = await get_email(namesg4,actual_node)
                  const user2 = await get_email(namesg4,getIntermedio)
                  
                  console.log(">>>>>>>>>>>>")
                  console.log("Pasando por", getIntermedio)
                  console.log(">>>>>>>>>>>>")
                  paquete2 = JSON.stringify(jsonObject)

                  st = Server.message_one_one(user1,user2,paquete2);
                  xmppInstance.send(st);
                }              
            
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
            // console.log(costs)
            generate_matrix(using_nodes.length);
            matrix[indexOfActualNode] = costs;
            // console.log("\n *MATRIZ INICIAL*.");
            // console.log(matrix);
            vecin.forEach(item => {
                Spackage("info",actual_node,item,matrix);
            });
    
        })            
}

async function Choice_FuncMenu(choice) {
  switch (choice) {
      case '1':
          console.log("\n --- ENVIAR MENSAJE ---.");
          rl.question("A que nodo deseas enviar un mensje: ", (node) => {
            rl.question("Cuál es el mensaje?: ", async (mensaje) => {
              paquete = await Spackage2("message",actual_node,node,mensaje)
              intermedio = await getPath(actual_node, node);
        
              const user1 = await get_email(namesg4,actual_node)
              const user2 = await get_email(namesg4,intermedio)
                
              st = Server.message_one_one(user1,user2,paquete);
              xmppInstance.send(st);
              menu_funcionamiento();
            });
        });
          
          break;
      case '2':
          console.log("\n --- VER TABLA DE ENRUTAMIENTO ---.");
          console.log(matrix)
          menu_funcionamiento();
          break;
      case '3':
          console.log("\n --- SALIR ---.");
          console.log("Disconnected from XMPP server.\n");
          rl.close();
          xmppInstance.stop();
          break;
      default:
          console.log("Opcion invalida, intenta de nuevo");
          break;
  }
}

async function main (){
  await ask_nodo();
  user = await get_email(namesg4, actual_node);
  await processLogin(user,password)
  menu_funcionamiento()

}

main();