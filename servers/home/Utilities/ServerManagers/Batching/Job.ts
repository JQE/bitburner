import { COSTS } from "../../../myHacks/batching/Constants";
import { Metrics } from "./Metrics";

export class Job {
    type: string;
    end: number;
    time: number;
    target: string;
    threads: number;
    cost: number;
    server: string;
    report: boolean;
    port: number;
    batch: number;
    status: string;
    id: string;

    constructor(type: string, metrics: Metrics, batch: number) {
        this.type = type;
        // this.end = metrics.ends[type];
        this.end = metrics.end;
        this.time = metrics.times[type];
        this.target = metrics.target;
        this.threads = metrics.threads[type];
        this.cost = this.threads * COSTS[type];
        this.server = "none";
        this.report = true;
        this.port = metrics.port;
        this.batch = batch;

        // The future is now. The status and id are used for interacting with the Deque and Map in our batcher class.
        this.status = "active";
        this.id = type + batch;
        // this.log = metrics.log; // -LOGGING
    }
}
