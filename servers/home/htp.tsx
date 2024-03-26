import React from "react";
import { TailModal } from "./Utils/TailModal";
import { ControlPanel } from "./Components/ControlPanel/ControlPanel";
import Style from "../tailwind.css";
import { NS, NetscriptPort } from "NetscriptDefinitions";

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

    let server = false;
    let serverPid = 0;

    let gangs = false;
    let gangPid = 0;

    let hack = false;
    let hackPid = 0;

    let running = true;

    const tm = new TailModal(ns, doc);

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

    const onHack = () => {
        hack = !hack;
        if (hack === true) {
            hackPid = ns.exec("Tools/HackManager/HackManager.js", "home");
            if (hackPid === 0) {
                ns.print("Failed to run Gangs script");
                hack = false;
            }
        } else {
            if (hackPid !== 0) {
                ns.kill("Tools/HackManager/HackManager.js", "home");
                killAll();
                hackPid = 0;
            }
        }
    };

    const onGangs = () => {
        gangs = !gangs;
        if (gangs === true) {
            gangPid = ns.exec("Tools/Gangs/Gangs.js", "home");
            if (gangPid === 0) {
                ns.print("Failed to run Gangs script");
                gangs = false;
            }
        } else {
            if (gangPid !== 0) {
                ns.kill("Tools/Gangs/Gangs.js", "home");
                gangPid = 0;
            }
        }
    };

    const onServer = () => {
        server = !server;
        if (server === true) {
            serverPid = ns.exec("Tools/ServerManager/ServerManager.js", "home");
            if (serverPid === 0) {
                ns.print("Failed to run Gangs script");
                server = false;
            }
        } else {
            if (serverPid !== 0) {
                ns.kill("Tools/ServerManager/ServerManager.js", "home");
                serverPid = 0;
            }
        }
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

    const onQuit = () => {
        ns.print("Exiting scripts");
        if (gangPid !== 0) {
            ns.kill("Tools/Gangs/Gangs.js", "home");
            gangPid = 0;
        }

        if (serverPid !== 0) {
            ns.kill("Tools/ServerManager/ServerManager.js", "home");
            serverPid = 0;
        }

        if (hackPid !== 0) {
            ns.kill("Tools/HackManager/HackManager.js", "home");
            killAll();
            hackPid = 0;
        }
        running = false;
    };

    tm.renderCustomModal(
        <>
            <Style></Style>
            <ControlPanel
                onGangs={onGangs}
                onQuit={onQuit}
                onServer={onServer}
                onHack={onHack}
            ></ControlPanel>
        </>,
        "Main Control Panel",
        300
    );

    ns.atExit(() => {
        ns.print("Exiting scripts");
        ns.closeTail();
        if (gangPid !== 0) {
            ns.kill("Tools/Gangs/Gangs.js", "home");
            gangPid = 0;
        }

        if (hackPid !== 0) {
            ns.kill("Tools/HackManager/HackManager.js", "home");
            killAll();
            hackPid = 0;
        }

        if (serverPid !== 0) {
            ns.kill("Tools/ServerManager/ServerManager.js", "home");
            serverPid = 0;
        }
    });

    while (running) {
        await ns.asleep(1000);
    }
    ns.closeTail();
}
