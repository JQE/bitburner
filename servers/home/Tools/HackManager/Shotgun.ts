import { NetscriptPort } from "NetscriptDefinitions";
import { BATCHPORT, HACKPORT } from "servers/home/Constants";
import { HackInfo, HackStage } from "servers/home/types";
import { COSTS, SCRIPTS, WORKERS } from "./BatchTool/Constants";

export async function main(ns: NS) {
    let servers: string[] = [];
    let target: string = "joesguns";
    let toolCount: number = -1;
    let dataPort: NetscriptPort = ns.getPortHandle(BATCHPORT);
    let prepTime: number = 0;
    let totalPrepTime: number = 0;
    let prepThreadsLeft: number = 0;
    let prepServers: number = 0;
    let hackingServers = 0;
    let serverIndex = 0;
    let greed = 0.05;
    let best = 0;
    let greedStep = 99;
    let error = "";
    let maxMoney = ns.getServerMaxMoney(target);
    let hackChance;
    let running = true;

    let stage: Number = HackStage.Starting;
    const getServers = (
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
        const connectedNodes = ns.scan(hostname);
        if (hostname !== "home") connectedNodes.shift();
        for (const node of connectedNodes)
            getServers(
                lambdaCondition,
                includeHacknet,
                node,
                toolCount,
                servers,
                visited
            );
        return servers;
    };

    const copyScripts = (
        server: string,
        scripts: string[],
        overwrite = false
    ) => {
        for (const script of scripts) {
            if (
                (!ns.fileExists(script, server) || overwrite) &&
                ns.hasRootAccess(server)
            ) {
                ns.scp(script, server);
            }
        }
    };

    const checkTarget = (server: string, target: string) => {
        if (!ns.hasRootAccess(server)) return target;

        const player = ns.getPlayer();
        const serverSim = ns.getServer(server);
        const pSim = ns.getServer(target);

        let previousScore;
        let currentScore;

        if (serverSim.requiredHackingSkill <= player.skills.hacking) {
            serverSim.hackDifficulty = serverSim.minDifficulty;
            pSim.hackDifficulty = pSim.minDifficulty;

            previousScore =
                (pSim.moneyMax / ns.formulas.hacking.weakenTime(pSim, player)) *
                ns.formulas.hacking.hackChance(pSim, player);
            currentScore =
                (serverSim.moneyMax /
                    ns.formulas.hacking.weakenTime(serverSim, player)) *
                ns.formulas.hacking.hackChance(serverSim, player);

            if (currentScore > previousScore) target = server;
        }
        return target;
    };

    const nukeTarget = (server: string): boolean => {
        if (ns.hasRootAccess(server)) return true;

        const numPorts = ns.getServerNumPortsRequired(server);
        if (numPorts <= toolCount) {
            if (numPorts >= 5) {
                ns.sqlinject(server);
            }
            if (numPorts >= 4) {
                ns.httpworm(server);
            }
            if (numPorts >= 3) {
                ns.relaysmtp(server);
            }
            if (numPorts >= 2) {
                ns.ftpcrack(server);
            }
            if (numPorts >= 1) {
                ns.brutessh(server);
            }
            ns.nuke(server);
        }
    };

    const getToolCount = () => {
        let numTools = 0;
        if (ns.fileExists("BruteSSH.exe")) {
            numTools++;
        }
        if (ns.fileExists("FTPCrack.exe")) {
            numTools++;
        }
        if (ns.fileExists("relaySMTP.exe")) {
            numTools++;
        }
        if (ns.fileExists("HTTPWorm.exe")) {
            numTools++;
        }
        if (ns.fileExists("SQLInject.exe")) {
            numTools++;
        }
        return numTools;
    };

    const hackServers = () => {
        const hackInfo: HackInfo = JSON.parse(ns.peek(HACKPORT));
        servers = getServers(
            (server) => {
                if (server === "home") return true;
                copyScripts(server, WORKERS, true);
                if (server.startsWith("pserv")) return true;
                target = checkTarget(server, target);
                copyScripts(server, WORKERS, true);
                nukeTarget(server);
                return ns.hasRootAccess(server);
            },
            hackInfo.IncludeNet,
            "home",
            toolCount,
            []
        );
    };

    const killall = () => {
        servers.forEach((server) => {
            if (server !== "home") {
                ns.killall(server);
            } else {
                ns.ps(server).forEach((proc) => {
                    if (WORKERS.includes(proc.filename)) {
                        ns.scriptKill(proc.filename, server);
                    }
                });
            }
        });
    };

    const isPrepped = () => {
        const hasAdmin = ns.hasRootAccess(target);
        const minSec = ns.getServerMinSecurityLevel(target);
        const sec = ns.getServerSecurityLevel(target);
        const cash = ns.getServerMoneyAvailable(target);
        const maxCash = ns.getServerMaxMoney(target);
        return hasAdmin && minSec >= sec && cash >= maxCash;
    };

    const prepServer = () => {
        if (isPrepped() || stage == HackStage.Prepping) return;
        stage = HackStage.Prepping;

        let money = ns.getServerMoneyAvailable(target);
        if (money === 0) money = 1;
        const sec = ns.getServerSecurityLevel(target);
        maxMoney = ns.getServerMaxMoney(target);
        const minSec = ns.getServerMinSecurityLevel(target);

        let wThreads1 = 0;
        let wThreads2 = 0;
        let gThreads = 0;

        let wTime;

        wTime = ns.formulas.hacking.weakenTime(
            ns.getServer(target),
            ns.getPlayer()
        );
        const gTime = wTime * 0.8;

        if (money < maxMoney) {
            gThreads = Math.ceil(ns.growthAnalyze(target, maxMoney / money));
            wThreads2 = Math.ceil(ns.growthAnalyzeSecurity(gThreads) / 0.05);
        }

        if (sec > minSec) {
            wThreads1 = Math.ceil((sec - minSec) * 20);
        }

        let totalThreads = gThreads + wThreads2 + wThreads1;
        const startThreads = totalThreads;
        let serverIndex = 0;
        while (totalThreads > 0 && serverIndex < servers.length) {
            const server = servers[serverIndex];
            const ramAvail =
                ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
            let maxThreads = Math.floor(ramAvail / 1.85);
            totalThreads -= maxThreads;
            serverIndex++;
            if (wThreads1 > 0 && maxThreads > 0) {
                const w1Threads = Math.min(maxThreads, wThreads1);
                maxThreads -= w1Threads;
                wThreads1 -= w1Threads;
                const report =
                    (wThreads2 <= 0 && wThreads1 <= 0) || maxThreads <= 0;
                const w1Pid = ns.exec(
                    SCRIPTS.weaken1,
                    server,
                    {
                        threads: w1Threads,
                        temporary: true,
                    },
                    target,
                    0,
                    BATCHPORT,
                    report
                );
                if (!w1Pid)
                    throw new Error(`Failed to start weaken threads ${server}`);
                if (report) {
                    prepServers++;
                }
            }
            if (maxThreads > 0 && gThreads > 0) {
                const Threadsg = Math.min(maxThreads, gThreads);
                maxThreads -= Threadsg;
                gThreads -= Threadsg;
                const report = maxThreads <= 0;
                const gPid = ns.exec(
                    SCRIPTS.grow,
                    server,
                    {
                        threads: Threadsg,
                        temporary: true,
                    },
                    target,
                    wTime + 5 - gTime,
                    BATCHPORT,
                    report
                );
                if (!gPid) throw new Error("Failed to start grow threads");
                if (report) {
                    prepServers++;
                }
            }
            if (maxThreads > 0 && wThreads2 > 0) {
                const w2Threads = Math.min(maxThreads, wThreads2);
                maxThreads -= w2Threads;
                wThreads2 -= w2Threads;
                const report = wThreads2 <= 0 || maxThreads <= 0;
                const w2Pid = ns.exec(
                    SCRIPTS.weaken2,
                    server,
                    {
                        threads: w2Threads,
                        temporary: true,
                    },
                    target,
                    10,
                    BATCHPORT,
                    report
                );
                if (!w2Pid)
                    throw new Error(
                        `Failed to start weaken2 threads ${server} ${w2Threads}`
                    );
                if (report) {
                    prepServers++;
                }
            }
        }
        prepThreadsLeft = totalThreads;
        let basePrepTime;
        if (wThreads2 > 0) {
            basePrepTime = wTime + 10;
            prepTime = wTime + 10 + Date.now();
        } else {
            basePrepTime = wTime;
            prepTime = wTime + Date.now();
        }
        if (prepThreadsLeft > 0) {
            const runThreads = startThreads - totalThreads;
            const overallBatches = startThreads / runThreads;
            totalPrepTime = basePrepTime * overallBatches + Date.now();
        }
    };

    const getMaxRam = () => {
        let maxRam = 0;
        servers.forEach((server) => {
            const ram = ns.getServerMaxRam(server);
            if (ram > maxRam) maxRam = ram;
        });
        return maxRam;
    };

    const testThreads = (server: string = "pserver-0") => {
        const maxMoney = ns.getServerMaxMoney(target);
        const amount = maxMoney * greedStep;

        const hPercent = ns.hackAnalyze(target);
        const hThreads = Math.max(
            Math.floor(ns.hackAnalyzeThreads(target, amount)),
            1
        );
        const tGreed = hPercent * hThreads;
        const gThreads = Math.max(
            Math.ceil(
                ns.growthAnalyze(
                    server,
                    maxMoney / (maxMoney - maxMoney * tGreed)
                ) * 1.01
            ),
            1
        );
        const wThreads1 = Math.max(Math.ceil((hThreads * 0.002) / 0.05), 1);
        const wThreads2 = Math.max(Math.ceil((gThreads * 0.004) / 0.05), 1);

        const availRam = ns.getServerMaxRam(server);
        const totalCost =
            hThreads * COSTS.hack +
            gThreads * COSTS.grow +
            wThreads1 * COSTS.weaken1 +
            wThreads2 * COSTS.weaken2;
        let batchCount = Math.floor(availRam / totalCost);
        return batchCount;
    };

    const optimize = () => {
        // Setup is mostly the same.
        const maxThreads = getMaxRam() / 1.85;
        const maxMoney = ns.getServerMaxMoney(target);
        const hPercent = ns.hackAnalyze(target);
        const wTime = ns.getWeakenTime(target); // We'll need this for one of our calculations.

        const stepValue = 0.01; // Step value is now 10x higher. If you think that's overkill, it's not.

        // This algorithm starts out pretty much the same. We begin by weeding out the obviously way too huge greed levels.
        const amount = maxMoney * greedStep;
        const hThreads = Math.max(
            Math.floor(ns.hackAnalyzeThreads(target, amount)),
            1
        );
        const tGreed = hPercent * hThreads;
        // 1% overestimation here too. Always make sure your calculations match.
        const gThreads = Math.ceil(
            ns.growthAnalyze(
                target,
                maxMoney / (maxMoney - maxMoney * tGreed)
            ) * 1.01
        );

        if (Math.max(hThreads, gThreads) <= maxThreads) {
            let batchCount = 0;
            servers.forEach((server) => {
                batchCount += testThreads(server);
            });

            const income =
                (tGreed * maxMoney * batchCount) / (5 * 4 * batchCount + wTime);
            if (income > best) {
                best = income;
                greed = greedStep;
            }
        }
        greedStep -= stepValue;
        if (greedStep <= 0) {
            if (best <= 0) {
                ns.exit();
            } else {
                dataPort.clear();
                hackingServers = 0;
                stage = HackStage.startingBatch;
            }
        }
    };

    const runBatch = (server: string) => {
        const maxMoney = ns.getServerMaxMoney(target);

        const wTime = ns.getWeakenTime(target);
        const gTime = wTime * 0.8;
        const hTime = wTime / 4;
        const amount = maxMoney * greed;

        const hPercent = ns.hackAnalyze(target);
        const hThreads = Math.max(
            Math.floor(ns.hackAnalyzeThreads(target, amount)),
            1
        );
        const tGreed = hPercent * hThreads;
        const gThreads = Math.max(
            Math.ceil(
                ns.growthAnalyze(
                    target,
                    maxMoney / (maxMoney - maxMoney * tGreed)
                ) * 1.01
            ),
            1
        );
        const wThreads1 = Math.max(Math.ceil((hThreads * 0.002) / 0.05), 1);
        const wThreads2 = Math.max(Math.ceil((gThreads * 0.004) / 0.05), 1);

        const availRam =
            ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
        const totalCost =
            hThreads * COSTS.hack +
            gThreads * COSTS.grow +
            wThreads1 * COSTS.weaken1 +
            wThreads2 * COSTS.weaken2;
        let batchCount = Math.floor(availRam / totalCost);

        while (batchCount > 0) {
            batchCount--;
            const report = batchCount === 0;
            if (report) {
                hackingServers++;
            }
            const hpid = ns.exec(
                SCRIPTS.hack,
                server,
                { threads: hThreads, temporary: true },
                target,
                wTime - 5 - hTime,
                BATCHPORT,
                false
            );
            if (hpid <= 0) {
                error = `Failed to launch hack`;
                console.log(
                    `PID: ${hpid} Batches: ${batchCount} Server ${server} Ram: ${availRam}`
                );
                hackingServers--;
                batchCount = 0;
                continue;
            }
            const w1pid = ns.exec(
                SCRIPTS.weaken1,
                server,
                { threads: wThreads1, temporary: true },
                target,
                0,
                BATCHPORT,
                false
            );
            if (w1pid <= 0) {
                error = `Failed to launch w1`;
                console.log(
                    `Batches: ${batchCount} Server ${server} Rma: ${availRam}`
                );
                hackingServers--;
                batchCount = 0;
                continue;
            }

            const gpid = ns.exec(
                SCRIPTS.grow,
                server,
                { threads: gThreads, temporary: true },
                target,
                wTime + 5 - gTime,
                BATCHPORT,
                false
            );
            if (gpid <= 0) {
                error = `Failed to launch grow`;
                console.log(
                    `Batches: ${batchCount} Server ${server} Rma: ${availRam}`
                );
                hackingServers--;
                batchCount = 0;
                continue;
            }

            const w2pid = ns.exec(
                SCRIPTS.weaken2,
                server,
                { threads: wThreads2, temporary: true },
                target,
                10,
                BATCHPORT,
                report
            );
            if (w2pid <= 0) {
                error = `Failed to launch w2`;
                console.log(
                    `Batches: ${batchCount} Server ${server} Rma: ${availRam}`
                );
                batchCount = 0;
                hackingServers--;
                continue;
            }
        }
    };

    const startBatch = () => {
        if (serverIndex === servers.length) {
            stage = HackStage.Batching;
            return;
        }
        const server = servers[serverIndex];
        serverIndex++;
        runBatch(server);
    };

    hackChance = ns.hackAnalyzeChance(target);
    maxMoney = ns.getServerMaxMoney(target);
    toolCount = getToolCount();
    // Find and hack any servers we have access to
    hackServers();

    stage = HackStage.Starting;
    while (running) {
        switch (stage) {
            case HackStage.Starting:
                if (!isPrepped()) {
                    prepServers = 0;
                    prepServer();
                    stage = HackStage.Prepping;
                } else {
                    stage = HackStage.Optimizing;
                }
                break;
            case HackStage.Prepping:
                if (dataPort.read() !== "NULL PORT DATA") {
                    prepServers--;
                }
                if (prepServers <= 0) {
                    stage = HackStage.Optimizing;
                    dataPort.clear();
                }
                break;
            case HackStage.Optimizing:
                optimize();
                break;
            case HackStage.startingBatch:
                startBatch();
                break;
            case HackStage.Batching:
                if (dataPort.read() !== "NULL PORT DATA") {
                    hackingServers--;
                }
                if (hackingServers <= 0) {
                    running = false;
                    dataPort.clear();
                }
                break;
            case HackStage.Unknown:
            default:
                stage = HackStage.Starting;
        }

        const hackInfo: HackInfo = JSON.parse(ns.peek(HACKPORT));
        hackInfo.Stage = stage;
        hackInfo.Count =
            stage === HackStage.Prepping ? prepServers : hackingServers;
        hackInfo.Greed = greed;
        hackInfo.GreedStep = greedStep;
        hackInfo.Best = best;
        hackInfo.Chance = hackChance;
        hackInfo.Prep = prepTime;
        hackInfo.TotalPrep = prepThreadsLeft > 0 ? totalPrepTime : undefined;
        hackInfo.Tools = toolCount;
        hackInfo.Target = target;
        ns.clearPort(HACKPORT);
        ns.writePort(HACKPORT, JSON.stringify(hackInfo));
        await ns.sleep(5);
    }
    dataPort.clear();
    killall();
}
