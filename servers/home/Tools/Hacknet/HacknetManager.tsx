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

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            if (
                hacknetInfo.UpgradeRam ||
                hacknetInfo.UpgradeLevel ||
                hacknetInfo.UpgradeCores ||
                hacknetInfo.UpgradeCache
            ) {
                const money = ns.getServerMoneyAvailable("home");
                if (hacknetInfo.UpgradeRam) {
                    if (ns.hacknet.getRamUpgradeCost(i) < money) {
                        let c = 2;
                        while (ns.hacknet.getRamUpgradeCost(i, c) < money) {
                            c++;
                        }
                        c--;
                        ns.hacknet.upgradeRam(i, c);
                    }
                }
                if (hacknetInfo.UpgradeLevel) {
                    if (ns.hacknet.getLevelUpgradeCost(i) < money) {
                        let c = 2;
                        while (ns.hacknet.getLevelUpgradeCost(i, c) < money) {
                            c++;
                        }
                        c--;
                        ns.hacknet.upgradeLevel(i, c);
                    }
                }

                if (hacknetInfo.UpgradeCores) {
                    if (ns.hacknet.getCoreUpgradeCost(i) < money) {
                        let c = 2;
                        while (ns.hacknet.getCoreUpgradeCost(i, c) < money) {
                            c++;
                        }
                        c--;
                        ns.hacknet.upgradeCore(i, c);
                    }
                }

                if (hacknetInfo.UpgradeCache) {
                    if (ns.hacknet.getCacheUpgradeCost(i) < money) {
                        let c = 2;
                        while (ns.hacknet.getCacheUpgradeCost(i, c) < money) {
                            c++;
                        }
                        c--;
                        ns.hacknet.upgradeCache(i, c);
                    }
                }
            }
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
        hacknetInfo.NumNodes = ns.hacknet.numNodes();
        hacknetInfo.NumHashes = ns.hacknet.numHashes();
        hacknetInfo.MaxNodes = ns.hacknet.maxNumNodes();

        ns.clearPort(HACKNETPORT);
        ns.writePort(HACKNETPORT, JSON.stringify(hacknetInfo));
        await ns.sleep(1000);
    }
}
