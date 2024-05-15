import React from "react";
import { NS } from "NetscriptDefinitions";
import { TailModal } from "./Utils/TailModal";
import { ControlPanel } from "./Components/ControlPanel";
import Style from "../tailwind.css";
import {
    GangInfo,
    HackInfo,
    HackStage,
    HackType,
    HacknetInfo,
    LifeInfo,
    ServerInfo,
    ServerStage,
    Settings,
} from "./types";
import { formatTime, lifeStageToString } from "./utils";
import {
    GANGPORT,
    HACKPORT,
    SERVERPORT,
    LIFEPORT,
    HACKNETPORT,
} from "./Constants";
import { ActivityFocus } from "./Tools/Gangs/Gangs";
import { LifeStages } from "./Tools/LifeManager/types";

const localScripts = [
    "htp.js",
    "Tools/Gangs/Gangs.js",
    "Tools/HackManager/HackManager.js",
    "Tools/ServerManager/ServerManager.js",
    "Tools/LifeManager/LifeManager.js",
];

export async function main(ns: NS) {
    /** Alias for document to prevent excessive RAM use */
    const doc = (0, eval)("document") as Document;
    ns.disableLog("ALL");
    ns.tail();

    let running = true;
    const tm = new TailModal(ns, doc);

    /*let size = 8;
    let currentSize = 99999999999;
    let max = ns.getPurchasedServerLimit();
    let privateServers = ns.getPurchasedServers();
    let count = privateServers.length;
    let atRam = 0;
    let maxRam = ns.getPurchasedServerMaxRam();

    const countAtRam = () => {
        let tempAtRam = 0;
        privateServers.forEach((server) => {
            const info = ns.getServer(server);
            if (info.maxRam >= currentSize) {
                tempAtRam++;
            }
        });

        return tempAtRam;
    };

    atRam = count;
    if (count >= max) {
        atRam = 0;
        privateServers.forEach((server) => {
            const info = ns.getServer(server);
            if (info.maxRam < currentSize) {
                currentSize = info.maxRam;
            }
        });
        atRam = countAtRam();
        while (atRam === count && currentSize < maxRam) {
            currentSize *= 2;
            atRam = countAtRam();
        }
    }
    size = currentSize;
    if (size === 99999999999) size = 8;
    if (currentSize === 99999999999) currentSize = 8;*/

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
        MoneyGain: 0,
        Respect: 0,
        Power: 0,
        Territory: 0,
    };
    ns.clearPort(GANGPORT);
    ns.writePort(GANGPORT, JSON.stringify(defaultGang));

    const defaultServer: ServerInfo = {
        Enabled: false,
        Stage: ServerStage.Buying,
        Message: "",
        CurrentSize: 8,
        MaxSize: 0,
        Cost: 0,
        AtRam: 0,
        Max: 8,
    };
    ns.clearPort(SERVERPORT);
    ns.writePort(SERVERPORT, JSON.stringify(defaultServer));

    const defaultHack: HackInfo = {
        Enabled: false,
        Stage: HackStage.Unknown,
        Type: HackType.Basic,
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
        IncludeNet: false,
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
        ownedAugs: 0,
    };
    ns.clearPort(LIFEPORT);
    ns.writePort(LIFEPORT, JSON.stringify(defaultLife));

    const defaultHacknet: HacknetInfo = {
        Enabled: false,
        Buy: false,
        UpgradeRam: false,
        UpgradeLevel: false,
        UpgradeCores: false,
        UpgradeCache: false,
        minRam: 9999999999999,
        maxRam: 0,
        NumNodes: 0,
        NumHashes: 0,
        MaxNodes: 0,
    };
    ns.clearPort(HACKNETPORT);
    ns.writePort(HACKNETPORT, JSON.stringify(defaultHacknet));

    /*if (ns.fileExists("settings.json")) {
        const settings: Settings = JSON.parse(ns.read("settings.txt"));
        if (settings.Life) {
            ns.clearPort(LIFEPORT);
            ns.writePort(LIFEPORT, JSON.stringify(settings.Life));
        }
        if (settings.Hack) {
            ns.clearPort(HACKPORT);
            ns.writePort(HACKPORT, JSON.stringify(settings.Hack));
        }
        if (settings.Hacknet) {
            ns.clearPort(HACKNETPORT);
            ns.writePort(HACKNETPORT, JSON.stringify(settings.Hacknet));
        }
        if (settings.Gang) {
            ns.clearPort(GANGPORT);
            ns.writePort(GANGPORT, JSON.stringify(settings.Gang));
        }
        if (settings.Server) {
            ns.clearPort(SERVERPORT);
            ns.writePort(SERVERPORT, JSON.stringify(settings.Server));
        }
        ns.rm("settings.txt");
    }*/

    const handleGangLog = () => {
        const gangInfo: GangInfo = JSON.parse(ns.peek(GANGPORT));
        if (gangInfo.Enabled === true) {
            ns.print(`\x1b[35mGang Info`);
            ns.print(`Members: \x1b[36m${gangInfo.MemberCount}`);
            ns.print(
                `Money: \x1b[36m${ns.formatNumber(
                    gangInfo.MoneyGain * gangInfo.Duration,
                    2
                )}/s`
            );
            ns.print(
                `Gear: \x1b[36m${gangInfo.BuyGear}    \x1b[32mAugs: \x1b[36m${gangInfo.BuyAugs}`
            );
            ns.print(
                `Rep: \x1b[36m${ns.formatNumber(
                    gangInfo.Respect,
                    2
                )}    \x1b[32mAsc: \x1b[36m${ns.formatNumber(
                    gangInfo.BaseRep,
                    2
                )}`
            );
            ns.print(`Power: \x1b[36m${ns.formatNumber(gangInfo.Power)}`);
            ns.print(
                `Territory: \x1b[36m${ns.formatPercent(gangInfo.Territory)}`
            );
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
                `Size: \x1b[36m${serverInfo.CurrentSize}gb / ${serverInfo.MaxSize}gb`
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
        let outStage = "Unknown";
        switch (hackInfo.Stage) {
            case HackStage.Starting:
                outStage = "Starting";
                break;
            case HackStage.Prepping:
                outStage = "Prepping";
                break;
            case HackStage.Optimizing:
                outStage = "Optimizing";
                break;
            case HackStage.startingBatch:
                outStage = "Starting Batch";
                break;
            case HackStage.Batching:
                outStage = "Batching";
                break;
            case HackStage.Unknown:
            default:
        }
        ns.print(`Progresss: \x1b[36m${outStage}`);
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
            if (hackInfo.Error) {
                ns.print(`Error: ${hackInfo.Error}`);
            } else {
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
            if (lifeInfo.Faction !== undefined && lifeInfo.Faction !== "") {
                ns.print(`Faction: \x1b[36m${lifeInfo.Faction}`);
            }
            ns.print(`Augs: \x1b[36m${lifeInfo.ownedAugs}`);
        }
    };

    const handleHacknetLog = () => {
        const hacknetInfo: HacknetInfo = JSON.parse(ns.peek(HACKNETPORT));
        if (hacknetInfo.Enabled) {
            ns.print(`\x1b[35mHacknet INfo`);
            ns.print(
                `Hashes: \x1b[36m${ns.formatNumber(hacknetInfo.NumHashes, 2)}`
            );
            ns.print(
                `Nodes: \x1b[36m${hacknetInfo.NumNodes} / ${hacknetInfo.MaxNodes}`
            );
            ns.print(
                `Ram | Min: \x1b[36m${hacknetInfo.minRam} \x1b[32mMax: \x1b[36m${hacknetInfo.maxRam}`
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
        handleHacknetLog();
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
