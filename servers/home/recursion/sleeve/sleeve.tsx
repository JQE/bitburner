import { CrimeType } from "NetscriptDefinitions";
import { SleeveInfo } from "../types";
import { SLEEVEPORT } from "../constants";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    const workingFactions = [];
    if (ns.gang.inGang()) {
        const gang = ns.gang.getGangInformation();
        workingFactions.push(gang.faction);
    }
    const sleeveCount = ns.sleeve.getNumSleeves();
    for (let i = 0; i < sleeveCount; i++) {
        ns.sleeve.setToIdle(i);
    }
    while (true) {
        const sleeveCount = ns.sleeve.getNumSleeves();
        const myFactions = ns.getPlayer().factions;
        let recovered = sleeveCount;
        let synced = sleeveCount;
        for (let i = 0; i < sleeveCount; i++) {
            const sleeve = ns.sleeve.getSleeve(i);
            let task = ns.sleeve.getTask(i);
            if (sleeve.shock > 0) {
                recovered--;
                synced--;
                if (task === null || task.type !== "RECOVERY") {
                    ns.sleeve.setToShockRecovery(i);
                }
            } else if (sleeve.sync < 100) {
                synced--;
                if (task === null || task.type !== "SYNCHRO") {
                    ns.sleeve.setToSynchronize(i);
                }
            } else {
                let foundWork = task !== null && task.type === "FACTION";
                if (!foundWork) {
                    if (workingFactions.length != myFactions.length) {
                        for (let ii = 0; ii < myFactions.length; ii++) {
                            if (!workingFactions.includes(myFactions[ii])) {
                                workingFactions.push(myFactions[ii]);
                                if (
                                    ns.sleeve.setToFactionWork(
                                        i,
                                        myFactions[ii],
                                        "field",
                                    ) === false
                                ) {
                                    ns.sleeve.setToFactionWork(
                                        i,
                                        myFactions[ii],
                                        "hacking",
                                    );
                                }
                                foundWork = true;
                                ii = myFactions.length;
                            }
                        }
                    }
                }
                if (!foundWork) {
                    ns.sleeve.setToCommitCrime(i, "Homicide");
                }
            }
            if (sleeve.shock <= 0 && sleeve.sync === 100) {
                const augs = ns.sleeve.getSleevePurchasableAugs(i);
                for (let aug = 0; aug < augs.length; aug++) {
                    if (augs[aug].cost < ns.getServerMoneyAvailable("home")) {
                        ns.sleeve.purchaseSleeveAug(i, augs[aug].name);
                    }
                }
            }
        }
        const SLInfo: SleeveInfo = {
            InShock: recovered,
            Count: sleeveCount,
        };
        ns.clearPort(SLEEVEPORT);
        ns.writePort(SLEEVEPORT, SLInfo);
        await ns.asleep(5000);
    }
}
