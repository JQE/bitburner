import React from "react";
import { Task } from "@/NetscriptDefinitions";
import Style from "../../tailwind.css";
import { TailModal } from "../Utils/TailModal";
import { ControlPanel } from "./Components/ControlPanel";
import { BBInfo, HackInfo, HacknetInfo, ServerInfo, SleeveInfo } from "./types";
import {
    HACKNETPORT,
    BBPORT,
    SLEEVEPORT,
    HACKPORT,
    SERVERPORT,
} from "./constants";
import { formatTime } from "../utils";

const commitCrime = (ns: NS, action: Task) => {
    if (action === null || action.type !== "CRIME") {
        ns.singularity.commitCrime("Rob Store", true);
    } else {
        if (action.crimeType === ns.enums.CrimeType.robStore) {
            const chance = ns.singularity.getCrimeChance("Mug");
            if (chance > 0.7) {
                ns.singularity.commitCrime("Mug", true);
            }
        } else if (action.crimeType === ns.enums.CrimeType.mug) {
            if (ns.singularity.getCrimeChance("Homicide") > 0.7) {
                ns.singularity.commitCrime("Homicide", true);
            }
        }
    }
};

export async function main(ns: NS) {
    ns.disableLog("ALL");

    // setting communucation port defaults
    const bbDefault: BBInfo = {
        Action: "Starting",
        City: "Starting",
    };
    ns.clearPort(BBPORT);
    ns.writePort(BBPORT, bbDefault);

    const hnDefault: HacknetInfo = {
        HashCount: 0,
    };
    ns.clearPort(HACKNETPORT);
    ns.writePort(HACKNETPORT, hnDefault);
    const slDefault: SleeveInfo = {
        InShock: 0,
        Count: 0,
    };
    ns.clearPort(SLEEVEPORT);
    ns.writePort(SLEEVEPORT, slDefault);

    const hDefault: HackInfo = {
        Stage: 0,
        TotalPrep: 0,
        Prep: 0,
        Count: 0,
        Target: "joesguns",
        Tools: 0,
    };

    ns.clearPort(HACKPORT);
    ns.writePort(HACKPORT, hDefault);

    const sDefault: ServerInfo = {
        AtRam: 0,
        Max: 0,
        Current: 0,
        MaxRam: 0,
    };
    ns.clearPort(SERVERPORT);
    ns.writePort(SERVERPORT, sDefault);

    ns.ui.openTail();
    const doc = (0, eval)("document") as Document;
    const tm = new TailModal(ns, doc);
    let running = true;

    const onQuit = () => {
        running = false;
    };

    tm.renderCustomModal(
        <>
            <Style></Style>

            <ControlPanel ns={ns} onQuit={onQuit}></ControlPanel>
        </>,
        "Main Control Panel",
        300,
    );
    // First lets get staneks gift
    ns.print(`Working on Stanek Gift`);
    ns.singularity.travelToCity("Chongqing");
    ns.stanek.acceptGift();

    ns.print(`Placing fragments`);
    // Now lets place all the peices of it
    let newStanekPid = ns.exec("recursion/stanek/stanekplace.js", "home");
    if (newStanekPid <= 0) {
        ns.print("Failed to run Stanek place script");
    }

    ns.print(`Starting charge script`);
    // now we start the charging script
    newStanekPid = ns.exec("recursion/stanek/stanekcharge.js", "home");
    if (newStanekPid <= 0) {
        ns.print("Failed to run Stanek charge script");
    }

    // Running hash selling if we have the starter hashnet
    const newHashNetPid = ns.exec("recursion/hacknet/hacknet.js", "home");
    if (newHashNetPid <= 0) {
        ns.print("Failed to run hashnet script");
    }

    ns.print(`Checking Ram`);
    const ram = ns.getServerMaxRam("home");
    if (ram < 128) {
        ns.print(`Working on upgrading ram`);
        // Upgrade our home RAM to ensure we can do all tasks
        let cash = ns.getPlayer().money;
        const upgradeCost = ns.singularity.getUpgradeHomeRamCost();
        while (cash < upgradeCost) {
            commitCrime(ns, ns.singularity.getCurrentWork());
            await ns.sleep(100);
        }
        ns.singularity.upgradeHomeRam();
    }

    ns.print(`Starting Blade Burner Process`);
    // Now we start bladerunner process.
    let newBladeBurnerPid = ns.exec(
        "recursion/bladeburner/bladeburner.js",
        "home",
    );
    if (newBladeBurnerPid <= 0) {
        ns.print("Failed to run Blade burner script");
    }
    // Wait until we join the blade burners
    while (!ns.bladeburner.inBladeburner()) {
        await ns.sleep(50);
    }

    // Now we can start doing other stuff.
    ns.print(`Starting Sleeve Script`);
    // Lets fire up sleeves
    let newSleevePid = ns.exec("recursion/sleeve/sleeve.js", "home");
    if (newSleevePid <= 0) {
        ns.print("Failed to run sleeve script");
    }

    // Lets start buying servers
    let newServerPid = ns.exec("recursion/servers/servers.js", "home");
    if (newServerPid <= 0) {
        ns.print("Failed to run sleeve script");
    }

    while (running) {
        const bbLog: BBInfo = ns.peek(BBPORT);
        const hnLog: HacknetInfo = ns.peek(HACKNETPORT);
        const slLog: SleeveInfo = ns.peek(SLEEVEPORT);
        const hLog: HackInfo = ns.peek(HACKPORT);
        const sLog: ServerInfo = ns.peek(SERVERPORT);

        // Managing batcher
        let shotgunPid = -1;
        if (shotgunPid === -1 || !ns.isRunning(shotgunPid)) {
            shotgunPid = ns.exec("recursion/hack/hack.js", "home");
        }

        ns.clearLog();
        ns.print(`BB Action: \x1b[36m${bbLog.Action}`);
        ns.print(`Sleeve: \x1b[36m${slLog.InShock} / ${slLog.Count}`);
        ns.print(
            `Servers: \x1b[36m${sLog.AtRam} / ${sLog.Max} / ${sLog.Current} / ${sLog.MaxRam}`,
        );
        if (ns.getRunningScript(newHashNetPid, "home")) {
            ns.print(`Hacknet: \x1b[36m${ns.formatNumber(hnLog.HashCount, 3)}`);
        }
        switch (hLog.Stage) {
            case 0:
                ns.print(`Hack: \x1b[36mStarting`);
                break;
            case 1:
                ns.print(
                    `Hack: Prep: \x1b[36m${formatTime(hLog.Prep - Date.now())} \x1b[32Total: \x1b[36m${formatTime(hLog.TotalPrep - Date.now())}`,
                );
                ns.print(`Target: \x1b[36m${hLog.Target}`);
                break;
            case 3:
                ns.print(`Hack: \x1b[36mOptimizing`);
                break;
            case 4:
                ns.print(`Hack: \x1b[36mStarting Batch`);
                break;
            case 5:
                ns.print(
                    `Hack: Servers: \x1b[36m${hLog.Count} \x1b[32Target: \x1b[36m${hLog.Target}`,
                );
                break;
        }
        ns.print(`Hack Tools: \x1b[36m${hLog.Tools}`);
        ns.print(`Heart: \x1b[36m${ns.formatNumber(ns.heart.break(), 3)}`);
        await ns.sleep(1000);
    }
    ns.killall("home");
    ns.ui.closeTail();
}
