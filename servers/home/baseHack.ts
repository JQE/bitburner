export async function main(ns: NS) {
    const target = "joesguns";
    //ns.args[0] !== undefined ? (ns.args[0] as string) : "joesguns";
    // Defines how much money a server should have before we hack it
    // In this case, it is set to the maximum amount of money.
    let moneyThresh = ns.getServerMaxMoney(target);

    // Defines the maximum security level the target server can
    // have. If the target's security level is higher than this,
    // we'll weaken it before doing anything else
    let securityThresh = ns.getServerMinSecurityLevel(target);

    // Infinite loop that continously hacks/grows/weakens the target server
    while (true) {
        const security = ns.getServerSecurityLevel(target);
        const cash = ns.getServerMoneyAvailable(target);
        if (security > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            await ns.weaken(target);
        } else if (cash < moneyThresh) {
            // If the server's money is less than our threshold, grow it
            await ns.grow(target);
        } else {
            // Otherwise, hack it
            await ns.hack(target);
        }
    }
}
