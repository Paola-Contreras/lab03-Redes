const readline = require('readline');
const fs = require('fs');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
      const data = fs.readFileSync('topologia.json', 'utf8');
      this.topologia = JSON.parse(data);
    } catch (err) {
      this.topologia = {};
    }
  }

  saveTopology() {
    const data = JSON.stringify(this.topologia, null, 2);
    fs.writeFileSync('topologia.json', data, 'utf8');
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

      for (const v of this.topologia[u]) {
        const alt = this.distancias[u] + v[1];
        if (alt < this.distancias[v[0]]) {
          this.distancias[v[0]] = alt;
          this.anterior[v[0]] = u;
        }
      }
    }

    for (const node in this.anterior) {
      if (this.anterior[node] !== null) {
        const path = this.camino(node);
        this.tabla_enrutamiento[node] = [path, this.distancias[node]];
      }
    }
  }
}

const node = new LinkState();
let opcion = '0';

function main() {
  console.log("\n1. Enviar mensaje");
  console.log("2. Recibir mensaje");
  console.log("3. Agregar relación a la topología");
  console.log("4. Mostrar tabla de nodos con sus pesos"); // Nueva opción
  console.log("5. Salir");

  rl.question(">> ", (respuesta) => {
    opcion = respuesta;

    if (opcion === "1") {
      rl.question("Mensaje:\n>> ", (mensaje) => {
        rl.question("Destino:\n>> ", (destino) => {
          const siguiente = node.siguienteNodo(destino);
          console.log("Mensaje:", mensaje);
          console.log("Siguiente nodo:", siguiente);
          main();
        });
      });
    } else if (opcion === "2") {
      rl.question("Ingrese el emisor:\n>> ", (emisor) => {
        rl.question("Ingrese el receptor:\n>> ", (receptor) => {
          rl.question("Ingrese el mensaje:\n>> ", (mensaje) => {
            node.recibirMensaje(emisor, receptor, mensaje);
            main();
          });
        });
      });
    } else if (opcion === "3") { 
      rl.question("Primer nodo:\n>> ", (nodo1) => {
        rl.question("Segundo nodo:\n>> ", (nodo2) => {
          rl.question("Peso de la relación:\n>> ", (peso) => {
            node.agregarRelacion(nodo1, nodo2, parseInt(peso));
            main();
          });
        });
      });
    } else if (opcion === "4") {
      node.mostrarTablaNodos(); // Mostrar tabla de nodos con sus pesos
      main();
    } else if (opcion === "5") {
      rl.close();
    } else {
      console.log("Opción no válida. Intente de nuevo.");
      main();
    }
  });
}

main();