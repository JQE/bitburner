import { Server } from "NetscriptDefinitions";
import {
    SetCurrentRam,
    SetMaxRam,
    SetMaxServers,
    SetServerCount,
    SetAtRam,
    SetTarget,
    SetBuying,
    SetHacking,
    SetShareValue,
} from "./state/ServerManager/ServerManagerSlice";
import { store } from "./state/store";
import { RamNet } from "./batching/RamNet";
import { Metrics } from "./batching/Metrics";
import { ServerUtils } from "./batching/ServerUtils";
import { WORKERS } from "./batching/Constants";
import { ContinuousBatcher } from "./batching/ContinuousBatcher";
import { SHARE_PORT, TARGET_PORT } from "./Constants";

export interface Servers {
    name: string;
}

export class ServerManager {
    private ns: NS;
    private scriptMem: number = 0;
    private script = "early-hack-template.js";
    private numTools: number = 0;
    private initialized: boolean = false;
    private batcher: ContinuousBatcher;
    private isHacking: boolean = false;
    private utils: ServerUtils;

    constructor(ns) {
        this.ns = ns;
        this.utils = new ServerUtils(ns);
        store.dispatch(SetMaxServers(this.ns.getPurchasedServerLimit()));
        this.scriptMem = this.ns.getScriptRam(this.script);
        const pmax = this.ns.getPurchasedServerMaxRam();
        store.dispatch(SetCurrentRam(pmax));
        store.dispatch(SetServerCount(0));
        store.dispatch(SetMaxRam(8));
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
        this.privateServers = this.ns.getPurchasedServers();
        store.dispatch(SetServerCount(this.privateServers.length));
        if (this.privateServers.length === 0) {
            store.dispatch(SetAtRam(0));
            store.dispatch(SetCurrentRam(8));
        } else {
            this.privateServers.forEach((server) => {
                const maxRam = this.ns.getServerMaxRam(server);
                if (maxRam < store.getState().servermanager.CurrentRam) {
                    store.dispatch(SetCurrentRam(maxRam));
                }
            });

            if (
                store.getState().servermanager.Count >=
                    store.getState().servermanager.Max &&
                store.getState().servermanager.CurrentRam <
                    store.getState().servermanager.MaxRam
            ) {
                store.dispatch(
                    SetCurrentRam(store.getState().servermanager.CurrentRam * 2)
                );
                let atRam = 0;
                this.privateServers.forEach((server) => {
                    const maxRam = this.ns.getServerMaxRam(server);
                    if (maxRam >= store.getState().servermanager.CurrentRam) {
                        atRam++;
                    }
                });
                store.dispatch(SetAtRam(atRam));
            }
        }
        this.ns.printf(
            "Current Ram Size %d",
            store.getState().servermanager.CurrentRam
        );
    };

    private prepServer = (target: string, hacking = false) => {
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

    private prepHome = () => {
        const maxRam = this.ns.getServerMaxRam("home");
        const ramUsed = this.ns.getServerUsedRam("home") + 16;
        const numThreads = Math.floor((maxRam - ramUsed) / this.scriptMem);
        if (numThreads > 0) {
            this.ns.exec(this.script, "home", numThreads);
        }
    };

    private HackServers = async () => {
        const hack = store.getState().servermanager.Hacking;
        this.ns.print(`Killing all processes`);
        this.killAll(true);
        this.ns.clearPort(TARGET_PORT);
        this.ns.writePort(TARGET_PORT, store.getState().servermanager.Target);
        if (hack === true) {
            if (store.getState().servermanager.HackType < 2) {
                if (store.getState().servermanager.HackType === 1) {
                    this.ns.clearPort(SHARE_PORT);
                    this.ns.writePort(SHARE_PORT, "true");
                } else {
                    this.ns.clearPort(SHARE_PORT);
                    this.ns.writePort(SHARE_PORT, "false");
                }
                if (this.initialized === false) {
                    this.initialize();
                } else {
                    await this.hackServers();
                }
            } else {
                await this.startBatch();
            }
        } else {
            this.ns.print(`Stopping batch`);
            await this.stopBatch();
        }
    };

    private purchaseServers = () => {
        let count = store.getState().servermanager.Count;
        if (
            this.ns.getServerMoneyAvailable("home") >
            this.ns.getPurchasedServerCost(8)
        ) {
            const hostname = this.ns.purchaseServer("pserv-" + count, 8);
            if (hostname !== "") {
                count++;
                store.dispatch(SetServerCount(count));
                store.dispatch(SetAtRam(count));
                this.privateServers.push(hostname);
            }
        }
    };

    private upgradeServers = () => {
        const [ramSize, maxRamSize] = this.getCurrentRamStep();
        this.ns.print(`Ram: ${ramSize} Max: ${maxRamSize}`);
        const max = store.getState().servermanager.Count;
        let atRam = store.getState().servermanager.AtRam;
        this.ns.print(`Count: ${max} AtRam: ${atRam}`);
        if (ramSize <= maxRamSize && atRam < max) {
            this.privateServers.forEach((server) => {
                const maxRam = this.ns.getServerMaxRam(server);
                if (maxRam < ramSize) {
                    const upgradeCost = this.ns.getPurchasedServerUpgradeCost(
                        server,
                        ramSize
                    );
                    if (this.ns.getServerMoneyAvailable("home") > upgradeCost) {
                        this.ns.upgradePurchasedServer(server, ramSize);
                        atRam++;
                        this.ns.scriptKill(this.script, server);
                        this.prepServer(server);
                    }
                }
            });
            store.dispatch(SetAtRam(atRam));
        }
    };

    private getCurrentRamStep = () => {
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
            atRamSize === store.getState().servermanager.Max &&
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
            store.dispatch(SetCurrentRam(currentRamSize));
            store.dispatch(SetAtRam(atRamSize));
        }
        return [currentRamSize, maxRamSize];
    };

    private countTools = (): number => {
        let numTools = 0;
        if (this.ns.fileExists("BruteSSH.exe")) {
            numTools++;
        }
        if (this.ns.fileExists("FTPCrack.exe")) {
            numTools++;
        }
        if (this.ns.fileExists("relaySMTP.exe")) {
            numTools++;
        }
        if (this.ns.fileExists("HTTPWorm.exe")) {
            numTools++;
        }
        if (this.ns.fileExists("SQLInject.exe")) {
            numTools++;
        }
        return numTools;
    };

    private checkTools = () => {
        const newToolCount = this.countTools();
        if (newToolCount !== this.numTools) {
            this.numTools = newToolCount;
            return true;
        }
        return false;
    };

    private hackServers = () => {
        this.ns.printf("Hacking servers.");
        const servers = this.getPublicServers();
        const pservers = this.getPrivateServers();
        servers.forEach((server) => {
            const numOpenPortsRequired =
                this.ns.getServerNumPortsRequired(server);
            if (numOpenPortsRequired <= this.numTools) {
                this.prepServer(server, true);
            }
        });
        pservers.forEach((server) => {
            this.prepServer(server, true);
        });
        this.prepHome();
    };

    private initialize = () => {
        this.numTools = this.countTools();
        this.hackServers();
        this.initialized = true;
    };

    killAll = (includeHome: boolean = false) => {
        const servers = this.getPublicServers();
        servers.forEach((server) => {
            if (server !== "home") {
                this.ns.killall(server);
            }
        });
        const pservers = this.getPrivateServers();
        pservers.forEach((server) => {
            this.ns.killall(server);
        });
        if (includeHome) {
            this.ns.ps("home").forEach((service) => {
                if (service.filename !== "myHacks/main.js") {
                    this.ns.kill(service.filename, "home", ...service.args);
                }
            });
        }
    };

    cleanup = async () => {
        if (store.getState().servermanager.HackType === 2) {
            await this.stopBatch();
        }
        this.killAll(true);
    };

    processServerActivity = async () => {
        this.ns.clearLog();
        const serverManagerState = store.getState().servermanager;
        if (serverManagerState.Buying) {
            if (serverManagerState.Count < serverManagerState.Max) {
                this.ns.print(
                    `Buying Servers ${serverManagerState.Count} / ${serverManagerState.Max}`
                );
                this.purchaseServers();
            } else {
                this.ns.print(
                    `Upgrading Servers ${serverManagerState.Count} / ${serverManagerState.Max}`
                );
                this.upgradeServers();
            }
        }
        if (serverManagerState.Hacking) {
            if (this.checkTools()) {
                await this.HackServers();
            }
        }

        if (this.isHacking !== serverManagerState.Hacking) {
            this.ns.clearLog();
            this.ns.print(`Updating Hacking`);
            this.isHacking = serverManagerState.Hacking;
            await this.HackServers();
        }
        if (this.isHacking) {
            const target = store.getState().servermanager.Target;
            this.ns.print(
                `Hacking Server ${store.getState().servermanager.Target}`
            );
        }
        if (this.isHacking && store.getState().servermanager.HackType === 1) {
            const sharePower = this.ns.getSharePower();
            store.dispatch(SetShareValue(sharePower));
        }
    };

    private startBatch = async () => {
        this.ns.exec("/myHacks/batching/ContinuousBatcher.js", "home");
    };

    private stopBatch = async () => {
        this.ns.kill("/myHacks/batching/ContinuousBatcher.js", "home");
    };
}
