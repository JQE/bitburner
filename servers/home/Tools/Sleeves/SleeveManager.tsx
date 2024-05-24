import { CrimeType } from "NetscriptDefinitions";

export async function main(ns: NS) {
    let running = true;
    let currentClass = "";
    while (running) {
        const sleeveCount = ns.sleeve.getNumSleeves();
        for (let i = 0; i < sleeveCount; i++) {
            const sleeve = ns.sleeve.getSleeve(i);
            const task = ns.sleeve.getTask(i);
            if (sleeve.shock > 0) {
                if (task.type !== "RECOVERY") {
                    ns.sleeve.setToShockRecovery(i);
                }
            } else if (sleeve.sync < 100) {
                if (task.type !== "SYNCHRO") {
                    ns.sleeve.setToSynchronize(i);
                }
            } else {
                let crime = "Rob Store";
                if (
                    sleeve.skills.strength <= 50 &&
                    sleeve.skills.strength > 20
                ) {
                    crime = "Mug";
                } else if (sleeve.skills.strength > 50) {
                    crime = "Homicide";
                }
                if (currentClass !== crime) {
                    currentClass = crime;
                    ns.sleeve.setToCommitCrime(i, crime as CrimeType);
                }
            }
        }
        await ns.sleep(5000);
    }
}
