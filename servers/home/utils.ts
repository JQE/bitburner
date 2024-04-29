import { Task } from "NetscriptDefinitions";
import { LifeStages } from "./Tools/LifeManager/types";
import { HackType } from "./types";

export const formatTime = (miliseconds) => {
    let minutes = 0;
    let seconds = 0;
    if (miliseconds > 60000) {
        minutes = Math.floor(miliseconds / 60000);
        miliseconds = miliseconds - minutes * 60000;
    }
    if (miliseconds > 1000) {
        seconds = Math.floor(miliseconds / 1000);
    }
    let outputstring = "";
    if (minutes > 0) {
        if (minutes > 9) {
            outputstring += `${minutes}:`;
        } else {
            outputstring += `0${minutes}:`;
        }
    }
    if (seconds > 9) {
        outputstring += `${seconds}`;
    } else {
        outputstring += `0${seconds}`;
    }
    return outputstring;
};

export const hackTypeToString = (hack: HackType) => {
    switch (hack) {
        case HackType.Basic:
            return "Basic";
        case HackType.Share:
            return "Share";
        case HackType.Batch:
            return "Batch";
    }
};

export const lifeStageToString = (stage: LifeStages) => {
    switch (stage) {
        case LifeStages.University:
            return "University";
        case LifeStages.Crime:
            return "Crime";
        case LifeStages.Factions:
            return "Factions";
        case LifeStages.Unmanaged:
            return "Unmanaged";
        case LifeStages.Unknown:
        default:
            return "Unknown";
    }
};

export const actionToString = (task: Task) => {
    if (task.type === "CRIME") {
        return task.crimeType;
    }
    if (task.type === "CLASS") {
        return task.classType;
    }
    if (task.type === "FACTION") {
        return task.factionWorkType;
    }
};

export const findServerPath = (ns: NS, target: string): string[] => {
    let path = [];
    const recursiveScan = (current: string, parent: string[]) => {
        let newParent = parent;
        if (current === target) {
            parent.forEach((info) => {
                path.push(info);
            });
        }
        const servers = ns.scan(current);
        if (current !== "home") servers.shift();
        for (const server of servers) {
            parent.push(server);
            recursiveScan(server, parent);
            parent.pop();
        }
    };
    recursiveScan("home", []);
    return path;
};
