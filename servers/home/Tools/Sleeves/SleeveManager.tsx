import { CrimeType } from "NetscriptDefinitions";
import { SLEEVEPORT } from "servers/home/Constants";
import { SleeveInfo } from "servers/home/types";

export async function main(ns: NS) {
    ns.atExit(() => {
        ns.tprint(`Sleeve Manager exitied`);
        const sleeveInfo: SleeveInfo = JSON.parse(ns.peek(SLEEVEPORT));
        sleeveInfo.Enabled = false;
        ns.clearPort(SLEEVEPORT);
        ns.writePort(SLEEVEPORT, JSON.stringify(sleeveInfo));
    });
    let running = true;
    const workingFactions = [];
    const gang = ns.gang.getGangInformation();
    if (ns.gang.inGang()) {
        workingFactions.push(gang.faction);
    }
    const sleeveCount = ns.sleeve.getNumSleeves();
    for (let i = 0; i < sleeveCount; i++) {
        ns.sleeve.setToIdle(i);
    }
    while (running) {
        let sleeveInfo: SleeveInfo = JSON.parse(ns.peek(SLEEVEPORT));
        const sleeveCount = ns.sleeve.getNumSleeves();
        const myFactions = ns.getPlayer().factions;
        let recovered = sleeveCount;
        let synced = sleeveCount;
        for (let i = 0; i < sleeveCount; i++) {
            const sleeve = ns.sleeve.getSleeve(i);
            const task = ns.sleeve.getTask(i);
            if (sleeve.shock > 0) {
                recovered--;
                synced--;
                if (task.type !== "RECOVERY") {
                    ns.sleeve.setToShockRecovery(i);
                }
            } else if (sleeve.sync < 100) {
                synced--;
                if (task.type !== "SYNCHRO") {
                    ns.sleeve.setToSynchronize(i);
                }
            } else {
                let foundWork = task !== null && task.type === "FACTION";
                if (!foundWork) {
                    if (workingFactions.length != myFactions.length) {
                        for (let ii = 0; ii < myFactions.length; ii++) {
                            console.log(`Checking Faction ${myFactions[ii]}`);
                            if (!workingFactions.includes(myFactions[ii])) {
                                workingFactions.push(myFactions[ii]);
                                if (
                                    ns.sleeve.setToFactionWork(
                                        i,
                                        myFactions[ii],
                                        "field"
                                    ) === false
                                ) {
                                    ns.sleeve.setToFactionWork(
                                        i,
                                        myFactions[ii],
                                        "hacking"
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
            if (sleeveInfo.BuyAugs) {
                const augs = ns.sleeve.getSleevePurchasableAugs(i);
                for (let aug = 0; aug < augs.length; aug++) {
                    if (augs[aug].cost < ns.getServerMoneyAvailable("home")) {
                        ns.sleeve.purchaseSleeveAug(i, augs[aug].name);
                    }
                }
            }
        }
        sleeveInfo = JSON.parse(ns.peek(SLEEVEPORT));
        sleeveInfo.Recovered = recovered;
        sleeveInfo.Synchronized = synced;
        ns.clearPort(SLEEVEPORT);
        ns.writePort(SLEEVEPORT, JSON.stringify(sleeveInfo));
        await ns.sleep(5000);
    }
}
