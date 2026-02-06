import { STANEKPORT } from "servers/home/Constants";
import { StanekInfo } from "../../types";
import { ActiveFragment } from "@/NetscriptDefinitions";

export async function main(ns: NS) {
    let stanekInfo: StanekInfo = JSON.parse(ns.peek(STANEKPORT));
    while (stanekInfo.Enabled) {
        const fragments = ns.stanek.activeFragments();
        for (let i = 0; i < fragments.length; i++) {
            const fragment = fragments[i];
            if (fragment.type !== 18) {
                await ns.stanek.chargeFragment(fragment.x, fragment.y);
            }
        }
        await ns.asleep(1000);
        stanekInfo = JSON.parse(ns.peek(STANEKPORT));
    }
}
