/*
	A pretty big change this time. Well, big for workers anyway. I've tightened up the delay calculations
	to be as perfect as I can get them. Full comments in weaken.js as usual.
*/

/** @param {NS} ns */
export async function main(ns: NS) {
    const target = ns.args[0] as string;
    const delay = ns.args[1] as number;
    const port = ns.args[2] as number;
    const report = ns.args[3] !== undefined ? (ns.args[3] as boolean) : false;

    await ns.weaken(target, { additionalMsec: delay });
    if (report) {
        ns.writePort(port, "weaken");
    }
}
