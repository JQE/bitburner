import { NS, NetscriptPort } from "NetscriptDefinitions";
import { BatchUtils } from "./utils";
import { Deque } from "./Dequeue";
import { SCRIPTS, TYPES, WORKERS } from "./Constants";
import { Job } from "./Job";
import { Metrics } from "./Metrics";
import { RamNet } from "./RamNet";

export class ContinuousBatcher {
    ns: NS;
    utils: BatchUtils;
    metrics: Metrics;
    ramNet: RamNet;
    target: string;
    schedule: Deque;
    dataPort: NetscriptPort;
    batchCount: number = 0;
    desyncs: number = 0;

    running = new Map();

    constructor(ns: NS, metrics: Metrics, ramNet: RamNet, utils: BatchUtils) {
        this.ns = ns;
        this.utils = utils;
        this.metrics = metrics;
        this.ramNet = ramNet;
        this.target = metrics.target;
        this.dataPort = ns.getPortHandle(ns.pid);

        this.metrics.end = Date.now() + metrics.wTime - metrics.spacer;
        this.schedule = new Deque(metrics.depth * 4);
    }

    scheduleBatches = (batches = this.metrics.depth) => {
        while (this.schedule.size < batches * 4) {
            ++this.batchCount;
            for (const type of TYPES) {
                this.metrics.end += this.metrics.spacer;
                const job = new Job(type, this.metrics, this.batchCount);
                if (!this.ramNet.assign(job)) {
                    this.ns.print(
                        `WARN: Insufficient RAM to assign ${job.type}: ${job.batch}`
                    );
                    continue;
                }
                this.schedule.push(job);
            }
        }
    };
    deploy = async () => {
        while (!this.schedule.isEmpty()) {
            const job = this.schedule.shift();
            job.end += this.metrics.delay;
            const jobPid = this.ns.exec(
                SCRIPTS[job.type],
                job.server,
                { threads: job.threads, temporary: true },
                JSON.stringify(job)
            );
            if (!jobPid) {
                this.ns.tprint(
                    `Unable to deploy ${job.type} on server ${job.server}`
                );
                continue;
            }
            const tPort = this.ns.getPortHandle(jobPid);
            job.pid = jobPid;
            await tPort.nextWrite();
            this.metrics.delay += Math.max(
                Math.ceil(tPort.read()) - this.metrics.spacer,
                0
            );
            this.running.set(job.id, job);
        }

        this.metrics.end += this.metrics.delay;
        this.metrics.delay = 0;
    };

    log() {
        const ns = this.ns;
        const metrics = this.metrics;
        const ramNet = this.ramNet;
        ns.clearLog();
        ns.print(
            `Hacking ~\$${ns.formatNumber(
                ((metrics.maxMoney * metrics.greed * metrics.chance) /
                    (4 * metrics.spacer)) *
                    1000
            )}/s from ${metrics.target}`
        );
        ns.print(
            `Status: ${
                this.utils.isPrepped(this.target) ? "Prepped" : "Desynced"
            }`
        );
        ns.print(`Security: +${metrics.minSec - metrics.sec}`);
        ns.print(
            `Money: \$${ns.formatNumber(metrics.money, 2)}/${ns.formatNumber(
                metrics.maxMoney,
                2
            )}`
        );
        ns.print(`Greed: ${Math.floor(metrics.greed * 1000) / 10}%`);
        ns.print(
            `Ram available: ${ns.formatRam(ramNet.totalRam)}/${ns.formatRam(
                ramNet.maxRam
            )}`
        );
        ns.print(`Active jobs: ${this.running.size}/${metrics.depth * 4}`);

        // You'll see what this line's about in a moment.
        if (this.desyncs)
            ns.print(`Hacks cancelled by desync: ${this.desyncs}`);
    }

    run = async () => {
        // First we do some initial setup, this is essentially firing off a shotgun blast to get us started.
        this.ns.print("Setting shotgun to start");
        const dataPort = this.dataPort;
        this.scheduleBatches();
        await this.deploy();
        await this.ns.sleep(0); // This is probably pointless. I forget why I put it here.
        this.log();
        while (true) {
            // Wait for the nextWrite, as usual.
            await dataPort.nextWrite();

            // Sometimes there's a delay and more than one job writes to the port at once.
            // We make sure to handle it all before we move on.
            while (!dataPort.empty()) {
                // Workers now report unique identifiers (type + batchnumber) used to find them on the map.
                const data = dataPort.read();

                // Free up the ram, them remove them from the active list.
                // The check handles a corner case where a hack gets "cancelled" after it's already finished.
                if (this.running.has(data)) {
                    this.ramNet.finish(this.running.get(data));
                    this.running.delete(data);
                }

                // If it's a W2, we've got an opening to do some work.
                if (data.startsWith("weaken2")) {
                    // Recalculate times. Threads too, but only if prepped (the logic is in the function itself).
                    this.metrics.calculate();

                    /*
					This is probably the most JIT-like aspect of the entire batcher. If the server isn't prepped, then
					we cancel the next hack to let the server fix itself. Between this and the extra 1% grow threads, level
					ups are completely handled. Rapid level ups can lead to a lot of lost jobs, but eventually the program
					stabilizes.

					There are probably more efficient ways to do this. Heck, even this solution could be optimized better,
					but for now, this is an adequate demonstration of a reasonable non-formulas solution to the level up
					problem. It also lets us dip our toes into JIT logic in preparation for the final part.
					*/
                    if (!this.utils.isPrepped(this.target)) {
                        const id = "hack" + (parseInt(data.slice(7)) + 1);
                        const cancel = this.running.get(id);
                        // Just in case the hack was already aborted somehow.
                        if (cancel) {
                            this.ramNet.finish(cancel);
                            this.ns.kill(cancel.pid);
                            this.running.delete(id);
                            ++this.desyncs; // Just to keep track of how much we've lost keeping things prepped.
                        }
                    }

                    // Then of course we just schedule and deploy a new batch.
                    this.scheduleBatches(1);
                    await this.deploy();
                    this.log();
                }
            }
        }
    };
}

export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();

    /*
	This commented out code is for a debugging tool that centralizes logs from the worker scripts into one place.
	It's main advantage is the ability to write txt logs to file, which can be perused later to track down errors.
	You can uncomment it if you'd like to see a live stream of workers finishing without flooding the terminal.

	If you do, make sure to search the file for -LOGGING and uncomment all relevant lines.
	*/
    // if (ns.isRunning("/part4/logHelper.js", "home")) ns.kill("/part4/logHelper.js", "home");
    // const logPort = ns.exec("/part4/logHelper.js", "home");
    // ns.atExit(() => ns.closeTail(logPort));

    // Setup is mostly the same.
    const dataPort = ns.getPortHandle(ns.pid);
    dataPort.clear();
    let target = ns.args[0] ? ns.args[0] : "n00dles";
    ns.print(`Target: ${target}`);
    const utils = new BatchUtils(ns);
    while (true) {
        const servers = utils.getServers((server) => {
            if (!ns.args[0])
                target = utils.checkTarget(
                    server,
                    target,
                    ns.fileExists("Formulas.exe", "home")
                );
            utils.copyScripts(server, WORKERS, true);
            return ns.hasRootAccess(server);
        });
        const ramNet = new RamNet(ns, servers);
        const metrics = new Metrics(ns, utils, target);
        // metrics.log = logPort; // Uncomment for -LOGGING.
        if (!utils.isPrepped(target)) await utils.prep(metrics, ramNet);
        ns.clearLog();
        ns.print("Optimizing. This may take a few seconds...");

        // Optimizer has changed again. Back to being synchronous, since the performance is much better.
        await utils.optimizePeriodic(metrics, ramNet);
        metrics.calculate();

        // Create and run our batcher.
        const batcher = new ContinuousBatcher(ns, metrics, ramNet, utils);
        await batcher.run();

        /*
		You might be wondering why I put this in a while loop and then just return here. The simple answer is that
		it's because this is meant to be run in a loop, but I didn't implement the logic for it. This version of the
		batcher is completely static once created. It sticks to a single greed value, and doesn't update if more
		RAM becomes available.

		In a future version, you'd want some logic to allow the batcher to choose new targets, update its available RAM,
		and create new batchers during runtime. For now, that's outside the scope of this guide, but consider this loop
		as a sign of what could be.
		*/
        return;
    }
}
