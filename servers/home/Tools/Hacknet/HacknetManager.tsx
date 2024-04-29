import { NS } from "NetscriptDefinitions";
import { HacknetInfo } from "../../types";
import { HACKNETPORT } from "../../Constants";

export async function main(ns: NS) {
    let running = true;
    while (running) {
        while (ns.hacknet.numHashes() > ns.hacknet.hashCost("Sell for Money")) {
            ns.hacknet.spendHashes("Sell for Money");
        }
        const hacknetInfo: HacknetInfo = JSON.parse(ns.peek(HACKNETPORT));
        if (
            hacknetInfo.Buy &&
            ns.hacknet.numNodes() < ns.hacknet.maxNumNodes() &&
            ns.getServerMoneyAvailable("home") >
                ns.hacknet.getPurchaseNodeCost()
        ) {
            ns.hacknet.purchaseNode();
        }
        if (hacknetInfo.Upgrade) {
            for (let i = 0; i < ns.hacknet.numNodes(); i++) {
                const money = ns.getServerMoneyAvailable("home");
                const levelcost = ns.hacknet.getLevelUpgradeCost(i);
                if (levelcost < money) {
                    ns.hacknet.upgradeLevel(i);
                } else if (ns.hacknet.getRamUpgradeCost(i) < money) {
                    ns.hacknet.upgradeRam(i);
                } else if (ns.hacknet.getCoreUpgradeCost(i) < money) {
                    ns.hacknet.upgradeCore(i);
                } /* else if (ns.hacknet.getCacheUpgradeCost(i) < money) {
                    ns.hacknet.upgradeCache(i);
                }*/
                const stats = ns.hacknet.getNodeStats(i);
                let minRam = 99999999999;
                if (stats.ram < minRam) {
                    minRam = stats.ram;
                }
                if (stats.ram > hacknetInfo.maxRam) {
                    hacknetInfo.maxRam = stats.ram;
                }
                hacknetInfo.minRam = minRam;
            }
        }
        ns.clearPort(HACKNETPORT);
        ns.writePort(HACKNETPORT, JSON.stringify(hacknetInfo));
        await ns.sleep(1000);
    }
}
