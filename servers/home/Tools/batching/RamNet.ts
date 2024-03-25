import { RESERVED_HOME_RAM } from "./Constants";

export interface Block {
    server: string;
    ram: number;
}

export class RamNet {
    ns: NS;
    blocks: Block[] = [];
    minBlockSize: number = Infinity;
    maxBlockSize: number = 0;
    totalRam: number = 0;
    prepThreads: number = 0;
    maxRam: number = 0;
    index = new Map();

    // Simulate mode ignores running scripts. Can be used to make calculations while the batcher is operating.
    constructor(ns: NS, servers: string[], simulate: boolean = false) {
        this.ns = ns;
        for (const server of servers) {
            if (ns.hasRootAccess(server)) {
                const maxRam = ns.getServerMaxRam(server);
                // Save some extra ram on home. Clamp used ram to maxRam to prevent negative numbers.
                const reserved = server === "home" ? RESERVED_HOME_RAM : 0;
                const used = Math.min(
                    (simulate ? 0 : ns.getServerUsedRam(server)) + reserved,
                    maxRam
                );
                const ram = maxRam - used;
                if (maxRam > 0) {
                    const block: Block = { server: server, ram: ram };
                    this.blocks.push(block);
                    if (ram < this.minBlockSize) this.minBlockSize = ram;
                    if (ram > this.maxBlockSize) this.maxBlockSize = ram;
                    this.totalRam += ram;
                    this.maxRam += maxRam;
                    this.prepThreads += Math.floor(ram / 1.75);
                }
            }
        }
        this.sort();
        this.blocks.forEach((block, index) =>
            this.index.set(block.server, index)
        );
    }

    sort() {
        this.blocks.sort((x, y) => {
            if (x.server === "home") return 1;
            if (y.server === "home") return -1;

            return x.ram - y.ram;
        });
    }

    get TotalRam() {
        return this.totalRam;
    }

    get MaxRam() {
        return this.maxRam;
    }

    get MaxBlockSize() {
        return this.maxBlockSize;
    }

    get PrepThreads() {
        return this.prepThreads;
    }

    getBlock(server) {
        if (this.index.has(server)) {
            return this.blocks[this.index.get(server)];
        } else {
            throw new Error(`Server ${server} not found in RamNet.`);
        }
    }

    assign(job) {
        const block = this.blocks.find((block) => block.ram >= job.cost);
        if (block) {
            job.server = block.server;
            block.ram -= job.cost;
            this.totalRam -= job.cost;
            return true;
        } else return false;
    }

    finish(job) {
        const block = this.getBlock(job.server);
        block.ram += job.cost;
        this.totalRam += job.cost;
    }

    cloneBlocks() {
        return this.blocks.map((block) => ({ ...block }));
    }

    printBlocks(ns) {
        for (const block of this.blocks) ns.print(block);
    }

    testThreads(threadCosts) {
        const pRam = this.cloneBlocks();
        let batches = 0;
        let found = true;
        while (found) {
            for (const cost of threadCosts) {
                found = false;
                const block = pRam.find((block) => block.ram >= cost);
                if (block) {
                    block.ram -= cost;
                    found = true;
                } else break;
            }
            if (found) batches++;
        }
        return batches;
    }
}
