/** @param {NS} ns */
export async function main(ns) {
    let localRam = ns.getServerMaxRam("home");
    ns.printf("Max ram is %d", localRam);
    if (localRam < 32) {
        ns.printf("Running early Game script");
        ns.exec("earlyGame.js", "home");
    } else {
        ns.printf("Running hack the planet");
        ns.exec("htp.js", "home");
    }
}
