import { Server } from "NetscriptDefinitions";
import {
    setCurrentRam,
    setMaxRam,
    setMaxServers,
    setServerCount,
} from "./state/ServerManager/ServerManagerSlice";
import { store } from "./state/store";

export interface Servers {
    name: string;
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

    private privateServers: string[] = [];
    private publicServers: string[] = [];

    private recursiveScan = (target: string) => {
        if (this.publicServers.includes(target)) return;
        if (target.startsWith("pserv")) return;
        this.publicServers.push(target);
        const connectedNodes = this.ns.scan(target);
        for (const node of connectedNodes)
            if (node !== "Home" && !node.startsWith("pserv")) {
                this.recursiveScan(node);
            }
    };

    private findAllPublicServers = () => {
        this.recursiveScan("home");
    };

    private findAllPrivateServers = () => {
        const privateServers = this.ns.getPurchasedServers();
        this.privateServerCount = privateServers.length;
        privateServers.forEach((server) => {
            if (!this.privateServers.includes(server)) {
                this.privateServers.push(server);
            }
            const maxRam = this.ns.getServerMaxRam(server);
            if (maxRam < this.currentRamSize) {
                this.currentRamSize = maxRam;
            }
        });
        this.privateServers.forEach((server) => {
            const maxRam = this.ns.getServerMaxRam(server);
            if (maxRam >= this.currentRamSize) {
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

    prepServer = (target: string, hacking = false) => {
        if (this.ns.hasRootAccess(target) === false) {
            const portCount = this.ns.getServerNumPortsRequired(target);
            if (portCount >= 5) {
                this.ns.sqlinject(target);
            }
            if (portCount >= 4) {
                this.ns.httpworm(target);
            }
            if (portCount >= 3) {
                this.ns.relaysmtp(target);
            }
            if (portCount >= 2) {
                this.ns.ftpcrack(target);
            }
            if (portCount >= 1) {
                this.ns.brutessh(target);
            }
            this.ns.nuke(target);
        }
        if (target !== "home") {
            this.ns.scp(this.script, target);
        }
        if (hacking) {
            const maxRam = this.ns.getServerMaxRam(target);
            const ramUsed = this.ns.getServerUsedRam(target);
            const numThreads = Math.floor((maxRam - ramUsed) / this.scriptMem);

            if (numThreads > 0) {
                this.ns.exec(this.script, target, numThreads);
            }
        }
    };

    prepHome = () => {
        const maxRam = this.ns.getServerMaxRam("home");
        const ramUsed = this.ns.getServerUsedRam("home") + 16;
        const numThreads = Math.floor((maxRam - ramUsed) / this.scriptMem);
        if (numThreads > 0) {
            this.ns.exec(this.script, "home", numThreads);
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
            this.privateServers.forEach((server) => {
                const maxRam = this.ns.getServerMaxRam(server);
                if (maxRam < ramSize) {
                    const upgradeCost = this.ns.getPurchasedServerUpgradeCost(
                        server,
                        ramSize
                    );
                    if (this.ns.getServerMoneyAvailable("home") > upgradeCost) {
                        this.ns.upgradePurchasedServer(server, ramSize);
                        this.privateServersAtCurrentRam++;
                        store.dispatch(
                            setServerCount(this.privateServersAtCurrentRam)
                        );
                        this.ns.scriptKill(this.script, server);
                        this.prepServer(server);
                    }
                }
            });
        }
    };

    getCurrentRamStep = () => {
        let maxRamSize = store.getState().servermanager.MaxRam;
        let currentRamSize = maxRamSize;
        this.privateServers.forEach((server) => {
            const maxRam = this.ns.getServerMaxRam(server);
            if (maxRam < currentRamSize) {
                currentRamSize = maxRam;
            }
        });
        let atRamSize = 0;
        this.privateServers.forEach((server) => {
            const maxRam = this.ns.getServerMaxRam(server);
            if (maxRam >= currentRamSize) {
                atRamSize++;
            }
        });
        if (
            atRamSize === this.maxPrivateServers &&
            currentRamSize < maxRamSize
        ) {
            currentRamSize *= 2;
            atRamSize = 0;
            this.privateServers.forEach((server) => {
                const maxRam = this.ns.getServerMaxRam(server);
                if (maxRam == currentRamSize) {
                    atRamSize++;
                }
            });
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
                this.getCurrentRamStep();
            }
        }
    };
}
