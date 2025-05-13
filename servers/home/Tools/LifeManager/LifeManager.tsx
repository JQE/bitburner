import React from "react";
import { LifeStages, MyFactionList } from "./types";
import { NS } from "NetscriptDefinitions";
import { LifeInfo, ServerInfo } from "../../types";
import { LIFEPORT, SERVERPORT } from "../../Constants";
import { actionToString, findServerPath } from "../../utils";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    let lifeStage: LifeStages = LifeStages.University;
    let running = true;
    let joined = [];
    let toolCount = 0;

    const findFactionForThisReset = (): string => {
        let outFaction = "";
        const allAugs = ns.singularity.getOwnedAugmentations(true);
        let found = false;
        Object.keys(MyFactionList).forEach((loopFaction) => {
            if (found) return;
            const newFaction = MyFactionList[loopFaction];
            newFaction.augs.forEach((aug) => {
                if (found) return;
                if (!allAugs.includes(aug)) {
                    outFaction = loopFaction;
                    found = true;
                }
            });
        });
        return outFaction;
    };
    const faction: string = findFactionForThisReset();

    const manageWork = () => {
        let action = ns.singularity.getCurrentWork();
        if (lifeStage === LifeStages.University) {
            if (ns.getPlayer().skills.hacking > 10) {
                lifeStage = LifeStages.Crime;
            } else {
                if (action === null || action.type !== "CLASS") {
                    ns.singularity.universityCourse(
                        "Rothman University",
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
            const player = ns.getPlayer();
            if (
                player.factions.includes(faction) &&
                (player.factions.length > 0 ||
                    (ns.gang.inGang() && player.factions.length > 1))
            ) {
                const serverInfo: ServerInfo = JSON.parse(ns.peek(SERVERPORT));
                if (
                    ns.getPurchasedServerLimit() <= 0 ||
                    serverInfo.CurrentSize >= 128 ||
                    (serverInfo.CurrentSize === 128 &&
                        serverInfo.AtRam === serverInfo.Max)
                ) {
                    lifeStage = LifeStages.Factions;
                }
            }
        } else if (lifeStage === LifeStages.Factions) {
            // checking if i need to join a faction or change faction i work for
            if (faction === undefined || faction === "") {
                lifeStage = LifeStages.Crime;
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
                if (ns.singularity.getFactionFavor(faction) >= 150) {
                    const repPer1000 = ns.formulas.reputation.repFromDonation(
                        1000,
                        ns.getPlayer()
                    );
                    const donateAmount =
                        (MyFactionList[faction].rep / repPer1000) * 1000 + 100;
                    if (ns.getServerMoneyAvailable("home") > donateAmount) {
                        ns.singularity.donateToFaction(faction, donateAmount);
                    }
                }
            }
        }
    };

    const findAugForFaction = (): string => {
        let outAug = "";
        const allAugs = ns.singularity.getOwnedAugmentations(true);
        let found = false;
        const newFaction = MyFactionList[faction];
        newFaction.augs.forEach((aug) => {
            if (found) return;
            if (!allAugs.includes(aug)) {
                outAug = aug;
                found = true;
            }
        });
        if (!found) return "NeuroFlux Governor";
        return outAug;
    };

    const buyAugs = () => {
        // Now to see if i should install my augs, or try to buy more.
        const installedAugs = ns.singularity.getOwnedAugmentations();
        const allAugs = ns.singularity.getOwnedAugmentations(true);
        const waitingAugs = allAugs.length - installedAugs.length;
        let factionRep = 0;
        if (faction !== undefined && faction !== "") {
            factionRep = ns.singularity.getFactionRep(faction);
        }
        if ((factionRep > 500000 && waitingAugs > 0) || waitingAugs >= 10) {
            /*const settings: Settings = {};
            settings.Life = JSON.parse(ns.peek(LIFEPORT));
            settings.Hack = JSON.parse(ns.peek(HACKPORT));
            settings.Hacknet = JSON.parse(ns.peek(HACKNETPORT));
            settings.Gang = JSON.parse(ns.peek(GANGPORT));
            settings.Server = JSON.parse(ns.peek(SERVERPORT));
            ns.write("settings.txt", JSON.stringify(settings), "w");*/
            ns.singularity.installAugmentations();
        } else {
            const AugToInstall = findAugForFaction();
            const player = ns.getPlayer();
            if (player.factions.includes(faction)) {
                const repReq =
                    ns.singularity.getAugmentationRepReq(AugToInstall);
                const rep = ns.singularity.getFactionRep(faction);
                if (rep >= repReq) {
                    const cost =
                        ns.singularity.getAugmentationPrice(AugToInstall);
                    if (ns.getServerMoneyAvailable("home") > cost) {
                        ns.singularity.purchaseAugmentation(
                            faction,
                            AugToInstall
                        );
                    }
                }
            }
        }
    };

    while (running) {
        let lifeInfo: LifeInfo = JSON.parse(ns.peek(LIFEPORT));
        // Checek config to see if we are automating work jobs
        if (lifeInfo.ManageWork === true) {
            manageWork();
        } else {
            lifeStage = LifeStages.Unmanaged;
        }
        // Check if we should do some faction work.
        const factions = ns.singularity.checkFactionInvitations();
        factions.forEach((faction) => {
            if (Object.keys(MyFactionList).includes(faction)) {
                ns.singularity.joinFaction(faction);
            }
        });

        // time to upgrade our personal server maybe.
        const ramCost = ns.singularity.getUpgradeHomeRamCost();
        if (ns.getServerMoneyAvailable("home") > ramCost) {
            ns.singularity.upgradeHomeRam();
        }
        // time to upgrade our personal server maybe.
        const coreCost = ns.singularity.getUpgradeHomeCoresCost();
        if (ns.getServerMoneyAvailable("home") > coreCost) {
            ns.singularity.upgradeHomeCores();
        }
        // Buy tor router if we don't have it
        if (!ns.hasTorRouter()) {
            if (ns.getServerMoneyAvailable("home") > 200000) {
                ns.singularity.purchaseTor();
            }
        } else if (toolCount < 8) {
            // Buy our tools when we can afford it
            toolCount = 0;
            if (!ns.fileExists("BruteSSH.exe")) {
                ns.singularity.purchaseProgram("BruteSSH.exe");
                toolCount++;
            } else if (!ns.fileExists("FTPCrack.exe")) {
                toolCount++;
                ns.singularity.purchaseProgram("FTPCrack.exe");
            } else if (!ns.fileExists("relaySMTP.exe")) {
                toolCount++;
                ns.singularity.purchaseProgram("relaySMTP.exe");
            } else if (!ns.fileExists("HTTPWorm.exe")) {
                toolCount++;
                ns.singularity.purchaseProgram("HTTPWorm.exe");
            } else if (!ns.fileExists("SQLInject.exe")) {
                toolCount++;
                ns.singularity.purchaseProgram("SQLInject.exe");
            } else if (!ns.fileExists("DeepscanV1.exe")) {
                toolCount++;
                ns.singularity.purchaseProgram("DeepscanV1.exe");
            } else if (!ns.fileExists("DeepscanV2.exe")) {
                toolCount++;
                ns.singularity.purchaseProgram("DeepscanV2.exe");
            } else if (!ns.fileExists("AutoLink.exe")) {
                toolCount++;
                ns.singularity.purchaseProgram("AutoLink.exe");
            } else {
                toolCount = 8;
            }
        }

        // Join a gang if we can and if we enabled it
        if (
            lifeInfo.JoinGang &&
            ns.heart.break() < -54000 &&
            !ns.gang.inGang()
        ) {
            let player = ns.getPlayer();
            if (!player.factions.includes("Slum Snakes")) {
                const invites = ns.singularity.checkFactionInvitations();
                if (invites.includes("Slum Snakes")) {
                    ns.singularity.joinFaction("Slum Snakes");
                    joined.push("Slum Snakes");
                    player = ns.getPlayer();
                } else {
                    return;
                }
            }
            for (let i = 0; i < player.factions.length; i++) {
                const myFaction = player.factions[i];
                if (myFaction === "Slum Snakes") {
                    ns.gang.createGang("Slum Snakes");
                    i = player.factions.length;
                }
            }
        }
        if (
            !joined.includes("Tian Di Hui") &&
            faction === "Tian Di Hui" &&
            ns.getPlayer().city !== "Ishima"
        ) {
            ns.singularity.travelToCity("Ishima");
        } else if (
            faction !== "Tian Di Hui" &&
            ns.getPlayer().city !== "Sector-12"
        ) {
            ns.singularity.travelToCity("Sector-12");
        }
        // Buy our augs if we enabled it
        if (lifeInfo.BuyAugs) {
            buyAugs();
        }

        if (ns.singularity.exportGameBonus()) {
            ns.singularity.exportGame();
        }

        // This is where we try to backdoor any factions we don't have
        for (const aFaction of Object.keys(MyFactionList)) {
            if (joined.includes(aFaction)) continue;
            const factionInfo = MyFactionList[aFaction];
            const player = ns.getPlayer();
            if (factionInfo.Backdoor) {
                if (ns.hasRootAccess(factionInfo.Server)) {
                    const server = ns.getServer(factionInfo.Server);
                    if (server.backdoorInstalled) {
                        joined.push(aFaction);
                    } else if (
                        server.requiredHackingSkill < player.skills.hacking
                    ) {
                        const path = findServerPath(ns, server.hostname);
                        path.forEach((con) => {
                            ns.singularity.connect(con);
                        });
                        await ns.singularity.installBackdoor();
                        joined.push(aFaction);
                        ns.singularity.connect("home");
                    }
                }
            }
        }

        const allAugs = ns.singularity.getOwnedAugmentations(true);
        if (allAugs.includes("The Red Pill")) {
            const server = ns.getServer("w0r1d_d43m0n");
            if (server.requiredHackingSkill < ns.getPlayer().skills.hacking) {
                const path = findServerPath(ns, "w0r1d_d43m0n");
                path.forEach((con) => {
                    ns.singularity.connect(con);
                });

                await ns.singularity.installBackdoor();
            }
        }

        // This is to updated our reporting threads.
        const action = ns.singularity.getCurrentWork();
        lifeInfo.Action = action !== null ? actionToString(action) : undefined;
        lifeInfo.Stage = lifeStage;
        lifeInfo.Faction = faction;
        const ownedAugs = ns.singularity.getOwnedAugmentations(false).length;
        const purchased = allAugs.length - ownedAugs;
        lifeInfo.ownedAugs = purchased;
        ns.clearPort(LIFEPORT);
        ns.writePort(LIFEPORT, JSON.stringify(lifeInfo));
        await ns.asleep(1000);
    }
}
