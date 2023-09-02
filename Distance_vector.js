const fs = require('fs');
const readline = require('readline');
let vecin = [];
let matrix = [];
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

function ask_nodo() {
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

function menu_nearNodes() {
    console.log("1. Ingresar vecinos");
    console.log("2. Salir");
}

function menu_funcionamiento() {
    console.log("1. Enviar Mensaje");
    console.log("2. Recibir Mensaje");
    console.log("3. Salir");     
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
            row.push("∞");
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

function shortesPath(matrizOriginal, matrizAristas, numNodos) {
    // Realiza la adición de aristas a la matriz original
    for (let i = 0; i < numNodos; i++) {
      for (let j = 0; j < numNodos; j++) {
        if (matrizAristas[i][j] !== Infinity) {
          matrizOriginal[i][j] = matrizAristas[i][j];
        }
      }
    }
  
    // Llama a la función de Bellman-Ford para calcular los caminos más cortos
    const matrizDistancias = bellmanFord(matrizOriginal, numNodos);
  
    return matrizDistancias;
}

function Spackage (origin, destin, table) {
    const mensaje = {
        type: "message",
        headers: {
          from: origin,
          to: destin,
          hop_count: 0
        },
        payload: table
      };
    
      const replacer = (key, value) => {
        if (Array.isArray(value[0])) {
          return value.map(arr => `[${arr.join(', ')}]`).join(',');
        }
        return value;
      };

    const jsonString = JSON.stringify(mensaje, replacer, 2);
      
      console.log(jsonString);
      
}

function readJSON() {
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

async function mainMenu() {
    await ask_nodo();
    await menu_nearNodes();

    rl.question("Ingresa tu elección: ", async function (choice) {
        switch (choice) {
            case '1':
                console.log("\n --- INGRESAR NODO VECINO ---.");
                const { node, cost } = await vecinos();
                topology.push([actual_node, node,cost])
                // Aquí puedes hacer lo que necesites con node y cost
                console.log(`Vecino ingresado: ${node}, Costo: ${cost}\n`);
                mainMenu();
                break;
            case '2':
                console.log("\nSaliendo.");
                rl.close();
                console.log(topology)
                break;
            default:
                console.log("Opción inválida. Por favor, selecciona una opción válida.");
                mainMenu();
                break;
        }
    });
}

// readJSON()
//     .then(using_nodes => {
//       console.log('nodes:', using_nodes);

//         let uniqueNodes = Array.from(new Set(using_nodes.flatMap(item => item.slice(0, 2))));
//         let costs = using_nodes.map(() => "∞");
//         let indexOfActualNode = using_nodes.indexOf(actual_node);

//         topology.forEach(([nodeA, nodeB, cost]) => {
//             let indexA = uniqueNodes.indexOf(nodeA);
//             let indexB = uniqueNodes.indexOf(nodeB);
          
//             if (indexA !== -1 && indexB !== -1) {
//               costs[indexB] = parseInt(cost, 10);
//               vecin.push(nodeB)
//             }
//             if (indexOfActualNode !== -1) {
//               costs[indexOfActualNode] = 0;
//             }
//           });

//         console.log(costs);
//         generate_matrix(using_nodes.length);
//         matrix[indexOfActualNode] = costs;
//         console.log(matrix);
        
//         vecin.forEach(item => {
//             console.log(item);
//             Spackage(actual_node,item,matrix)
//           });

//     })
//     .catch(error => {
//       console.error('Error al leer el archivo JSON:', error);
//     });


async function main(){
    await mainMenu();
}