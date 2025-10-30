import { Server } from "NetscriptDefinitions";

interface Servers {
    [name:string]: Server
};

export async function main(ns: NS) {
    ns.tail();
    const servers:Servers = {};
    ns.printf("Scanning all servers");
    const recursiveScan = (target) => {
      const neighbors = ns.scan(target);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (servers[neighbor] == void 0) {
          ns.printf("Adding server %s", neighbor);
          servers[neighbor] = ns.getServer(neighbor);
          recursiveScan(neighbor);
        }
      }
    };
    recursiveScan("home");
    Object.entries(servers).forEach(([hostname, server]) => {
      if (server.hostname !== "home") {
        ns.killall(server.hostname);
      }
    });
    ns.killall("home");
  }