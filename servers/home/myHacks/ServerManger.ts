import { Server } from "NetscriptDefinitions";
import {
    setCurrentRam,
    setMaxRam,
    setMaxServers,
    setServerCount,
} from "./state/ServerManager/ServerManagerSlice";
import { store } from "./state/store";

export interface Servers {
    [name: string]: Server;
}

export class ServerManager {
    private ns: NS;
    private scriptMem: number = 0;
    private script = "early-hack-template.js";
    private buying = false;
    private privateServerCount = 0;
    private privateServersAtCurrentRam = 0;
    private maxPrivateServers = 0;
    private currentRamSize = 99999999999;

    constructor(ns) {
        this.ns = ns;
        this.maxPrivateServers = this.ns.getPurchasedServerLimit();
        store.dispatch(setMaxServers(this.maxPrivateServers));
        this.scriptMem = this.ns.getScriptRam(this.script);
        store.dispatch(setCurrentRam(8));
        store.dispatch(setServerCount(0));
        store.dispatch(setMaxRam(8));
        this.findAllPublicServers();
        this.findAllPrivateServers();
    }

    getPublicServers = () => {
        return this.publicServers;
    };

    getPrivateServers = () => {
        return this.privateServers;
    };

    private privateServers: Servers = {};
    private publicServers: Servers = {};

    private recursiveScan = (target: string) => {
        const neighbors = this.ns.scan(target);
        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];
            if (
                this.publicServers[neighbor] == undefined &&
                !neighbor.startsWith("pserv") &&
                neighbor !== "home"
            ) {
                this.publicServers[neighbor] = this.ns.getServer(neighbor);
                this.recursiveScan(neighbor);
            }
        }
    };

    private findAllPublicServers = () => {
        this.recursiveScan("home");
    };

    private findAllPrivateServers = () => {
        const privateServers = this.ns.getPurchasedServers();
        this.privateServerCount = privateServers.length;
        privateServers.forEach((server) => {
            if (this.privateServers[server] === undefined) {
                this.privateServers[server] = this.ns.getServer(server);
            }
            if (this.privateServers[server].maxRam < this.currentRamSize) {
                this.currentRamSize = this.privateServers[server].maxRam;
            }
        });
        Object.entries(this.privateServers).forEach(([hostname, server]) => {
            if (server.maxRam >= this.currentRamSize) {
                this.privateServersAtCurrentRam++;
            }
        });
        const ramSize = store.getState().servermanager.MaxRam;
        if (
            this.privateServersAtCurrentRam === this.maxPrivateServers &&
            this.currentRamSize < ramSize
        ) {
            this.privateServersAtCurrentRam = 0;
            this.currentRamSize = this.currentRamSize * 2;
        }
        this.ns.printf("Current Ram Size %d", this.currentRamSize);
        store.dispatch(setCurrentRam(this.currentRamSize));
        this.ns.printf(
            "Writing server count to port %d",
            this.privateServersAtCurrentRam
        );
        store.dispatch(setServerCount(this.privateServersAtCurrentRam));
    };

    prepServer = (target: Server) => {
        if (!target.hasAdminRights) {
            if (
                target.numOpenPortsRequired !== undefined &&
                target.numOpenPortsRequired >= 5 &&
                target.hostname !== "home" &&
                !target.hostname.startsWith("pserv")
            ) {
                this.ns.sqlinject(target.hostname);
            }
            if (
                target.numOpenPortsRequired !== undefined &&
                target.numOpenPortsRequired >= 4 &&
                target.hostname !== "home" &&
                !target.hostname.startsWith("pserv")
            ) {
                this.ns.httpworm(target.hostname);
            }
            if (
                target.numOpenPortsRequired !== undefined &&
                target.numOpenPortsRequired >= 3 &&
                target.hostname !== "home" &&
                !target.hostname.startsWith("pserv")
            ) {
                this.ns.relaysmtp(target.hostname);
            }
            if (
                target.numOpenPortsRequired !== undefined &&
                target.numOpenPortsRequired >= 2 &&
                target.hostname !== "home" &&
                !target.hostname.startsWith("pserv")
            ) {
                this.ns.ftpcrack(target.hostname);
            }
            if (
                target.numOpenPortsRequired !== undefined &&
                target.numOpenPortsRequired >= 1 &&
                target.hostname !== "home" &&
                !target.hostname.startsWith("pserv")
            ) {
                this.ns.brutessh(target.hostname);
            }
            if (
                target.hostname !== "home" &&
                !target.hostname.startsWith("pserv")
            ) {
                this.ns.nuke(target.hostname);
            }
        }
        if (target.hostname !== "home") {
            this.ns.scp(this.script, target.hostname);
        }

        const numThreads = Math.floor(
            (target.maxRam - target.ramUsed) / this.scriptMem
        );

        if (numThreads > 0) {
            this.ns.exec(this.script, target.hostname, numThreads);
        }
    };

    prepHome = () => {
        const target = this.ns.getServer("home");
        const numThreads = Math.floor(
            ((target.maxRam - target.ramUsed) / this.scriptMem) * 0.8
        );
        if (numThreads > 0) {
            this.ns.exec(this.script, target.hostname, numThreads);
        }
    };

    buyServers = () => {
        this.buying = !this.buying;
    };
    isBuying = () => {
        return this.buying;
    };

    private purchaseServers = () => {
        const ram = 8;
        this.currentRamSize = 8;
        if (
            this.ns.getServerMoneyAvailable("home") >
            this.ns.getPurchasedServerCost(ram)
        ) {
            const hostname = this.ns.purchaseServer(
                "pserv-" + this.privateServerCount,
                ram
            );
            this.privateServerCount++;
            this.privateServersAtCurrentRam++;
            store.dispatch(setServerCount(this.privateServersAtCurrentRam));
            this.privateServers[hostname] = this.ns.getServer(hostname);
        }
    };

    private upgradeServers = () => {
        const [ramSize, maxRamSize] = this.getCurrentRamStep();
        const serverCount = store.getState().servermanager.ServerCount;
        if (ramSize <= maxRamSize && serverCount < this.maxPrivateServers) {
            Object.entries(this.privateServers).forEach(
                ([hostname, server]) => {
                    if (server.maxRam < ramSize) {
                        const upgradeCost =
                            this.ns.getPurchasedServerUpgradeCost(
                                hostname,
                                ramSize
                            );
                        if (
                            this.ns.getServerMoneyAvailable("home") >
                            upgradeCost
                        ) {
                            this.ns.upgradePurchasedServer(hostname, ramSize);
                            this.privateServersAtCurrentRam++;
                            store.dispatch(
                                setServerCount(this.privateServersAtCurrentRam)
                            );
                            this.privateServers[hostname] =
                                this.ns.getServer(hostname);
                            this.ns.scriptKill(this.script, hostname);
                            this.prepServer(this.ns.getServer(hostname));
                        }
                    }
                }
            );
        }
    };

    getCurrentRamStep = () => {
        let maxRamSize = store.getState().servermanager.MaxRam;
        let currentRamSize = maxRamSize;
        Object.entries(this.privateServers).forEach(([hostname, server]) => {
            if (server.maxRam < currentRamSize) {
                currentRamSize = server.maxRam;
            }
        });
        let atRamSize = 0;
        Object.entries(this.privateServers).forEach(([hostname, server]) => {
            if (server.maxRam >= currentRamSize) {
                atRamSize++;
            }
        });
        if (
            atRamSize === this.maxPrivateServers &&
            currentRamSize < maxRamSize
        ) {
            currentRamSize *= 2;
            atRamSize = 0;
            Object.entries(this.privateServers).forEach(
                ([hostname, server]) => {
                    if (server.maxRam == currentRamSize) {
                        atRamSize++;
                    }
                }
            );
        }
        if (this.currentRamSize != currentRamSize) {
            this.currentRamSize = currentRamSize;
            this.privateServersAtCurrentRam = atRamSize;
            store.dispatch(setCurrentRam(this.currentRamSize));
            store.dispatch(setServerCount(this.privateServersAtCurrentRam));
        }
        return [currentRamSize, maxRamSize];
    };

    getMaxServers = () => {
        return this.maxPrivateServers;
    };
    getAtRam = () => {
        return this.privateServersAtCurrentRam;
    };
    getRamSize = () => {
        return this.currentRamSize;
    };

    processServerActivity = () => {
        if (this.buying) {
            if (this.privateServerCount < this.maxPrivateServers) {
                this.purchaseServers();
                this.getCurrentRamStep();
            } else {
                this.upgradeServers();
            }
        } else {
            const maxRamSize = store.getState().servermanager.MaxRam;
            if (this.currentRamSize !== maxRamSize) {
                this.ns.printf("Updating ram size");
                this.getCurrentRamStep();
            }
        }
    };
}
