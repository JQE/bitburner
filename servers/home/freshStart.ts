import { NS } from "NetscriptDefinitions";

export async function main(ns: NS) {
    ns.tprint(
        `when this script ends you should go to university until you reach level 10 hacking skill (minimum)`
    );
    ns.tprint(
        "Once you do you should then switch to crime in the slums (Robbery, then mugging) to make some money"
    );

    const homeRam = ns.getServerMaxRam("home");
    if (homeRam < 256) {
        const servers = [];

        const recursiveScan = (target: string) => {
            if (servers.includes(target)) return;
            if (target.startsWith("pserv")) return;
            servers.push(target);
            const connectedNodes = ns.scan(target);
            for (const node of connectedNodes)
                if (node !== "Home" && !node.startsWith("pserv")) {
                    recursiveScan(node);
                }
        };

        recursiveScan("home");

        servers.forEach((server) => {
            const numPorts = ns.getServerNumPortsRequired(server);
            if (numPorts <= 1) {
                if (numPorts === 1) {
                    ns.brutessh(server);
                }
                const maxRam = ns.getServerMaxRam(server);
                const threads = Math.floor(maxRam / 2.4);
                //ns.sqlinject(server);
                //ns.httpworm(server);
                //ns.relaysmtp(server);
                //ns.ftpcrack(server);
                //ns.brutessh(server);
                ns.nuke(server);
                ns.scp("baseHack.js", server);
                ns.exec("baseHack.js", server, threads);
            }
        });
        ns.tprint(
            `Your goal right now is to get your home server to a minimum of 256GB and a full compliment of private servers`
        );
        ns.tprint(`You can run the purchase-8gb.js file to accomplish this.`);
    } else {
        if (!ns.hasTorRouter()) {
            ns.tprint(`Buy the TOR router to speed up tool gathering`);
        }
        ns.tprint(
            `I am going to end this script. Please run the myHacks/main.js file instead.`
        );
        ns.tprint(
            `You now want to get your private servers to 128GB then switch to batching for cash`
        );
    }
}
