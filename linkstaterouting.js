const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class LinkState {
  constructor() {
    this.nombre = '';
    this.vecinos_pesos = [];
    this.tabla_enrutamiento = {};
    this.topologia = {
      'A': [['B', 4], ['C', 2]],
      'B': [['A', 4]],
      'C': [['C', 2]],
    };
    this.dijkstra();
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
  console.log("3. Salir");

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
      rl.close();
    } else {
      console.log("Opción no válida. Intente de nuevo.");
      main();
    }
  });
}

main();