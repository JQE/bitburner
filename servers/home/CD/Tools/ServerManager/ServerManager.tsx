import React from "react";
import { TailModal } from "servers/home/Utils/TailModal";
import { ServerControl } from "../../Components/ServerControl";
import { ServerInfo, ServerStage } from "../../types";
import { SERVERPORT } from "../../Constants";

export async function main(ns: NS) {
    ns.disableLog("ALL");

    let size = 8;
    let currentSize = 99999999999;
    let max = ns.getPurchasedServerLimit();
    let servers = ns.getPurchasedServers();
    let count = servers.length;
    let atRam = 0;
    let maxRam = ns.getPurchasedServerMaxRam();
    let running = true;
    let lastMessage = "";

    const countAtRam = () => {
        let tempAtRam = 0;
        servers.forEach((server) => {
            const info = ns.getServer(server);
            if (info.maxRam >= currentSize) {
                tempAtRam++;
            }
        });

        return tempAtRam;
    };

    atRam = count;
    if (count >= max) {
        atRam = 0;
        servers.forEach((server) => {
            const info = ns.getServer(server);
            if (info.maxRam < currentSize) {
                currentSize = info.maxRam;
            }
        });
        atRam = countAtRam();
        while (atRam === count && currentSize < maxRam) {
            currentSize *= 2;
            atRam = countAtRam();
        }
    }
    size = currentSize;
    if (size === 99999999999) size = 8;
    if (currentSize === 99999999999) currentSize = 8;

    const purchaseServers = () => {
        if (count >= max) {
            ns.print("Too many servers");
            return;
        }
        let cost = ns.getPurchasedServerCost(8);
        if (cost < ns.getServerMoneyAvailable("home")) {
            let hostname = ns.purchaseServer(`pserver-${count}`, 8);
            if (hostname !== "") {
                //ns.printf("Purchasing server %s", hostname);
                lastMessage = `Purchasing ${hostname}`;
                count++;
                atRam++;
                servers.push(hostname);
            }
        }
        return cost;
    };

    const upgradeServers = () => {
        let cost;
        if (atRam >= count) {
            currentSize *= 2;
            if (currentSize > size) {
                currentSize = size;
            }
            atRam = countAtRam();
        }
        const server = servers[atRam];
        if (server === undefined) {
            ns.print(`Invalid server ${atRam}`);
            return;
        }
        cost = ns.getPurchasedServerUpgradeCost(server, currentSize);
        if (ns.getServerMoneyAvailable("home") > cost) {
            if (ns.upgradePurchasedServer(server, currentSize)) {
                atRam++;
                lastMessage = `Upgraded ${server}`;
            } else {
                lastMessage = `Failed to upgrade server ${server} to ${currentSize}`;
            }
        }
        return cost;
    };

    while (running) {
        let cost;
        const serverInfo: ServerInfo = JSON.parse(ns.peek(SERVERPORT));
        size = serverInfo.MaxSize;
        if (count === max && atRam === count && currentSize === size) {
            serverInfo.Stage = ServerStage.Capacity;
        } else {
            if (count < max) {
                serverInfo.Stage = ServerStage.Buying;
                cost = purchaseServers();
            } else {
                serverInfo.Stage = ServerStage.Upgrading;
                if (atRam === count) {
                    currentSize *= 2;
                    if (currentSize > size) {
                        currentSize = size;
                        serverInfo.Stage = ServerStage.Capacity;
                    } else {
                        atRam = countAtRam();
                    }
                }
                if (currentSize <= size) {
                    serverInfo.Stage = ServerStage.Upgrading;
                    cost = upgradeServers();
                }
            }
        }
        serverInfo.Message = lastMessage;
        serverInfo.CurrentSize = currentSize;
        serverInfo.AtRam = atRam;
        serverInfo.Max = max;
        serverInfo.Cost = cost;
        ns.clearPort(SERVERPORT);
        ns.writePort(SERVERPORT, JSON.stringify(serverInfo));

        await ns.asleep(1000);
    }
}
