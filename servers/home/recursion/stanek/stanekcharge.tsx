export async function main(ns: NS) {
    ns.disableLog("ALL");
    while (true) {
        try {
            for (let frag of ns.stanek.activeFragments()) {
                if (frag.type !== 18) {
                    ns.stanek.chargeFragment(frag.x, frag.y);
                    await ns.sleep(0); // Yield
                }
            }
        } catch (err) {
            ns.tprint(`ERROR: ${err}`);
            await ns.sleep(1000);
        }
        await ns.sleep(50);
    }
}
