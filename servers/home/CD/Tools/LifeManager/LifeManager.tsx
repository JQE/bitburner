import React from "react";
import {
    FactionsForAugs,
    LifeStages,
    Sector12MaxRep,
    TianMaxRep,
    acceptedFactions,
    factionsForWork,
} from "./types";
import { NS } from "NetscriptDefinitions";
import { LifeInfo, ServerInfo } from "../../types";
import { LIFEPORT, SERVERPORT } from "../../Constants";
import { actionToString } from "../../utils";

const getNewFaction = (ns: NS) => {
    const player = ns.getPlayer();
    for (let i = 0; i < factionsForWork.length; i++) {
        const newFaction = factionsForWork[i];
        if (player.factions.includes(newFaction)) {
            const factionRep = ns.singularity.getFactionRep(newFaction);
            if (newFaction === "Tian Di Hui" && factionRep < TianMaxRep) {
                return newFaction;
            } else if (
                newFaction === "Sector-12" &&
                factionRep < Sector12MaxRep
            ) {
                return newFaction;
            }
        }
    }
    return undefined;
};

export async function main(ns: NS) {
    ns.disableLog("ALL");
    let lifeStage: LifeStages = LifeStages.University;
    let running = true;
    let faction: string = undefined;

    const manageWork = () => {
        let action = ns.singularity.getCurrentWork();
        if (lifeStage === LifeStages.University) {
            if (ns.getPlayer().skills.hacking > 10) {
                lifeStage = LifeStages.Crime;
            } else {
                if (action === null || action.type !== "CLASS") {
                    lifeStage = LifeStages.Crime;
                    ns.singularity.universityCourse(
                        "rothman university",
                        "Computer Science",
                        true
                    );
                }
            }
        } else if (lifeStage === LifeStages.Crime) {
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
            if (ns.getPlayer().factions.length > 0) {
                const serverInfo: ServerInfo = JSON.parse(ns.peek(SERVERPORT));
                console.log(serverInfo);
                if (
                    serverInfo.CurrentSize > 128 ||
                    (serverInfo.CurrentSize === 127 &&
                        serverInfo.AtRam === serverInfo.Max)
                ) {
                    console.log("Updating lifestage?");
                    lifeStage = LifeStages.Factions;
                }
            }
        } else if (lifeStage === LifeStages.Factions) {
            // checking if i need to join a faction or change faction i work for
            faction = getNewFaction(ns);
            if (faction === undefined) {
                lifeStage = LifeStages.Unknown;
            } else {
                if (action.type !== "FACTION") {
                    if (
                        ns.singularity.workForFaction(faction, "hacking") ===
                        false
                    ) {
                        if (
                            ns.singularity.workForFaction(faction, "field") ===
                            false
                        ) {
                            ns.singularity.workForFaction(faction, "security");
                        }
                    }
                }
            }
        }
    };

    const findFactionForAugs = (): [string, string] => {
        for (let i = 0; i < FactionsForAugs.length; i++) {
            const newFaction = FactionsForAugs[i];
            const allAugs = ns.singularity.getOwnedAugmentations(true);
            for (let a = 0; a < (newFaction[2] as string[]).length; a++) {
                if (!allAugs.includes((newFaction[2] as string[])[a])) {
                    return [
                        newFaction[0] as string,
                        (newFaction[2] as string[])[a],
                    ];
                }
            }
        }
    };

    const buyAugs = () => {
        // Now to see if i should install my augs, or try to buy more.
        const installedAugs = ns.singularity.getOwnedAugmentations();
        const allAugs = ns.singularity.getOwnedAugmentations(true);
        const waitingAugs = allAugs.length - installedAugs.length;
        if (waitingAugs > 10) {
            ns.singularity.installAugmentations();
        } else {
            const [newFaction, AugToInstall] = findFactionForAugs();
            const player = ns.getPlayer();
            if (player.city !== "Ishima" && newFaction === "Tian Di Hui") {
                ns.singularity.travelToCity("Ishima");
            } else if (
                player.city !== "Sector-12" &&
                newFaction === "Sector-12"
            ) {
                ns.singularity.travelToCity("Sector-12");
            } else {
                if (player.factions.includes(newFaction)) {
                    const repReq =
                        ns.singularity.getAugmentationRepReq(AugToInstall);
                    const rep = ns.singularity.getFactionRep(newFaction);
                    if (rep > repReq) {
                        const cost =
                            ns.singularity.getAugmentationPrice(AugToInstall);
                        if (ns.getServerMoneyAvailable("home") > cost) {
                            ns.singularity.purchaseAugmentation(
                                newFaction,
                                AugToInstall
                            );
                        }
                    }
                }
            }
        }
    };

    while (running) {
        let lifeInfo: LifeInfo = JSON.parse(ns.peek(LIFEPORT));
        if (lifeInfo.ManageWork === true) {
            manageWork();
        } else {
            lifeStage = LifeStages.Unmanaged;
        }
        // Check if we should do some faction work.
        const factions = ns.singularity.checkFactionInvitations();
        factions.forEach((faction) => {
            if (acceptedFactions.includes(faction)) {
                ns.singularity.joinFaction(faction);
            }
        });

        // time to upgrade our personal server maybe.
        const cost = ns.singularity.getUpgradeHomeRamCost();
        if (ns.getServerMoneyAvailable("home") > cost) {
            ns.singularity.upgradeHomeRam();
        }

        if (!ns.hasTorRouter()) {
            if (ns.getServerMoneyAvailable("home") > 200000) {
                ns.singularity.purchaseTor();
            }
        } else {
            if (!ns.fileExists("BruteSSH.exe")) {
                ns.singularity.purchaseProgram("BruteSSH.exe");
            } else if (!ns.fileExists("FTPCrack.exe")) {
                ns.singularity.purchaseProgram("FTPCrack.exe");
            } else if (!ns.fileExists("relaySMTP.exe")) {
                ns.singularity.purchaseProgram("relaySMTP.exe");
            } else if (!ns.fileExists("HTTPWorm.exe")) {
                ns.singularity.purchaseProgram("HTTPWorm.exe");
            } else if (!ns.fileExists("SQLInject.exe")) {
                ns.singularity.purchaseProgram("SQLInject.exe");
            } else if (!ns.fileExists("DeepscanV1.exe")) {
                ns.singularity.purchaseProgram("DeepscanV1.exe");
            } else if (!ns.fileExists("DeepscanV2.exe")) {
                ns.singularity.purchaseProgram("DeepscanV2.exe");
            } else if (!ns.fileExists("AutoLink.exe")) {
                ns.singularity.purchaseProgram("AutoLink.exe");
            }
        }
        if (
            lifeInfo.JoinGang &&
            ns.heart.break() < -54000 &&
            !ns.gang.inGang()
        ) {
            const player = ns.getPlayer();
            for (let i = 0; i < player.factions.length; i++) {
                const myFaction = player.factions[i];
                if (myFaction === "Slum Snakes") {
                    ns.gang.createGang("Slum Snakes");
                    i = player.factions.length;
                }
            }
        }
        if (lifeInfo.BuyAugs) {
            buyAugs();
        }
        const action = ns.singularity.getCurrentWork();
        lifeInfo.Action = action !== null ? actionToString(action) : undefined;
        lifeInfo.Stage = lifeStage;
        lifeInfo.Faction = faction;
        ns.clearPort(LIFEPORT);
        ns.writePort(LIFEPORT, JSON.stringify(lifeInfo));
        await ns.asleep(5);
    }
}
