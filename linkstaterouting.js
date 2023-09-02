class Node {
    constructor(name) {
        this.name = name;
        this.neighbors = new Map();
    }

    addNeighbor(neighborName, distance) {
        this.neighbors.set(neighborName, distance);
    }
}

class Packet {
    constructor(type, headers, payload) {
        this.type = type;
        this.headers = headers;
        this.payload = payload;
    }

    toJson() {
        return JSON.stringify({
            type: this.type,
            headers: this.headers,
            payload: this.payload,
        }, null, 2);
    }
}

class LinkStateRouting {
    constructor() {
        this.network = new Map();
        this.shortestPaths = new Map();
    }

    addNode(node) {
        this.network.set(node.name, node);
    }

    computeShortestPaths() {
        for (const node of this.network.values()) {
            const shortestPath = this.computeShortestPath(node);
            this.shortestPaths.set(node.name, shortestPath);
        }
    }

    sendPacket(sourceNode, destinationNode, hopCount, payload) {
        const headers = {
            from: sourceNode,
            to: destinationNode,
            hop_count: hopCount.toString(),
        };

        const packet = new Packet("message", headers, payload);

        console.log(`Sending packet from ${sourceNode} to ${destinationNode}`);
        console.log(packet.toJson());
        console.log();
    }

    sendMessage(sourceNode, destinationNode, message) {
        const shortestPath = this.findShortestPath(sourceNode, destinationNode);

        if (shortestPath === "No path found.") {
            console.log("No path found for sending the message.");
        } else {
            const pathNodes = shortestPath.split(" -> ");
            let hopCount = 1;

            console.log(`Sending message from ${sourceNode} to ${destinationNode} through path: ${shortestPath}`);

            for (let i = 0; i < pathNodes.length - 1; i++) {
                const currentNode = pathNodes[i];
                const nextNode = pathNodes[i + 1];

                this.sendPacket(currentNode, nextNode, hopCount, message);
                hopCount++;
            }
        }
    }

    computeShortestPath(sourceNode) {
        const pq = new PriorityQueue();
        pq.offer(new NodeDistance(sourceNode, 0));

        const distanceMap = new Map();
        distanceMap.set(sourceNode.name, 0);

        while (!pq.isEmpty()) {
            const nd = pq.poll();
            const currentNode = nd.node;
            const currentDistance = nd.distance;

            for (const [neighborName, neighborDistance] of currentNode.neighbors.entries()) {
                const newDistance = currentDistance + neighborDistance;

                if (!distanceMap.has(neighborName) || newDistance < distanceMap.get(neighborName)) {
                    distanceMap.set(neighborName, newDistance);
                    pq.offer(new NodeDistance(this.network.get(neighborName), newDistance));
                }
            }
        }

        return distanceMap;
    }

    printRoutingTable() {
        for (const node of this.network.values()) {
            console.log(`Routing table for Node ${node.name}:`);
            for (const [neighborName, neighborDistance] of node.neighbors.entries()) {
                console.log(`To Node ${neighborName} via ${neighborName}, Distance: ${this.shortestPaths.get(node.name).get(neighborName)}`);
            }
            console.log();
        }
    }

    findShortestPath(fromNode, toNode) {
        if (!this.shortestPaths.has(fromNode.name) || !this.shortestPaths.get(fromNode.name).has(toNode.name)) {
            return "No path found.";
        }

        const path = [];
        let currentNode = toNode.name;

        while (currentNode !== fromNode.name) {
            path.push(currentNode);
            currentNode = this.getPreviousNodeInPath(fromNode.name, currentNode);
        }

        path.push(fromNode.name);
        path.reverse();

        return path.join(" -> ");
    }

    getPreviousNodeInPath(sourceNode, currentNode) {
        const shortestDistance = this.shortestPaths.get(sourceNode.name).get(currentNode);
        let previousNode = null;

        for (const [neighborName, neighborDistance] of this.shortestPaths.get(sourceNode.name).entries()) {
            if (currentNode.neighbors.has(neighborName) && neighborDistance + currentNode.neighbors.get(neighborName) === shortestDistance) {
                previousNode = neighborName;
                break;
            }
        }

        return previousNode;
    }
}

class NodeDistance {
    constructor(node, distance) {
        this.node = node;
        this.distance = distance;
    }
}

class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    offer(item) {
        this.queue.push(item);
        this.queue.sort((a, b) => a.distance - b.distance);
    }

    poll() {
        return this.queue.shift();
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}

const router = new LinkStateRouting();

const nodeA = new Node("A");
const nodeB = new Node("B");
const nodeC = new Node("C");
const nodeD = new Node("D");
const nodeE = new Node("E");
const nodeF = new Node("F");

nodeA.addNeighbor("B", 1);
nodeA.addNeighbor("C", 2);

nodeB.addNeighbor("A", 1);
nodeB.addNeighbor("C", 3);
nodeB.addNeighbor("D", 4);

nodeC.addNeighbor("A", 2);
nodeC.addNeighbor("B", 3);
nodeC.addNeighbor("D", 2);
nodeC.addNeighbor("E", 5);

nodeD.addNeighbor("B", 4);
nodeD.addNeighbor("C", 2);
nodeD.addNeighbor("E", 1);

nodeE.addNeighbor("C", 5);
nodeE.addNeighbor("D", 1);
nodeE.addNeighbor("F", 3);

nodeF.addNeighbor("E", 3);

router.addNode(nodeA);
router.addNode(nodeB);
router.addNode(nodeC);
router.addNode(nodeD);
router.addNode(nodeE);
router.addNode(nodeF);

router.computeShortestPaths();
router.printRoutingTable();

const sourceNode = nodeA;
const destinationNode = nodeF;
const message = "Hola mundo";

router.sendMessage(sourceNode, destinationNode, message);
