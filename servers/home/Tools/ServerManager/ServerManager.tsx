import React from "react";
import { TailModal } from "servers/home/Utils/TailModal";
import { ServerControl } from "./Components/ServerControl";

export async function main(ns: NS) {
    /** Alias for document to prevent excessive RAM use */
    const doc = (0, eval)("document") as Document;
    ns.disableLog("ALL");
    ns.tail();

    let buying = false;
    let size = 8;
    let currentSize = 99999999999;
    let max = ns.getPurchasedServerLimit();
    let servers = ns.getPurchasedServers();
    let count = servers.length;
    let atRam = 0;
    let maxRam = ns.getPurchasedServerMaxRam();
    let running = true;

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

    let ramSizes = [];
    for (let i = size; i <= maxRam; i *= 2) {
        ramSizes.push(i);
    }

    const tm = new TailModal(ns, doc);

    const onBuy = (): boolean => {
        buying = !buying;
        return buying;
    };

    const onSize = (newSize: number): number => {
        size = newSize;
        return size;
    };

    tm.renderCustomModal(
        <ServerControl
            ns={ns}
            onBuy={onBuy}
            defaultBuy={buying}
            sizeList={ramSizes}
            onSize={onSize}
            defaultSize={size}
        ></ServerControl>,
        "Server Control Panel",
        300
    );

    const purchaseServers = () => {
        if (count >= max) {
            ns.print("Too many servers");
            return;
        }
        let cost = ns.getPurchasedServerCost(8);
        if (cost < ns.getServerMoneyAvailable("home")) {
            let hostname = ns.purchaseServer(`pserver-${count}`, 8);
            if (hostname !== "") {
                ns.printf("Purchasing server %s", hostname);
                count++;
                atRam++;
            }
        }
        return cost;
    };

    const upgradeServers = () => {
        let cost;
        if (atRam >= count) {
            currentSize *= 2;
            atRam = countAtRam();
        }
        const server = servers[atRam];
        if (server === undefined) {
            ns.print(`Invalid server ${atRam}`);
            return;
        }
        cost = ns.getPurchasedServerUpgradeCost(server, currentSize);
        if (ns.getServerMoneyAvailable("home") > cost) {
            ns.upgradePurchasedServer(server, currentSize);
            atRam++;
        }
        return cost;
    };
    ns.atExit(() => {
        ns.closeTail();
    });

    while (running) {
        let cost;
        if (buying) {
            if (count < max) {
                cost = purchaseServers();
            } else {
                if (atRam === count) {
                    currentSize *= 2;
                    atRam = countAtRam();
                }
                if (currentSize <= size) {
                    cost = upgradeServers();
                }
            }
        }
        ns.clearLog();
        ns.print(`Buying Servers: ${buying}`);
        ns.print(
            `Size: ${currentSize}gb /${size}gb ${atRam}/${max} ${
                cost !== undefined ? `Cost: ${ns.formatNumber(cost, 2)}` : ""
            }`
        );
        await ns.asleep(1000);
    }
}
