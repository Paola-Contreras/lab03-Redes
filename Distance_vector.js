const fs = require('fs');

const readline = require('readline');
let vecin = [];
let matrix = [];
let topology = [];
let actual_node = "";
// let using_nodes = []
// let topology = [ ['A', 'B', '1'], ['A', 'C', '5']];
// let actual_node = "A";
// let topology = [ ['B', 'A', '1'], ['B', 'C', '2']];
// let actual_node = "B";
// let topology = [ ['C', 'A', '5'], ['C', 'B', '2']];
// let actual_node = "C";
let nodoIngresado = false; 
const filePath = 'Distance_Vector/topology.json';

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

async function menu_nearNodes() {
    console.log("\n--- MENU PARA CONOCER VECINOS ---");
    console.log("1. Ingresar vecinos");
    console.log("2. Salir");
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

function vecinos() {
    return new Promise((resolve) => {
        rl.question("Ingresa Nodo vecino: ", (node) => {
            rl.question("Ingresa costo: ", (cost) => {
                resolve({ node, cost });
            });
        });
    });
}

function generate_matrix(nodes){
    for (var i=0; i < nodes; i++){
        var row = [];
        for (var j =0; j < nodes; j++){
            row.push("null");
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
        if (matrizAristas[i][j] !== 'null') {
            matrix[i][j] = matrizAristas[i][j];
        }
      }
    }
  
    const matrizDistancias = bellmanFord(matrix, numNodos);
  
    return matrizDistancias;
}

function Spackage (item, origin, destin, table) {
    const mensaje = {
        type: "message",
        headers: {
          from: origin,
          to: destin,
          hop_count: 0
        },
        payload: table
      };
    
    const jsonString = JSON.stringify(mensaje);
      console.log(item,":",jsonString);
      
}

async function readJSON() {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
          return;
        }
        
        try {
            const jsonData = JSON.parse(data);
            
            const using_nodes = jsonData.nodes;
            resolve(using_nodes);

        } catch (error) {
            reject(error);
        }
    });
});
}

function getMatrixJSON (input) {
    const objetoJSON = JSON.parse(input);
    const matriz = objetoJSON.payload;
    
    // Ahora puedes utilizar la matriz
    console.log(matriz);
    return matriz
    
}

async function mainMenu() {
    await ask_nodo();
    await menu_nearNodes();
    return new Promise((resolve) => {
        rl.question("Ingresa tu elección: ", async function (choice) {
            switch (choice) {
                case '1':
                    console.log("\n --- INGRESAR NODO VECINO ---.");
                    const { node, cost } = await vecinos();
                    topology.push([actual_node, node, cost])
                    console.log(`Vecino ingresado: ${node}, Costo: ${cost}\n`);
                    mainMenu()
                    break;
                case '2':
                    resolve();

                    await readJSON()
                        .then(using_nodes => {
                    
                            let uniqueNodes = Array.from(new Set(using_nodes.flatMap(item => item.slice(0, 2))));
                            let costs = using_nodes.map(() => "null");
                            let indexOfActualNode = using_nodes.indexOf(actual_node);
                    
                            topology.forEach(([nodeA, nodeB, cost]) => {
                                let indexA = uniqueNodes.indexOf(nodeA);
                                let indexB = uniqueNodes.indexOf(nodeB);
                            
                                if (indexA !== -1 && indexB !== -1) {
                                costs[indexB] = parseInt(cost, 10);
                                vecin.push(nodeB)
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
                        .catch(error => {
                        console.error('Error al leer el archivo JSON:', error);
                        });

                        menu_funcionamiento();
                    break;
                default:
                    console.log("Opción inválida. Por favor, selecciona una opción válida.");
                    mainMenu()
                    break;
            }
        });
    });
}

async function Choice_FuncMenu(choice) {
    switch (choice) {
        case '1':
            console.log("\n --- ENVIAR ---.");
            console.log(matrix)
            vecin.forEach(item => {
                console.log(item);
                Spackage(actual_node,item,matrix);
            });
            menu_funcionamiento();
            break;
        case '2':
            console.log("\n --- RECIBIR MENSAJE ---.");
                rl.question("Ingresa mensaje: ", async function (text) {
                    matrizAristas = getMatrixJSON(text);

                    const numNodos = matrix.length;
                    const new_matrix = shortesPath(matrix, matrizAristas, numNodos);
                    matrix = new_matrix
                    menu_funcionamiento();
                });
            break;
        case '3':
            console.log("\n --- VER MATRIZ ACTUAL ---.");
            console.log(matrix)
            menu_funcionamiento();
            break;
        case '4':
            console.log("\n --- SALIR ---.");
            rl.close();
            break;
        default:
            console.log("Opcion invalida, intenta de nuevo");
            Choice_privateChat();
            break;
    }
}

async function main (){
    await mainMenu();
}

main();