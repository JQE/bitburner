import React from "react";
import { TailModal } from "servers/home/Utils/TailModal";
import { BasicHack } from "./BasicHack";
import { HackControl } from "./Components/HackControl";

export enum HackType {
    Basic = 1,
    Share,
    Batch,
}
const localScripts = [
    "htp.js",
    "Tools/Gangs/Gangs.js",
    "Tools/HackManager/HackManager.js",
    "Tools/ServerManager/ServerManager.js",
];

export async function main(ns: NS) {
    /** Alias for document to prevent excessive RAM use */
    const doc = (0, eval)("document") as Document;
    ns.disableLog("ALL");
    ns.tail();

    const tm = new TailModal(ns, doc);

    let hack: HackType = HackType.Basic;
    let hacking = false;
    let running = true;
    let target = "n00dles";
    let basicHack: BasicHack = new BasicHack(ns, target);

    const onHackType = (type: HackType): HackType => {
        hack = type;
        return hack;
    };

    const onHack = (): boolean => {
        hacking = !hacking;
        if (hacking === false) {
            killAll();
        }
        return hacking;
    };

    tm.renderCustomModal(
        <HackControl
            ns={ns}
            defaultHacking={hacking}
            onHack={onHack}
            defaultType={hack}
            onHackType={onHackType}
        ></HackControl>,
        "Server Controls",
        300
    );
    ns.atExit(() => {
        ns.closeTail();
    });

    const getServers = (
        lambdaCondition = (hostname: string) => true,
        hostname = "home",
        servers: string[] = [],
        visited: string[] = []
    ) => {
        if (visited.includes(hostname)) return;
        visited.push(hostname);
        if (lambdaCondition(hostname)) servers.push(hostname);
        const connectedNodes = ns.scan(hostname);
        if (hostname !== "home") connectedNodes.shift();
        for (const node of connectedNodes)
            getServers(lambdaCondition, node, servers, visited);
        return servers;
    };

    const killAll = () => {
        const servers = getServers((server) => {
            return ns.hasRootAccess(server);
        }, "home");
        servers.forEach((server) => {
            ns.print(`Kill scripts on ${server}`);
            if (server !== "home") {
                ns.killall(server);
            } else {
                const ps = ns.ps(server);
                ps.forEach((process) => {
                    if (!localScripts.includes(process.filename)) {
                        ns.scriptKill(process.filename, server);
                    }
                });
            }
        });
    };

    const hackTypeToString = () => {
        switch (hack) {
            case 1:
                return "Basic";
            case 2:
                return "Share";
            case 3:
                return "Batch";
        }
    };

    while (running) {
        ns.clearLog();
        ns.print(`Hacking Enabled: ${hacking}    Type: ${hackTypeToString()}`);
        if (hacking) {
            if (hack === HackType.Basic) {
                basicHack.processHack();
            } else if (hack === HackType.Share) {
                basicHack.processHack();
            } else {
                alert("Adding batching logic");
            }
        }
        await ns.asleep(1000);
    }
}
