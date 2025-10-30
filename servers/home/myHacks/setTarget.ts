
export async function main(ns: NS) {
    const target = ns.args[0];
    ns.clearPort(1);
    ns.writePort(1, target);
}