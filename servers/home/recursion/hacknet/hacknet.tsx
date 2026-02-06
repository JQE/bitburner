import { HACKNETPORT } from "../constants";
import { HacknetInfo } from "../types";

export async function main(ns: NS) {
    if (ns.hacknet.numNodes() > 0) {
        ns.disableLog("ALL");
        ns.clearPort(HACKNETPORT);
        while (true) {
            while (
                ns.hacknet.numHashes() > ns.hacknet.hashCost("Sell for Money")
            ) {
                ns.hacknet.spendHashes("Sell for Money");
            }
            const HNInfo: HacknetInfo = {
                HashCount: ns.hacknet.numHashes(),
            };
            ns.clearPort(HACKNETPORT);
            ns.writePort(HACKNETPORT, HNInfo);
            await ns.sleep(1000);
        }
    }
}
