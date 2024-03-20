import { NS, ScriptArg } from "NetscriptDefinitions";
import { ServerUtils } from "./ServerUtils";
import { WORKERS } from "servers/home/Constants";
import { RamNet } from "./Batching/RamNet";
import { Metrics } from "./Batching/Metrics";
import { ContinuousBatcher } from "./Batching/ContinuousBatcher";
import { PrivateServers } from "./PrivateServers/PrivateServers";
import { store } from "servers/home/state/store";
import {
    setBuying,
    setHackType,
    setHacking,
    setTarget,
} from "servers/home/state/ServerManager/ServerManagerSlice";

export class ServerManager {
    private ns: NS;
    private servers: string[] = [];
    private utils: ServerUtils;
    private toolCount: number = 0;
    private batcher: ContinuousBatcher;
    private privateServers: PrivateServers;
    private script: string = "early-hack-template.js";
    private scriptMem: number = 0;

    constructor(ns: NS) {
        this.ns = ns;
        this.scriptMem = this.ns.getScriptRam(this.script);
        this.utils = new ServerUtils(ns);
        this.privateServers = new PrivateServers(ns);
        store.dispatch(setHackType(0));
        store.dispatch(setBuying(false));
        store.dispatch(setHacking(false));
        this.ProcessServers();
    }

    GetPublicServers = () => {
        return this.servers;
    };

    Hack = () => {
        store.dispatch(setHacking(true));
    };

    EndHack = () => {
        store.dispatch(setHacking(false));
    };

    Buy = () => {
        store.dispatch(setBuying(true));
    };
    EndBuy = () => {
        store.dispatch(setBuying(false));
    };

    updateToolCount = () => {
        if (this.toolCount === 5) {
            return false;
        }
        let newCount = 0;
        if (this.ns.fileExists("BruteSSH.exe")) {
            newCount++;
        }
        if (this.ns.fileExists("FTPCrack.exe")) {
            newCount++;
        }
        if (this.ns.fileExists("relaySMTP.exe")) {
            newCount++;
        }
        if (this.ns.fileExists("HTTPWorm.exe")) {
            newCount++;
        }
        if (this.ns.fileExists("SQLInject.exe")) {
            newCount++;
        }

        if (newCount !== this.toolCount) {
            this.toolCount = newCount;
            return true;
        }
        return false;
    };

    ProcessServers = () => {
        const newServers = this.utils.getServers((server) => {
            this.utils.copyScripts(server, WORKERS, true);
            this.utils.copyScripts(server, [this.script], true);
            return this.utils.nukeTarget(server, this.toolCount);
        });
        this.servers = newServers;
    };

    UpdateTarget = () => {
        this.servers.forEach((server) => {
            store.dispatch(
                setTarget(
                    this.utils.checkTarget(
                        server,
                        store.getState().servermanager.Target,
                        this.ns.fileExists("Formulas.exe", "home")
                    )
                )
            );
        });
    };

    BasicServerHack = (server) => {
        const maxRam = this.ns.getServerMaxRam(server);
        const ramUsed = this.ns.getServerUsedRam(server);
        const numThreads = Math.floor((maxRam - ramUsed) / this.scriptMem);

        if (numThreads > 0) {
            this.ns.exec(this.script, server, numThreads);
        }
    };

    HackServer = (server: string) => {
        if (
            store.getState().servermanager.Hacking &&
            store.getState().servermanager.HackType !== 2
        ) {
            this.ns.kill(this.script, server);
            this.BasicServerHack(server);
        }
    };

    startBatch = async () => {
        const dataPort = this.ns.getPortHandle(this.ns.pid);
        dataPort.clear();
        this.ns.print(`Target: ${store.getState().servermanager.Target}`);
        const ramNet = new RamNet(this.ns, this.servers);
        const metrics = new Metrics(
            this.ns,
            this.utils,
            store.getState().servermanager.Target
        );

        if (!this.utils.isPrepped(store.getState().servermanager.Target))
            await this.utils.prep(metrics, ramNet);
        this.ns.clearLog();
        this.ns.print("Optimizing. This may take a few seconds...");

        // Optimizer has changed again. Back to being synchronous, since the performance is much better.
        await this.utils.optimizePeriodic(metrics, ramNet);
        metrics.calculate();

        // Create and run our batcher.
        this.batcher = new ContinuousBatcher(
            this.ns,
            metrics,
            ramNet,
            this.utils
        );
        await this.batcher.run();
    };

    stopBatch = () => {
        this.batcher.end();
        this.batcher = undefined;
    };

    StartHacking = async () => {
        store.dispatch(setHacking(true));
        switch (store.getState().servermanager.HackType) {
            case 0:
            case 2:
                this.servers.forEach((server) => {
                    this.HackServer(server);
                });
                break;
            case 1:
                await this.startBatch();
                break;
        }
    };

    StopHacking = async () => {
        store.dispatch(setHacking(false));
        if (store.getState().servermanager.HackType === 2) {
            this.stopBatch();
        }
        this.servers.forEach((server) => {
            if (server !== "home") {
                this.ns.killall(server);
            } else {
                this.ns.ps(server).forEach((script) => {
                    if (script.filename !== "beeOs.js") {
                        this.ns.kill(script.filename, server, ...script.args);
                    }
                });
            }
        });
    };

    processActivity = () => {
        this.ProcessServers();
        if (store.getState().servermanager.Buying) {
            if (this.privateServers.GetCount() < this.privateServers.GetMax()) {
                this.privateServers.PurchaseServers();
            } else {
                this.privateServers.UpgradeServers().forEach((server) => {
                    if (store.getState().servermanager.Hacking) {
                        this.HackServer(server);
                    }
                });
            }
        }
        if (this.updateToolCount()) {
            this.ProcessServers();
            if (
                store.getState().servermanager.HackType !== 2 &&
                store.getState().servermanager.Hacking
            ) {
                this.servers.forEach((server) => {
                    this.HackServer(server);
                });
            }
        }
    };
}
