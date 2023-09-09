/////////////////////////////////////////////////////////


const fs = require('fs');
const readline = require('readline');
const Server = require('./Connection');
const { xml, client } = require('@xmpp/client');

let vecin = [];
let matrix = [];
let topology = {};
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
            rl.question("Qué nodo eres: ", (node) => {
                actual_node = node;
                nodoIngresado = true;
                resolve();
            });
        } else {
            resolve();
        }
    });
}

class LinkState {
  constructor() {
    this.nombre = '';
    this.vecinos_pesos = [];
    this.tabla_enrutamiento = {};
    this.loadTopology();
    this.dijkstra();
  }

  mostrarTablaNodos() {
    console.log("Tabla de nodos con sus pesos:");
    for (const nodo in this.topologia) {
      console.log(`${nodo}:`);
      for (const relacion of this.topologia[nodo]) {
        console.log(`  -> ${relacion[0]} (Peso: ${relacion[1]})`);
      }
    }
  }
  camino(destination) {
    const path = [destination];
    while (this.anterior[destination] !== null) {
      destination = this.anterior[destination];
      path.unshift(destination);
    }
    return path;
  }

  siguienteNodo(destination) {
    const path = this.camino(destination);
    if (path.length > 1) {
      return path[1];
    }
    return path[0];
  }

  recibirMensaje(emisor, receptor, mensaje) {
    if (this.nombre === receptor) {
      console.log("Mensaje recibido:", mensaje);
    } else {
      console.log("De:", emisor);
      console.log("Manda:", mensaje);
      console.log("El siguiente nodo en el camino es:", this.siguienteNodo(receptor));
    }
  }

  loadTopology() {
    try {
        const data = fs.readFileSync(topog4, 'utf8');
        const jsonData = JSON.parse(data);
        if (jsonData.type === "topo" && jsonData.config) {
            this.topologia = jsonData.config;
        }
    } catch (err) {
        console.error(`Error al leer ${topog4}: ${err}`);
    }
}



  saveTopology() {
    const data = JSON.stringify(this.topologia, null, 2);
    fs.writeFileSync('topo-g4.txt', data, 'utf8');
  }

  agregarRelacion(nodo1, nodo2, peso) {
    if (!this.topologia[nodo1]) {
      this.topologia[nodo1] = [];
    }
    this.topologia[nodo1].push([nodo2, peso]);
    this.saveTopology();
    console.log(`Relación agregada: ${nodo1} -> ${nodo2} (Peso: ${peso})`);
  }

  dijkstra() {
    this.distancias = {};
    this.anterior = {};
    this.fila = [];

    for (const node in this.topologia) {
        if (node === this.nombre) {
            this.distancias[node] = 0;
            this.fila.push([0, node]);
        } else {
            this.distancias[node] = Infinity;
            this.fila.push([Infinity, node]);
        }
        this.anterior[node] = null;
    }

    while (this.fila.length > 0) {
        this.fila.sort((a, b) => a[0] - b[0]);
        const u = this.fila.shift()[1];

        for (const neighbor of this.topologia[u]) { // Cambio de for...of
            const v = neighbor.node;
            const alt = this.distancias[u] + neighbor.weight;
            if (alt < this.distancias[v]) {
                this.distancias[v] = alt;
                this.anterior[v] = u;
            }
          
          }  
      }
  }
}

const node = new LinkState();

async function processLogin(user, password) {
    const parts = user.split('@');
    const username = parts[0];

    console.log(`\n--- Bienvenida ${username} ---`);

    await getTopology(topog4);
    mainMenu();
}

async function getTopology(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const lines = data.split('\n');
        for (const line of lines) {
            const [node1, node2, weight] = line.split(' ');
            if (!topology[node1]) {
                topology[node1] = [];
            }
            if (!topology[node2]) {
                topology[node2] = [];
            }
            topology[node1].push({ node: node2, weight: parseFloat(weight) });
            topology[node2].push({ node: node1, weight: parseFloat(weight) });
        }
    } catch (err) {
        console.error(`Error al leer ${filePath}: ${err}`);
    }
}

function mainMenu() {
    console.log("\n--- MENU PARA SIMULAR ---");
    console.log("1. Enviar Mensaje");
    console.log("2. Recibir Mensaje");
    console.log("3. Ver Topología");
    console.log("4. Salir");

    rl.question("Ingresa tu selección: ", function (choice) {
        Choice_FuncMenu(choice);
    });
}

function Choice_FuncMenu(choice) {
    switch (choice) {
        case "1":
            // Implementa lógica para enviar mensajes
            break;
        case "2":
            // Implementa lógica para recibir mensajes
            break;
        case "3":
            console.log("Topología:");
            console.log(topology);
            mainMenu();
            break;
        case "4":
            rl.close();
            break;
        default:
            console.log("Opción no válida. Intente de nuevo.");
            mainMenu();
            break;
    }
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

async function main() {
    await ask_nodo();
    user = await get_email(namesg4, actual_node);
    await processLogin(user, password);
}

main();
