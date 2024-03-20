import { ServerUtils } from "./ServerUtils";

export interface Infos {
    hack: number;
    weaken1: number;
    grow: number;
    weaken2: number;
}

export class Metrics {
    ns: NS;
    utils: ServerUtils;
    target: string;
    maxMoney: number;
    money: number;
    minSec: number;
    sec: number;
    prepped: boolean;
    chance: number;
    wTime: number;
    delay: number;
    spacer: number;
    greed: number;
    depth: number;
    times: Infos;
    end: number;
    threads: Infos;
    port: number;

    constructor(ns: NS, utils, server) {
        this.utils = utils;
        this.ns = ns;
        this.target = server;
        this.maxMoney = ns.getServerMaxMoney(server);
        this.money = Math.max(ns.getServerMoneyAvailable(server), 1);
        this.minSec = ns.getServerMinSecurityLevel(server);
        this.sec = ns.getServerSecurityLevel(server);
        this.prepped = utils.isPrepped(server);
        this.chance = 0;
        this.wTime = 0;
        this.delay = 0;
        this.spacer = 5;
        this.greed = 0.01;
        this.depth = 0; // The number of concurrent batches to run. Set by the optimizer.

        this.times = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
        this.end = 0; // Slight change for the new timing. The old way in commented out in case I switch back later.
        // this.ends = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
        this.threads = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };

        this.port = ns.pid;
    }

    calculate(greed = this.greed) {
        const server = this.target;
        const maxMoney = this.maxMoney;
        this.money = this.ns.getServerMoneyAvailable(server);
        this.sec = this.ns.getServerSecurityLevel(server);
        this.wTime = this.ns.getWeakenTime(server);
        this.times.weaken1 = this.wTime;
        this.times.weaken2 = this.wTime;
        this.times.hack = this.wTime / 4;
        this.times.grow = this.wTime * 0.8;
        // this.depth = this.wTime / this.spacer * 4;

        if (this.utils.isPrepped(server)) {
            // The only change.
            const hPercent = this.ns.hackAnalyze(server);
            const amount = maxMoney * greed;
            const hThreads = Math.max(
                Math.floor(this.ns.hackAnalyzeThreads(server, amount)),
                1
            );
            const tGreed = hPercent * hThreads;
            const gThreads = Math.ceil(
                this.ns.growthAnalyze(
                    server,
                    maxMoney / (maxMoney - maxMoney * tGreed)
                ) * 1.01
            );
            this.threads.weaken1 = Math.max(
                Math.ceil((hThreads * 0.002) / 0.05),
                1
            );
            this.threads.weaken2 = Math.max(
                Math.ceil((gThreads * 0.004) / 0.05),
                1
            );
            this.threads.hack = hThreads;
            this.threads.grow = gThreads;
            this.chance = this.ns.hackAnalyzeChance(server);
        }
    }
}
