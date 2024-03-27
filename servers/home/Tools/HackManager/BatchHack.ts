import { NetscriptPort } from "NetscriptDefinitions";
import { COSTS, SCRIPTS, WORKERS } from "./BatchTool/Constants";

export class BatchHack {
    private ns: NS;
    private hackScript: string = "ShareHack.js";
    private servers: string[] = [];
    private target: string;
    private toolCount: number = -1;
    private isPrepping: boolean = false;
    private dataPort: NetscriptPort;
    private isBatching: boolean = false;
    private startingBatch: boolean = false;
    private serverIndex: number = 0;
    private runTime: number = 1200000;
    private checkTime: number = 0;
    private prepTime: number = 0;
    private totalPrepTime: number = 0;
    private prepThreadsLeft: number = 0;
    private prepServers: number = 0;
    private hackingServers = 0;
    private lastRestart = "";

    constructor(ns: NS, target: string = "joesguns") {
        this.ns = ns;
        this.target = target;
        this.dataPort = this.ns.getPortHandle(this.ns.pid);
    }

    private getServers = (
        lambdaCondition = (hostname: string) => true,
        hostname = "home",
        toolCount = 0,
        servers: string[] = [],
        visited: string[] = []
    ) => {
        if (visited.includes(hostname)) return;
        visited.push(hostname);
        if (lambdaCondition(hostname)) servers.push(hostname);
        const connectedNodes = this.ns.scan(hostname);
        if (hostname !== "home") connectedNodes.shift();
        for (const node of connectedNodes)
            this.getServers(lambdaCondition, node, toolCount, servers, visited);
        return servers;
    };

    private copyScripts = (
        server: string,
        scripts: string[],
        overwrite = false
    ) => {
        for (const script of scripts) {
            if (
                (!this.ns.fileExists(script, server) || overwrite) &&
                this.ns.hasRootAccess(server)
            ) {
                this.ns.scp(script, server);
            }
        }
    };

    private checkTarget = (server: string, target: string, forms = false) => {
        if (!this.ns.hasRootAccess(server)) return target;

        const player = this.ns.getPlayer();
        const serverSim = this.ns.getServer(server);
        const pSim = this.ns.getServer(target);

        let previousScore;
        let currentScore;

        if (serverSim.requiredHackingSkill <= player.skills.hacking / 8) {
            if (forms) {
                serverSim.hackDifficulty = serverSim.minDifficulty;
                pSim.hackDifficulty = pSim.minDifficulty;

                previousScore =
                    (pSim.moneyMax /
                        this.ns.formulas.hacking.weakenTime(pSim, player)) *
                    this.ns.formulas.hacking.hackChance(pSim, player);
                currentScore =
                    (serverSim.moneyMax /
                        this.ns.formulas.hacking.weakenTime(
                            serverSim,
                            player
                        )) *
                    this.ns.formulas.hacking.hackChance(serverSim, player);
            } else {
                const weight = (serv) => {
                    // Calculate the difference between max and available money
                    let diff = serv.moneyMax - serv.moneyAvailable;

                    // Calculate the scaling factor as the ratio of the difference to the max money
                    // The constant here is just an adjustment to fine tune the influence of the scaling factor
                    let scalingFactor = (diff / serv.moneyMax) * 0.95;

                    // Adjust the weight based on the difference, applying the scaling penalty
                    return (
                        (serv.moneyMax / serv.minDifficulty) *
                        (1 - scalingFactor)
                    );
                };
                previousScore = weight(pSim);
                currentScore = weight(serverSim);
            }
            if (currentScore > previousScore) target = server;
        }
        return target;
    };

    private nukeTarget = (server: string): boolean => {
        if (this.ns.hasRootAccess(server)) return true;

        const numPorts = this.ns.getServerNumPortsRequired(server);
        if (numPorts <= this.toolCount) {
            if (numPorts >= 5) {
                this.ns.sqlinject(server);
            }
            if (numPorts >= 4) {
                this.ns.httpworm(server);
            }
            if (numPorts >= 3) {
                this.ns.relaysmtp(server);
            }
            if (numPorts >= 2) {
                this.ns.ftpcrack(server);
            }
            if (numPorts >= 1) {
                this.ns.brutessh(server);
            }
            this.ns.nuke(server);
        }
    };

    private getToolCount = () => {
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

    private hackServers = () => {
        this.servers = this.getServers(
            (server) => {
                if (server === "home") return false;
                this.target = this.checkTarget(
                    server,
                    this.target,
                    this.ns.fileExists("Formulas.exe", "home")
                );
                this.copyScripts(server, WORKERS, true);
                this.nukeTarget(server);
                return this.ns.hasRootAccess(server);
            },
            "home",
            this.toolCount,
            ["home"]
        );
    };

    private killall = () => {
        this.servers.forEach((server) => {
            this.ns.kill(this.hackScript, server);
        });
    };

    private isPrepped = () => {
        const hasAdmin = this.ns.hasRootAccess(this.target);
        const minSec = this.ns.getServerMinSecurityLevel(this.target);
        const sec = this.ns.getServerSecurityLevel(this.target);
        const cash = this.ns.getServerMoneyAvailable(this.target);
        const maxCash = this.ns.getServerMaxMoney(this.target);
        return hasAdmin && minSec >= sec && cash >= maxCash;
    };

    private prepServer = () => {
        if (this.isPrepped() || this.isPrepping) return;
        this.isPrepping = true;

        const money = this.ns.getServerMoneyAvailable(this.target);
        const sec = this.ns.getServerSecurityLevel(this.target);
        const maxMoney = this.ns.getServerMaxMoney(this.target);
        const minSec = this.ns.getServerMinSecurityLevel(this.target);

        let wThreads1 = 0;
        let wThreads2 = 0;
        let gThreads = 0;

        let wTime;

        if (this.ns.fileExists("Formulas.exe", "home")) {
            wTime = this.ns.formulas.hacking.weakenTime(
                this.ns.getServer(this.target),
                this.ns.getPlayer()
            );
        } else {
            wTime = this.ns.getWeakenTime(this.target);
        }
        const gTime = wTime * 0.8;
        const dataPort = this.ns.getPortHandle(this.ns.pid);
        dataPort.clear();

        if (money < maxMoney) {
            gThreads = Math.ceil(
                this.ns.growthAnalyze(this.target, maxMoney / money)
            );
            wThreads2 = Math.ceil(
                this.ns.growthAnalyzeSecurity(gThreads) / 0.05
            );
        }

        if (sec > minSec) {
            wThreads1 = Math.ceil((sec - minSec) * 20);
        }

        let totalThreads = gThreads + wThreads2 + wThreads1;
        const startThreads = totalThreads;
        let serverIndex = 0;
        while (totalThreads > 0 && serverIndex < this.servers.length) {
            const server = this.servers[serverIndex];
            const ramAvail =
                this.ns.getServerMaxRam(server) -
                this.ns.getServerUsedRam(server);
            let maxThreads = Math.floor(ramAvail / 1.85);
            totalThreads -= maxThreads;
            serverIndex++;
            this.hackingServers++;
            if (wThreads1 > 0 && maxThreads > 0) {
                const w1Threads = Math.min(maxThreads, wThreads1);
                maxThreads -= w1Threads;
                wThreads1 -= w1Threads;
                const report =
                    (wThreads2 <= 0 && wThreads1 <= 0) || maxThreads <= 0;
                const w1Pid = this.ns.exec(
                    SCRIPTS.weaken1,
                    server,
                    {
                        threads: w1Threads,
                        temporary: true,
                    },
                    this.target,
                    0,
                    this.ns.pid,
                    report
                );
                if (!w1Pid)
                    throw new Error(`Failed to start weaken threads ${server}`);
                if (report) {
                    this.prepServers++;
                }
            }
            if (maxThreads > 0 && gThreads > 0) {
                const Threadsg = Math.min(maxThreads, gThreads);
                maxThreads -= Threadsg;
                gThreads -= Threadsg;
                const report = maxThreads <= 0;
                const gPid = this.ns.exec(
                    SCRIPTS.grow,
                    server,
                    {
                        threads: Threadsg,
                        temporary: true,
                    },
                    this.target,
                    wTime + 5 - gTime,
                    this.ns.pid,
                    report
                );
                if (!gPid) throw new Error("Failed to start grow threads");
                if (report) {
                    this.prepServers++;
                }
            }
            if (maxThreads > 0 && wThreads2 > 0) {
                const w2Threads = Math.min(maxThreads, wThreads2);
                maxThreads -= w2Threads;
                wThreads2 -= w2Threads;
                const report = wThreads2 <= 0 || maxThreads <= 0;
                const w2Pid = this.ns.exec(
                    SCRIPTS.weaken2,
                    server,
                    {
                        threads: w2Threads,
                        temporary: true,
                    },
                    this.target,
                    10,
                    this.ns.pid,
                    report
                );
                if (!w2Pid)
                    throw new Error(
                        `Failed to start weaken2 threads ${server} ${w2Threads}`
                    );
                if (report) {
                    this.prepServers++;
                }
            }
        }
        this.prepThreadsLeft = totalThreads;
        let basePrepTime;
        if (wThreads2 > 0) {
            basePrepTime = wTime + 10;
            this.prepTime = wTime + 10 + Date.now();
        } else {
            basePrepTime = wTime;
            this.prepTime = wTime + Date.now();
        }
        if (this.prepThreadsLeft > 0) {
            const runThreads = startThreads - totalThreads;
            const overallBatches = startThreads / runThreads;
            this.totalPrepTime = basePrepTime * overallBatches + Date.now();
        }
    };

    private runBatch = (server: string) => {
        const maxMoney = this.ns.getServerMaxMoney(this.target);

        const wTime = this.ns.getWeakenTime(this.target);
        const gTime = wTime * 0.8;
        const hTime = wTime / 4;
        const amount = maxMoney * 0.05;

        const hPercent = this.ns.hackAnalyze(server);
        const hThreads = Math.max(
            Math.floor(this.ns.hackAnalyzeThreads(server, amount)),
            1
        );
        const tGreed = hPercent * hThreads;
        const gThreads = Math.max(
            Math.ceil(
                this.ns.growthAnalyze(
                    server,
                    maxMoney / (maxMoney - maxMoney * tGreed)
                ) * 1.01
            ),
            1
        );
        const wThreads1 = Math.max(Math.ceil((hThreads * 0.002) / 0.05), 1);
        const wThreads2 = Math.max(Math.ceil((gThreads * 0.004) / 0.05), 1);

        const availRam =
            this.ns.getServerMaxRam(server) - this.ns.getServerUsedRam(server);
        const totalCost =
            hThreads * COSTS.hack +
            gThreads * COSTS.grow +
            wThreads1 * COSTS.weaken1 +
            wThreads2 * COSTS.weaken2;
        let batchCount = Math.floor(availRam / totalCost);
        if (batchCount > 0) {
            this.hackingServers++;
        }
        while (batchCount > 0) {
            batchCount--;
            this.ns.exec(
                SCRIPTS.hack,
                server,
                { threads: hThreads, temporary: true },
                this.target,
                wTime - 5 - hTime,
                this.ns.pid,
                false
            );

            this.ns.exec(
                SCRIPTS.weaken1,
                server,
                { threads: wThreads1, temporary: true },
                this.target,
                0,
                this.ns.pid,
                false
            );

            this.ns.exec(
                SCRIPTS.grow,
                server,
                { threads: gThreads, temporary: true },
                this.target,
                wTime + 5 - gTime,
                this.ns.pid,
                false
            );

            this.ns.exec(
                SCRIPTS.weaken2,
                server,
                { threads: wThreads2, temporary: true },
                this.target,
                10,
                this.ns.pid,
                batchCount <= 0
            );
        }
    };

    private startBatch = () => {
        if (this.serverIndex === this.servers.length) {
            this.startingBatch = false;
            return;
        }
        const server = this.servers[this.serverIndex];
        this.serverIndex++;
        this.runBatch(server);
    };

    private initializeBatch = () => {
        this.clearHack();
        this.isBatching = true;
        this.startingBatch = true;
        this.startBatch();
    };

    private formatTime(miliseconds) {
        let minutes = 0;
        let seconds = 0;
        if (miliseconds > 60000) {
            minutes = Math.floor(miliseconds / 60000);
            miliseconds = miliseconds - minutes * 60000;
        }
        if (miliseconds > 1000) {
            seconds = Math.floor(miliseconds / 1000);
        }
        let outputstring = "";
        if (minutes > 0) {
            outputstring += `${minutes} minutes and `;
        }
        outputstring += `${seconds} seconds`;
        return outputstring;
    }

    clearHack = () => {
        this.isBatching = false;
        this.isPrepping = false;
        this.hackingServers = 0;
        this.checkTime = 0;
        this.prepTime = 0;
        this.totalPrepTime = 0;
        this.prepServers = 0;
        this.serverIndex = 0;
        this.dataPort.clear();
    };

    processHack = async () => {
        if (!this.isPrepping && !this.isBatching && !this.startingBatch) {
            const oldTools = this.toolCount;
            this.toolCount = this.getToolCount();
            if (this.toolCount > oldTools) {
                this.killall();
                this.clearHack();
                this.hackServers();
            } else {
                let newTarget = this.target;
                this.servers.forEach((server) => {
                    newTarget = this.checkTarget(
                        server,
                        this.target,
                        this.ns.fileExists("Formulas.exe", "home")
                    );
                });
                if (newTarget !== this.target) {
                    this.target = newTarget;
                    this.killall();
                    this.clearHack();
                }
            }

            if (!this.isPrepped()) {
                this.killall();
                this.clearHack();
                this.prepServer();
            } else {
                this.initializeBatch();
            }
        }
        if (this.startingBatch) {
            this.startBatch();
        } else if (this.isBatching) {
            while (!this.dataPort.empty()) {
                const info = this.dataPort.read() as string;
                if (info.startsWith("weaken")) {
                    this.hackingServers--;
                    if (this.hackingServers <= 0) {
                        this.hackingServers = 0;
                        this.clearHack();
                    }
                }
            }
        } else if (this.isPrepping) {
            while (!this.dataPort.empty()) {
                const info = this.dataPort.read();
                console.log(info);
                if (info.startsWith("weaken") || info.startsWith("grow")) {
                    this.clearHack();
                    if (!this.isPrepped()) {
                        this.prepServer();
                    }
                }
            }
        }

        if (this.isPrepping) {
            this.ns.print(
                `Prepping for ${this.formatTime(this.prepTime - Date.now())} ${
                    this.prepThreadsLeft > 0
                        ? `${this.prepThreadsLeft} threads left`
                        : ""
                }`
            );
            if (this.prepThreadsLeft > 0) {
                this.ns.print(
                    `Total Prep Time: ${this.formatTime(
                        this.totalPrepTime - Date.now()
                    )}`
                );
            }
        }
        this.ns.print(
            `Batching Progress: ${
                this.isBatching
                    ? "In progress"
                    : `${this.isPrepped() ? "Complete" : "Waiting"}`
            }`
        );
        this.ns.print(
            `Server Count: ${this.hackingServers}    Target: ${this.target}`
        );
        const security = this.ns.getServerSecurityLevel(this.target);
        const money = this.ns.getServerMoneyAvailable(this.target);
        this.ns.print(
            `Target Security: ${this.ns.formatNumber(
                security,
                2
            )} Money: \$${this.ns.formatNumber(money, 2)}`
        );
        this.ns.print(`Current Tool Count: ${this.toolCount}`);
    };
}
