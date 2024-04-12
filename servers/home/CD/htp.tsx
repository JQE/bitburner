import React from "react";
import { NS } from "NetscriptDefinitions";
import { TailModal } from "./Utils/TailModal";
import { ControlPanel } from "./Components/ControlPanel";
import Style from "../../tailwind.css";
import {
    GangInfo,
    HackInfo,
    HackStage,
    HackType,
    LifeInfo,
    ServerInfo,
    ServerStage,
} from "./types";
import { formatTime, lifeStageToString } from "./utils";
import { GANGPORT, HACKPORT, SERVERPORT, LIFEPORT } from "./Constants";
import { ActivityFocus } from "./Tools/Gangs/Gangs";
import { LifeStages } from "./Tools/LifeManager/types";

const localScripts = [
    "CD/htp.js",
    "CD/Tools/Gangs/Gangs.js",
    "CD/Tools/HackManager/HackManager.js",
    "CD/Tools/ServerManager/ServerManager.js",
    "CD/Tools/LifeManager/LifeManager.js",
];

export async function main(ns: NS) {
    /** Alias for document to prevent excessive RAM use */
    const doc = (0, eval)("document") as Document;
    ns.disableLog("ALL");
    ns.tail();

    let running = true;
    const tm = new TailModal(ns, doc);

    const onQuit = () => {
        running = false;
    };

    tm.renderCustomModal(
        <>
            <Style></Style>

            <ControlPanel ns={ns} onQuit={onQuit}></ControlPanel>
        </>,
        "Main Control Panel",
        300
    );

    const defaultGang: GangInfo = {
        Enabled: false,
        BuyGear: false,
        BuyAugs: false,
        Activity: ActivityFocus.Money,
        Duration: 1,
        MemberCount: 0,
        BaseRep: 0,
    };
    ns.clearPort(GANGPORT);
    ns.writePort(GANGPORT, JSON.stringify(defaultGang));

    const defaultServer: ServerInfo = {
        Enabled: false,
        Stage: ServerStage.Buying,
        Message: "",
        CurrentSize: 8,
        MaxSize: 8,
        Cost: 0,
        AtRam: 0,
        Max: 0,
    };
    ns.clearPort(SERVERPORT);
    ns.writePort(SERVERPORT, JSON.stringify(defaultServer));

    const defaultHack: HackInfo = {
        Enabled: false,
        Stage: HackStage.Unknown,
        Type: HackType.Basic,
        Reset: 0,
        Prep: 0,
        TotalPrep: 0,
        Chance: 0,
        Greed: 0,
        GreedStep: 99,
        Best: 0,
        Count: 0,
        Target: "n00dles",
        Tools: 0,
        Error: "",
    };
    ns.clearPort(HACKPORT);
    ns.writePort(HACKPORT, JSON.stringify(defaultHack));

    const defaultLife: LifeInfo = {
        Enabled: false,
        Stage: LifeStages.University,
        Action: undefined,
        Faction: undefined,
        JoinGang: false,
        ManageWork: true,
        BuyAugs: false,
    };
    ns.clearPort(LIFEPORT);
    ns.writePort(LIFEPORT, JSON.stringify(defaultLife));

    const handleGangLog = () => {
        const gangInfo: GangInfo = JSON.parse(ns.peek(GANGPORT));
        if (gangInfo.Enabled === true) {
            const gang = ns.gang.getGangInformation();
            ns.print(`\x1b[35mGang Info`);
            ns.print(`Members: \x1b[36m${gangInfo.MemberCount}`);
            ns.print(
                `Money: \x1b[36m${ns.formatNumber(
                    gang.moneyGainRate * gangInfo.Duration,
                    2
                )}/s`
            );
            ns.print(
                `Gear: \x1b[36m${gangInfo.BuyGear}    Augs: \x1b[36m${gangInfo.BuyAugs}`
            );
            ns.print(
                `Rep: \x1b[36m${ns.formatNumber(
                    gang.respect,
                    2
                )} : Asc: \x1b[36m${ns.formatNumber(gangInfo.BaseRep, 2)}`
            );
            ns.print(`Power: \x1b[36m${ns.formatNumber(gang.power)}`);
            ns.print(`Territory: \x1b[36m${ns.formatPercent(gang.territory)}`);
        }
    };

    const handleServerLog = () => {
        const serverInfo: ServerInfo = JSON.parse(ns.peek(SERVERPORT));
        if (serverInfo.Enabled) {
            ns.print(`\x1b[35mServer Info`);
            switch (serverInfo.Stage) {
                case ServerStage.Capacity:
                    ns.print(`Buying: \x1b[36mAt Capacity`);
                    break;
                case ServerStage.Buying:
                    ns.print(`Buying:\x1b[36m New Servers`);
                    break;
                case ServerStage.Upgrading:
                    ns.print(`Buying: \x1b[36mUpgrade Servers`);
                    break;
                case ServerStage.Unknown:
                default:
                    ns.print(`Something is wrong`);
            }
            ns.print(`Message: \x1b[36m${serverInfo.Message}`);
            ns.print(
                `Size: \x1b[36m${serverInfo.CurrentSize}gb /${serverInfo.MaxSize}gb`
            );
            ns.print(`Count: \x1b[36m${serverInfo.AtRam}/${serverInfo.Max}`);
            ns.print(
                `${
                    serverInfo.Cost !== undefined
                        ? `Cost: \x1b[36m${ns.formatNumber(serverInfo.Cost, 2)}`
                        : ""
                }`
            );
        }
    };

    const BasicHackLog = (hackInfo: HackInfo) => {
        ns.print(`\x1b[35mHack Info`);
        ns.print(`Server Count: \x1b[36m${hackInfo.Count}`);
        ns.print(`Target: \x1b[36m${hackInfo.Target}`);
        const security = ns.getServerSecurityLevel(hackInfo.Target);
        const money = ns.getServerMoneyAvailable(hackInfo.Target);
        const minSec = ns.getServerMinSecurityLevel(hackInfo.Target);
        const maxMoney = ns.getServerMaxMoney(hackInfo.Target);
        ns.print(
            `Security: \x1b[36m${ns.formatNumber(
                security,
                1
            )} / ${ns.formatNumber(minSec, 1)}`
        );
        ns.print(
            `Money: \x1b[36m\$${ns.formatNumber(
                money,
                2
            )} / \$${ns.formatNumber(maxMoney, 2)}`
        );
        ns.print(`Current Tool Count: \x1b[36m${hackInfo.Tools}`);
    };

    const basicShareLog = (hackInfo: HackInfo) => {
        ns.print(`\x1b[35mHack Info`);
        ns.print(`Server Count:\x1b[36m ${hackInfo.Count}`);
        ns.print(`Target:\x1b[36m ${hackInfo.Target}`);
        ns.print(
            `Share Powre: \x1b[36m${ns.formatNumber(ns.getSharePower(), 4)}`
        );
        ns.print(`Current Tool Count: \x1b[36m${hackInfo.Tools}`);
    };

    const BasicBatchLog = (hackInfo: HackInfo) => {
        ns.print(`\x1b[35mHack Info`);
        if (hackInfo.Stage === HackStage.Prepping) {
            ns.print(`Prep: \x1b[36m${formatTime(hackInfo.Prep - Date.now())}`);
            if (hackInfo.TotalPrep !== undefined) {
                ns.print(
                    `Total:\x1b[36m ${formatTime(
                        hackInfo.TotalPrep - Date.now()
                    )}`
                );
            }
        }
        ns.print(
            `Progresss: \x1b[36m${
                hackInfo.Stage === HackStage.Prepping
                    ? "Prepping"
                    : `${
                          hackInfo.Stage === HackStage.Optimizing
                              ? "Optimizing"
                              : `${
                                    hackInfo.Stage === HackStage.Batching
                                        ? "Batching"
                                        : "Unknown"
                                }`
                      }`
            }`
        );
        if (hackInfo.Stage === HackStage.Optimizing) {
            ns.print(
                `GreedStep: \x1b[36m${ns.formatNumber(hackInfo.GreedStep, 3)}`
            );
            ns.print(`Best: \x1b[36m$${ns.formatNumber(hackInfo.Best, 2)}`);
        }
        if (hackInfo.Stage === HackStage.Batching) {
            ns.print(
                `Chance: \x1b[36m${ns.formatNumber(
                    hackInfo.Chance,
                    2
                )}    \x1b[32mGreed: \x1b[36m${ns.formatNumber(
                    hackInfo.Greed,
                    3
                )}`
            );
            ns.print(
                `Reset: \x1b[36m${formatTime(hackInfo.Reset - Date.now())}`
            );
        }
        ns.print(`Server Count: \x1b[36m${hackInfo.Count}`);
        ns.print(`Target: \x1b[36m${hackInfo.Target}`);
        const security = ns.getServerSecurityLevel(hackInfo.Target);
        const minSec = ns.getServerMinSecurityLevel(hackInfo.Target);
        const money = ns.getServerMoneyAvailable(hackInfo.Target);
        const maxMoney = ns.getServerMaxMoney(hackInfo.Target);
        ns.print(
            `Security: \x1b[36m${ns.formatNumber(
                security,
                2
            )} / ${ns.formatNumber(minSec, 2)}`
        );
        ns.print(
            `Money: \x1b[36m\$${ns.formatNumber(
                money,
                2
            )} / \$${ns.formatNumber(maxMoney, 2)}`
        );
        ns.print(`Current Tool Count: \x1b[36m${hackInfo.Tools}`);
    };

    const handleHackLog = () => {
        const hackInfo: HackInfo = JSON.parse(ns.peek(HACKPORT));
        if (hackInfo.Enabled) {
            switch (hackInfo.Type) {
                case HackType.Basic:
                    BasicHackLog(hackInfo);
                    break;
                case HackType.Share:
                    basicShareLog(hackInfo);
                    break;
                case HackType.Batch:
                    BasicBatchLog(hackInfo);
                    break;
                default:
                    ns.print(`Something went wrong`);
            }
        }
    };

    const handleLifeLog = () => {
        const lifeInfo: LifeInfo = JSON.parse(ns.peek(LIFEPORT));
        if (lifeInfo.Enabled) {
            ns.print(`\x1b[35mLife Info`);
            ns.print(`Stage: \x1b[36m${lifeStageToString(lifeInfo.Stage)}`);
            ns.print(
                `Action: \x1b[36m${
                    lifeInfo.Action ? lifeInfo.Action : "Unknown"
                }`
            );
        }
    };

    while (running) {
        await ns.asleep(1000);
        ns.clearLog();
        handleGangLog();
        handleServerLog();
        handleHackLog();
        handleLifeLog();
        ns.print(``);
        ns.print(`\x1b[35mMain Info`);
        ns.print(`Heart: \x1b[36m${ns.formatNumber(ns.heart.break(), 3)}`);
    }

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

    const servers = getServers((server) => {
        return ns.hasRootAccess(server);
    }, "home");
    servers.forEach((server) => {
        ns.killall(server);
    });
    ns.closeTail();
}
