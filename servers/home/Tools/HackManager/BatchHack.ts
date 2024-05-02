import { NetscriptPort } from "NetscriptDefinitions";
import { COSTS, SCRIPTS, WORKERS } from "./BatchTool/Constants";
import { BATCHPORT, HACKPORT } from "../../Constants";
import { HackInfo, HackStage } from "../../types";

export class BatchHack {
    private ns: NS;
    private servers: string[] = [];
    private target: string;
    private toolCount: number = -1;
    private isPrepping: boolean = false;
    private dataPort: NetscriptPort;
    private isBatching: boolean = false;
    private startingBatch: boolean = false;
    private serverIndex: number = 0;
    private prepTime: number = 0;
    private checkTime: number = 0;
    private runTime: number = 1800000;
    private totalPrepTime: number = 0;
    private prepThreadsLeft: number = 0;
    private prepServers: number = 0;
    private hackingServers = 0;
    private greed = 0.05;
    private best = 0;
    private greedStep = 99;
    private isOptimizing = false;
    private isOptimized = false;
    private error = "";
    private maxMoney;
    private hackChance;
    private firstRun = true;

    constructor(ns: NS, target: string = "joesguns") {
        this.ns = ns;
        this.target = target;
        this.dataPort = this.ns.getPortHandle(BATCHPORT);
        this.maxMoney = this.ns.getServerMaxMoney(this.target);
    }

    private getServers = (
        lambdaCondition = (hostname: string) => true,
        includeHacknet = false,
        hostname = "home",
        toolCount = 0,
        servers: string[] = [],
        visited: string[] = []
    ) => {
        if (hostname.startsWith("hacknet") && !includeHacknet) {
            return;
        }
        if (visited.includes(hostname)) return;
        visited.push(hostname);
        if (lambdaCondition(hostname)) servers.push(hostname);
        const connectedNodes = this.ns.scan(hostname);
        if (hostname !== "home") connectedNodes.shift();
        for (const node of connectedNodes)
            this.getServers(
                lambdaCondition,
                includeHacknet,
                node,
                toolCount,
                servers,
                visited
            );
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

    private checkTarget = (server: string, target: string) => {
        if (!this.ns.hasRootAccess(server)) return target;

        const player = this.ns.getPlayer();
        const serverSim = this.ns.getServer(server);
        const pSim = this.ns.getServer(target);

        let previousScore;
        let currentScore;

        if (serverSim.requiredHackingSkill <= player.skills.hacking) {
            serverSim.hackDifficulty = serverSim.minDifficulty;
            pSim.hackDifficulty = pSim.minDifficulty;

            previousScore =
                (pSim.moneyMax /
                    this.ns.formulas.hacking.weakenTime(pSim, player)) *
                this.ns.formulas.hacking.hackChance(pSim, player);
            currentScore =
                (serverSim.moneyMax /
                    this.ns.formulas.hacking.weakenTime(serverSim, player)) *
                this.ns.formulas.hacking.hackChance(serverSim, player);

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
        const hackInfo: HackInfo = JSON.parse(this.ns.peek(HACKPORT));
        this.servers = this.getServers(
            (server) => {
                if (server === "home") return true;
                this.target = this.checkTarget(server, this.target);
                this.copyScripts(server, WORKERS, true);
                this.nukeTarget(server);
                return this.ns.hasRootAccess(server);
            },
            hackInfo.IncludeNet,
            "home",
            this.toolCount,
            []
        );
    };

    private killall = () => {
        this.servers.forEach((server) => {
            if (server !== "home") {
                this.ns.killall(server);
            } else {
                this.ns.ps(server).forEach((proc) => {
                    if (WORKERS.includes(proc.filename)) {
                        this.ns.scriptKill(proc.filename, server);
                    }
                });
            }
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

        let money = this.ns.getServerMoneyAvailable(this.target);
        if (money === 0) money = 1;
        const sec = this.ns.getServerSecurityLevel(this.target);
        this.maxMoney = this.ns.getServerMaxMoney(this.target);
        const minSec = this.ns.getServerMinSecurityLevel(this.target);

        let wThreads1 = 0;
        let wThreads2 = 0;
        let gThreads = 0;

        let wTime;

        wTime = this.ns.formulas.hacking.weakenTime(
            this.ns.getServer(this.target),
            this.ns.getPlayer()
        );
        const gTime = wTime * 0.8;

        if (money < this.maxMoney) {
            gThreads = Math.ceil(
                this.ns.growthAnalyze(this.target, this.maxMoney / money)
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
                    BATCHPORT,
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
                    BATCHPORT,
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
                    BATCHPORT,
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

    private getMaxRam = () => {
        let maxRam = 0;
        this.servers.forEach((server) => {
            const ram = this.ns.getServerMaxRam(server);
            if (ram > maxRam) maxRam = ram;
        });
        return maxRam;
    };

    private testThreads = (server: string = "pserver-0") => {
        const maxMoney = this.ns.getServerMaxMoney(this.target);
        const amount = maxMoney * this.greedStep;

        const hPercent = this.ns.hackAnalyze(this.target);
        const hThreads = Math.max(
            Math.floor(this.ns.hackAnalyzeThreads(this.target, amount)),
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

        const availRam = this.ns.getServerMaxRam(server);
        const totalCost =
            hThreads * COSTS.hack +
            gThreads * COSTS.grow +
            wThreads1 * COSTS.weaken1 +
            wThreads2 * COSTS.weaken2;
        let batchCount = Math.floor(availRam / totalCost);
        return batchCount;
    };

    private startOptimizing = () => {
        this.isOptimizing = true;
        this.optimize();
    };

    private optimize = () => {
        // Setup is mostly the same.
        const maxThreads = this.getMaxRam() / 1.85;
        const maxMoney = this.ns.getServerMaxMoney(this.target);
        const hPercent = this.ns.hackAnalyze(this.target);
        const wTime = this.ns.getWeakenTime(this.target); // We'll need this for one of our calculations.

        const stepValue = 0.01; // Step value is now 10x higher. If you think that's overkill, it's not.

        // This algorithm starts out pretty much the same. We begin by weeding out the obviously way too huge greed levels.
        const amount = maxMoney * this.greedStep;
        const hThreads = Math.max(
            Math.floor(this.ns.hackAnalyzeThreads(this.target, amount)),
            1
        );
        const tGreed = hPercent * hThreads;
        // 1% overestimation here too. Always make sure your calculations match.
        const gThreads = Math.ceil(
            this.ns.growthAnalyze(
                this.target,
                maxMoney / (maxMoney - maxMoney * tGreed)
            ) * 1.01
        );

        if (Math.max(hThreads, gThreads) <= maxThreads) {
            let batchCount = 0;
            this.servers.forEach((server) => {
                batchCount += this.testThreads(server);
            });

            const income =
                (tGreed * maxMoney * batchCount) / (5 * 4 * batchCount + wTime);
            if (income > this.best) {
                this.best = income;
                this.greed = this.greedStep;
            }
        }
        this.greedStep -= stepValue;
        if (this.greedStep <= 0) {
            if (this.best <= 0) {
                this.clearHack();
                this.error = "Cannot find a valid batch";
            } else {
                this.isOptimizing = false;
                this.isOptimized = true;
                this.error = "";
            }
        }
    };

    private runBatch = (server: string) => {
        const maxMoney = this.ns.getServerMaxMoney(this.target);

        const wTime = this.ns.getWeakenTime(this.target);
        const gTime = wTime * 0.8;
        const hTime = wTime / 4;
        const amount = maxMoney * this.greed;

        const hPercent = this.ns.hackAnalyze(this.target);
        const hThreads = Math.max(
            Math.floor(this.ns.hackAnalyzeThreads(this.target, amount)),
            1
        );
        const tGreed = hPercent * hThreads;
        const gThreads = Math.max(
            Math.ceil(
                this.ns.growthAnalyze(
                    this.target,
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
        } else {
            console.log(`No batches for ${server}`);
        }
        while (batchCount > 0) {
            batchCount--;
            const report = batchCount === 0;
            const hpid = this.ns.exec(
                SCRIPTS.hack,
                server,
                { threads: hThreads, temporary: true },
                this.target,
                wTime - 5 - hTime,
                BATCHPORT,
                false
            );
            if (hpid <= 0) {
                console.log(`Failed to launch hack`);
            }
            const w1pid = this.ns.exec(
                SCRIPTS.weaken1,
                server,
                { threads: wThreads1, temporary: true },
                this.target,
                0,
                BATCHPORT,
                false
            );
            if (w1pid <= 0) {
                console.log(`Failed to launch w1`);
            }

            const gpid = this.ns.exec(
                SCRIPTS.grow,
                server,
                { threads: gThreads, temporary: true },
                this.target,
                wTime + 5 - gTime,
                BATCHPORT,
                false
            );
            if (gpid <= 0) {
                console.log(`Failed to launch grow`);
            }

            const w2pid = this.ns.exec(
                SCRIPTS.weaken2,
                server,
                { threads: wThreads2, temporary: true },
                this.target,
                10,
                BATCHPORT,
                report
            );
            if (w2pid <= 0) {
                console.log(`Failed to launch w2`);
            }
        }
    };

    private startBatch = () => {
        if (this.serverIndex === this.servers.length) {
            this.startingBatch = false;
            return;
        }
        const server = this.servers[this.serverIndex];
        this.serverIndex++;
        console.log(`Batching ${server}`);
        this.runBatch(server);
    };

    private initializeBatch = () => {
        this.clearHack();
        this.isBatching = true;
        this.startingBatch = true;
        this.startBatch();
    };

    clearHack = () => {
        this.isBatching = false;
        this.startingBatch = false;
        this.isPrepping = false;
        this.hackingServers = 0;
        this.prepTime = 0;
        this.totalPrepTime = 0;
        this.prepServers = 0;
        this.serverIndex = 0;
        this.isOptimized = false;
        this.isOptimizing = false;
        this.error = "";
        this.dataPort.clear();
    };

    processHack = async () => {
        this.hackChance = this.ns.hackAnalyzeChance(this.target);
        this.maxMoney = this.ns.getServerMaxMoney(this.target);
        if (this.error !== undefined && this.error !== "") {
            console.log(this.error);
        } else {
            if (
                (!this.isPrepping &&
                    !this.isBatching &&
                    !this.startingBatch &&
                    !this.isOptimizing) ||
                (this.checkTime < Date.now() && this.isBatching)
            ) {
                let restartHack = false;
                if (this.toolCount < 5) {
                    const oldTools = this.toolCount;
                    this.toolCount = this.getToolCount();
                    if (this.toolCount > oldTools) {
                        restartHack = true;
                    }
                }
                let newTarget = this.target;
                this.servers.forEach((server) => {
                    newTarget = this.checkTarget(server, this.target);
                });
                if (newTarget !== this.target) {
                    restartHack = true;
                    this.target = newTarget;
                    this.maxMoney = this.ns.getServerMaxMoney(this.target);
                }
                if (restartHack) {
                    this.killall();
                    this.clearHack();
                    this.hackServers();
                } else {
                    if (!this.isPrepped()) {
                        this.prepServer();
                    } else if (!this.isOptimized || this.firstRun === false) {
                        this.isOptimized = false;
                        this.greedStep = 99;
                        this.greed = 0;
                        this.checkTime = Date.now() + this.runTime;
                        this.startOptimizing();
                    } else if (!this.isBatching) {
                        this.firstRun = false;
                        this.checkTime = Date.now() + this.runTime;
                        this.initializeBatch();
                    } else {
                        this.checkTime = Date.now() + this.runTime;
                    }
                }
            } else {
                if (this.isPrepping) {
                    this.checkTime = this.prepTime + Date.now();
                    while (!this.dataPort.empty()) {
                        const info = this.dataPort.read();
                        if (
                            info.startsWith("weaken") ||
                            info.startsWith("grow")
                        ) {
                            this.prepServers--;
                            if (this.prepServers <= 0) {
                                this.isPrepping = false;
                            }
                        }
                    }
                } else if (this.isOptimizing) {
                    this.optimize();
                } else if (this.startingBatch) {
                    this.startBatch();
                } else if (this.isBatching) {
                    if (!this.dataPort.empty()) {
                        const info = this.dataPort.read() as string;
                        const [type, server] = info.split(":");
                        if (type === "weaken") {
                            this.hackingServers--;
                            this.runBatch(server);
                        }
                    }
                }
            }
        }
        const hackInfo: HackInfo = JSON.parse(this.ns.peek(HACKPORT));
        if (this.isPrepping) {
            hackInfo.Stage = HackStage.Prepping;
            hackInfo.Count = this.prepServers;
        } else if (this.isOptimizing) {
            hackInfo.Stage = HackStage.Optimizing;
        } else if (this.isBatching) {
            hackInfo.Stage = HackStage.Batching;
            hackInfo.Count = this.hackingServers;
        }
        hackInfo.Greed = this.greed;
        hackInfo.GreedStep = this.greedStep;
        hackInfo.Best = this.best;
        hackInfo.Chance = this.hackChance;
        hackInfo.Error = this.error;
        hackInfo.Prep = this.prepTime;
        hackInfo.TotalPrep =
            this.prepThreadsLeft > 0 ? this.totalPrepTime : undefined;
        hackInfo.Tools = this.toolCount;
        hackInfo.Target = this.target;
        hackInfo.Reset = this.checkTime;
        this.ns.clearPort(HACKPORT);
        this.ns.writePort(HACKPORT, JSON.stringify(hackInfo));
        await this.ns.sleep(5);
    };
}
