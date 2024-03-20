import { NS } from "NetscriptDefinitions";
import { ServerManager } from "../../myHacks/ServerManger";

export class ServerUtils {
    private ns: NS;

    constructor(ns: NS) {
        this.ns = ns;
    }

    getServers(
        lambdaCondition = (hostname: string) => true,
        hostname = "home",
        servers: string[] = [],
        visited: string[] = []
    ) {
        if (visited.includes(hostname)) return;
        visited.push(hostname);
        if (lambdaCondition(hostname)) servers.push(hostname);
        const connectedNodes = this.ns.scan(hostname);
        if (hostname !== "home") connectedNodes.shift();
        for (const node of connectedNodes)
            this.getServers(lambdaCondition, node, servers, visited);
        return servers;
    }

    optimizePeriodic = async (metrics, ramNet) => {
        const maxThreads = ramNet.maxBlockSize / 1.75;
        const maxMoney = metrics.maxMoney;
        const hPercent = this.ns.hackAnalyze(metrics.target);
        const wTime = this.ns.getWeakenTime(metrics.target);

        const minGreed = 0.001;
        const maxSpacer = wTime; // This is more of an infinite loop safety net than anything.
        const stepValue = 0.01;
        let greed = 0.95; // Capping greed a bit lower. I don't have a compelling reason for this.
        let spacer = metrics.spacer; // We'll be adjusting the spacer in low ram conditions to allow smaller depths.

        while (greed > minGreed && spacer < maxSpacer) {
            // We calculate a max depth based on the spacer, then add one as a buffer.
            const depth = Math.ceil(wTime / (4 * spacer)) + 1;
            const amount = maxMoney * greed;
            const hThreads = Math.max(
                Math.floor(this.ns.hackAnalyzeThreads(metrics.target, amount)),
                1
            );
            const tGreed = hPercent * hThreads;
            const gThreads = Math.ceil(
                this.ns.growthAnalyze(
                    metrics.target,
                    maxMoney / (maxMoney - maxMoney * tGreed)
                ) * 1.01
            );
            if (Math.max(hThreads, gThreads) <= maxThreads) {
                const wThreads1 = Math.max(
                    Math.ceil((hThreads * 0.002) / 0.05),
                    1
                );
                const wThreads2 = Math.max(
                    Math.ceil((gThreads * 0.004) / 0.05),
                    1
                );

                const threadCosts = [
                    hThreads * 1.7,
                    wThreads1 * 1.75,
                    gThreads * 1.75,
                    wThreads2 * 1.75,
                ];

                // Glad I kept these, they turned out to be useful after all. When trying to hit target depth,
                // checking that there's actually enough theoretical ram to fit them is a massive boost to performance.
                const totalCost = threadCosts.reduce((t, c) => t + c) * depth;
                if (totalCost < ramNet.totalRam) {
                    // Double check that we can actually fit our threads into ram, then set our metrics and return.
                    const batchCount = ramNet.testThreads(threadCosts);
                    if (batchCount >= depth) {
                        metrics.spacer = spacer;
                        metrics.greed = greed;
                        metrics.depth = depth;
                        return;
                    }
                }
            }
            await this.ns.sleep(0); // Uncomment and make the function async if you don't like the freeze on startup.

            // Decrement greed until we hit the minimum, then reset and increment spacer. We'll find a valid configuration eventually.
            greed -= stepValue;
            if (greed < minGreed && spacer < maxSpacer) {
                greed = 0.99;
                ++spacer;
            }
        }
        throw new Error(
            "Not enough ram to run even a single batch. Something has gone seriously wrong."
        );
    };

    checkTarget = (server: string, target: string, forms = false) => {
        if (!this.ns.hasRootAccess(server)) return target;

        const player = this.ns.getPlayer();
        const serverSim = this.ns.getServer(server);
        const pSim = this.ns.getServer(target);

        let previousScore;
        let currentScore;

        if (
            serverSim.requiredHackingSkill <=
            player.skills.hacking / (forms ? 1 : 2)
        ) {
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

    copyScripts = (server: string, scripts: string[], overwrite = false) => {
        for (const script of scripts) {
            if (
                (!this.ns.fileExists(script, server) || overwrite) &&
                this.ns.hasRootAccess(server)
            ) {
                this.ns.scp(script, server);
            }
        }
    };

    nukeTarget = (server: string, toolCount: number): boolean => {
        if (this.ns.hasRootAccess(server)) return true;

        const numPorts = this.ns.getServerNumPortsRequired(server);
        if (numPorts <= toolCount) {
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

    isPrepped = (server) => {
        const tolerance = 0.0001;
        const maxMoney = this.ns.getServerMaxMoney(server);
        const money = this.ns.getServerMoneyAvailable(server);
        const minSec = this.ns.getServerMinSecurityLevel(server);
        const sec = this.ns.getServerSecurityLevel(server);
        const secFix = Math.abs(sec - minSec) < tolerance;
        return money === maxMoney && secFix ? true : false;
    };

    prep = async (values, ramNet) => {
        const maxMoney = values.maxMoney;
        const minSec = values.minSec;
        let money = values.money;
        let sec = values.sec;
        while (!this.isPrepped(values.target)) {
            const wTime = this.ns.getWeakenTime(values.target);
            const gTime = wTime * 0.8;
            const dataPort = this.ns.getPortHandle(this.ns.pid);
            dataPort.clear();

            const pRam = ramNet.cloneBlocks();
            const maxThreads = Math.floor(ramNet.maxBlockSize / 1.75);
            const totalThreads = ramNet.prepThreads;
            let wThreads1 = 0;
            let wThreads2 = 0;
            let gThreads = 0;
            let batchCount = 1;
            let script, mode;
            /*
		Modes:
		0: Security only
		1: Money only
		2: One shot
		*/

            if (money < maxMoney) {
                gThreads = Math.ceil(
                    this.ns.growthAnalyze(values.target, maxMoney / money)
                );
                wThreads2 = Math.ceil(
                    this.ns.growthAnalyzeSecurity(gThreads) / 0.05
                );
            }
            if (sec > minSec) {
                wThreads1 = Math.ceil((sec - minSec) * 20);
                if (
                    !(
                        wThreads1 + wThreads2 + gThreads <= totalThreads &&
                        gThreads <= maxThreads
                    )
                ) {
                    gThreads = 0;
                    wThreads2 = 0;
                    batchCount = Math.ceil(wThreads1 / totalThreads);
                    if (batchCount > 1) wThreads1 = totalThreads;
                    mode = 0;
                } else mode = 2;
            } else if (
                gThreads > maxThreads ||
                gThreads + wThreads2 > totalThreads
            ) {
                mode = 1;
                const oldG = gThreads;
                wThreads2 = Math.max(Math.floor(totalThreads / 13.5), 1);
                gThreads = Math.floor(wThreads2 * 12.5);
                batchCount = Math.ceil(oldG / gThreads);
            } else mode = 2;

            // Big buffer here, since all the previous calculations can take a while. One second should be more than enough.
            const wEnd1 = Date.now() + wTime + 1000;
            const gEnd = wEnd1 + values.spacer;
            const wEnd2 = gEnd + values.spacer;

            // "metrics" here is basically a mock Job object. Again, this is just an artifact of repurposed old code.
            const metrics = {
                batch: "prep",
                target: values.target,
                type: "none",
                time: 0,
                end: 0,
                port: this.ns.pid,
                log: values.log,
                report: false,
                server: undefined,
            };

            // Actually assigning threads. We actually allow grow threads to be spread out in mode 1.
            // This is because we don't mind if the effect is a bit reduced from higher security unlike a normal batcher.
            // We're not trying to grow a specific amount, we're trying to grow as much as possible.
            for (const block of pRam) {
                while (block.ram >= 1.75) {
                    const bMax = Math.floor(block.ram / 1.75);
                    let threads = 0;
                    if (wThreads1 > 0) {
                        script = "./tWeaken.js";
                        metrics.type = "pWeaken1";
                        metrics.time = wTime;
                        metrics.end = wEnd1;
                        threads = Math.min(wThreads1, bMax);
                        if (wThreads2 === 0 && wThreads1 - threads <= 0)
                            metrics.report = true;
                        wThreads1 -= threads;
                    } else if (wThreads2 > 0) {
                        script = "./tWeaken.js";
                        metrics.type = "pWeaken2";
                        metrics.time = wTime;
                        metrics.end = wEnd2;
                        threads = Math.min(wThreads2, bMax);
                        if (wThreads2 - threads === 0) metrics.report = true;
                        wThreads2 -= threads;
                    } else if (gThreads > 0 && mode === 1) {
                        script = "./tGrow.js";
                        metrics.type = "pGrow";
                        metrics.time = gTime;
                        metrics.end = gEnd;
                        threads = Math.min(gThreads, bMax);
                        metrics.report = false;
                        gThreads -= threads;
                    } else if (gThreads > 0 && bMax >= gThreads) {
                        script = "./tGrow.js";
                        metrics.type = "pGrow";
                        metrics.time = gTime;
                        metrics.end = gEnd;
                        threads = gThreads;
                        metrics.report = false;
                        gThreads = 0;
                    } else break;
                    metrics.server = block.server;
                    const pid = this.ns.exec(
                        script,
                        block.server,
                        { threads: threads, temporary: true },
                        JSON.stringify(metrics)
                    );
                    if (!pid) throw new Error("Unable to assign all jobs.");
                    block.ram -= 1.75 * threads;
                }
            }

            // Fancy UI stuff to update you on progress.
            const tEnd =
                ((mode === 0 ? wEnd1 : wEnd2) - Date.now()) * batchCount +
                Date.now();
            const timer = setInterval(() => {
                this.ns.clearLog();
                switch (mode) {
                    case 0:
                        this.ns.print(
                            `Weakening security on ${values.target}...`
                        );
                        break;
                    case 1:
                        this.ns.print(
                            `Maximizing money on ${values.target}...`
                        );
                        break;
                    case 2:
                        this.ns.print(
                            `Finalizing preparation on ${values.target}...`
                        );
                }
                this.ns.print(
                    `Security: +${this.ns.formatNumber(sec - minSec, 3)}`
                );
                this.ns.print(
                    `Money: \$${this.ns.formatNumber(
                        money,
                        2
                    )}/${this.ns.formatNumber(maxMoney, 2)}`
                );
                const time = tEnd - Date.now();
                this.ns.print(
                    `Estimated time remaining: ${this.ns.tFormat(time)}`
                );
                this.ns.print(
                    `~${batchCount} ${batchCount === 1 ? "batch" : "batches"}.`
                );
            }, 200);
            this.ns.atExit(() => clearInterval(timer));

            // Wait for the last weaken to finish.
            do await dataPort.nextWrite();
            while (!dataPort.read().startsWith("pWeaken"));
            clearInterval(timer);
            await this.ns.sleep(100);

            money = this.ns.getServerMoneyAvailable(values.target);
            sec = this.ns.getServerSecurityLevel(values.target);
        }
        return true;
    };
}
