import React from "react";
import { TailModal } from "servers/home/Utils/TailModal";
import { BasicHack } from "./BasicHack";
import { HackControl } from "../../Components/HackControl";
import { ShareHack } from "./ShareHack";
import { BatchHack } from "./BatchHack";
import { HackInfo, HackType } from "../../types";
import { HACKPORT } from "../../Constants";

const localScripts = [
    "htp.js",
    "Tools/Gangs/Gangs.js",
    "Tools/HackManager/HackManager.js",
    "Tools/ServerManager/ServerManager.js",
    "Tools/LifeManager/LifeManager.js",
    "Tools/Hacknet/HacknetManager.js",
];

export async function main(ns: NS) {
    /** Alias for document to prevent excessive RAM use */
    const doc = (0, eval)("document") as Document;
    ns.disableLog("ALL");

    let running = true;
    let target = "n00dles";
    const basicHack: BasicHack = new BasicHack(ns, "joesguns");
    const shareHack: ShareHack = new ShareHack(ns, target);
    const batchHack: BatchHack = new BatchHack(ns, target);

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
    ns.atExit(() => {
        killAll();
    });

    while (running) {
        const hackInfo: HackInfo = JSON.parse(ns.peek(HACKPORT));
        if (hackInfo.Type === HackType.Basic) {
            await basicHack.processHack();
        } else if (hackInfo.Type === HackType.Share) {
            await shareHack.processHack();
        } else {
            await batchHack.processHack();
        }
    }
}
