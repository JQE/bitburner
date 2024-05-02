import { GangMemberInfo } from "NetscriptDefinitions";
import React from "react";
import { GangInfo } from "../../types";
import { GANGPORT } from "../../Constants";

export enum ActivityFocus {
    Money = 1,
    Respect,
    Warfare,
    Balance,
}

export async function main(ns: NS) {
    let members: string[] = ns.gang.getMemberNames();
    const dataport = ns.getPortHandle(GANGPORT);
    let gangInfo: GangInfo = JSON.parse(dataport.peek());
    const equipment: string[] = [];
    const augs: string[] = [];
    const baseName = "Fredalina";
    let baseJob = "Mug People";
    let baseRep = 0;
    let respNum = 0;
    let moenyNum = 0;
    let warfareNum = 0;

    const eqp = ns.gang.getEquipmentNames();
    eqp.forEach((item) => {
        const info = ns.gang.getEquipmentType(item);
        if (info !== "Augmentation") {
            equipment.push(item);
        } else {
            augs.push(item);
        }
    });

    const buyUpgrades = (member: GangMemberInfo) => {
        if (member.upgrades.length < equipment.length) {
            equipment.forEach((item) => {
                if (!member.upgrades.includes(item)) {
                    const cost = ns.gang.getEquipmentCost(item);
                    const cash = ns.getServerMoneyAvailable("home");
                    if (cost < cash) {
                        ns.gang.purchaseEquipment(member.name, item);
                        return;
                    }
                }
            });
        } else {
            if (gangInfo.BuyAugs) {
                augs.forEach((item) => {
                    if (!member.upgrades.includes(item)) {
                        const cost = ns.gang.getEquipmentCost(item);
                        const cash = ns.getServerMoneyAvailable("home");
                        if (cost < cash) {
                            if (ns.gang.purchaseEquipment(member.name, item)) {
                            }
                        }
                    }
                });
            }
        }
    };

    const manageRecruitment = () => {
        if (ns.gang.canRecruitMember()) {
            let name = `${baseName}${members.length}`;
            let itr = 0;
            while (!ns.gang.recruitMember(name)) {
                ++itr;
                name = `${baseName}${members.length + itr}`;
            }
            members.push(name);
        }
    };

    const processJob = (info: GangMemberInfo, jobFocus: ActivityFocus) => {
        const gang = ns.gang.getGangInformation();

        if (jobFocus === ActivityFocus.Respect) {
            const taskStats = ns.gang.getTaskStats("Terrorism");
            const gains = {
                Wanted: ns.formulas.gang.wantedLevelGain(gang, info, taskStats),
                Respect: ns.formulas.gang.respectGain(gang, info, taskStats),
                Money: ns.formulas.gang.moneyGain(gang, info, taskStats),
            };
            if (gains.Wanted < gains.Respect || gains.Wanted < gains.Money) {
                return "Terrorism";
            }
        } else if (jobFocus === ActivityFocus.Money) {
            const taskStats = ns.gang.getTaskStats("Human Trafficking");
            const gains = {
                Wanted: ns.formulas.gang.wantedLevelGain(gang, info, taskStats),
                Respect: ns.formulas.gang.respectGain(gang, info, taskStats),
                Money: ns.formulas.gang.moneyGain(gang, info, taskStats),
            };
            if (gains.Wanted < gains.Respect || gains.Wanted < gains.Money) {
                return "Human Trafficking";
            }
        } else {
            const taskStats = ns.gang.getTaskStats("Territory Warfare");
            const gains = {
                Wanted: ns.formulas.gang.wantedLevelGain(gang, info, taskStats),
                Respect: ns.formulas.gang.respectGain(gang, info, taskStats),
                Money: ns.formulas.gang.moneyGain(gang, info, taskStats),
            };
            if (gains.Wanted < gains.Respect || gains.Wanted < gains.Money) {
                return "Territory Warfare";
            }
        }
        return baseJob;
    };

    const getJob = (info: GangMemberInfo) => {
        if (
            info.str < 200 ||
            info.def < 200 ||
            info.agi < 200 ||
            info.dex < 200
        ) {
            return "Train Combat";
        }
        if (info.cha < 200) {
            return "Train Charisma";
        }
        if (info.hack < 200) {
            return "Train Hacking";
        }
        if (gangInfo.Activity === ActivityFocus.Balance) {
            if (moenyNum < members.length / 3) {
                moenyNum++;
                return processJob(info, ActivityFocus.Money);
            } else if (respNum < members.length / 3) {
                respNum++;
                return processJob(info, ActivityFocus.Respect);
            } else {
                warfareNum++;
                return processJob(info, ActivityFocus.Warfare);
            }
        } else if (gangInfo.Activity === ActivityFocus.Warfare) {
            return "Territory Warfare";
        }
        return gangInfo.Activity === ActivityFocus.Money
            ? "Human Trafficking"
            : "Terrorism";
    };

    const upgradeJob = (member: GangMemberInfo) => {
        const job = getJob(member);
        if (job !== member.task) {
            ns.gang.setMemberTask(member.name, job);
        }
    };

    const ProcessMember = (member: GangMemberInfo) => {
        upgradeJob(member);
        if (gangInfo.BuyGear) {
            buyUpgrades(member);
        }
        const gangInformation = ns.gang.getGangInformation();

        if (
            gangInformation.respect > baseRep ||
            gangInformation.respect === 1
        ) {
            if (ns.gang.getAscensionResult(member.name)?.str > 1.5) {
                baseRep = gangInformation.respect;
                ns.gang.ascendMember(member.name);
            }
        }
    };

    /** Alias for document to prevent excessive RAM use */
    ns.disableLog("ALL");

    const updateGangLog = () => {
        const gangInfo: GangInfo = JSON.parse(ns.peek(GANGPORT));
        gangInfo.MemberCount = members.length;
        gangInfo.Duration = duration;
        gangInfo.BaseRep = baseRep;
        const gang = ns.gang.getGangInformation();
        gangInfo.MoneyGain = gang.moneyGainRate * 5;
        gangInfo.Respect = gang.respect;
        gangInfo.Power = gang.power;
        gangInfo.Territory = gang.territory;
        ns.clearPort(GANGPORT);
        ns.writePort(GANGPORT, JSON.stringify(gangInfo));
    };

    let duration = 1;

    while (gangInfo.Enabled) {
        gangInfo = JSON.parse(dataport.peek());
        if (ns.gang && ns.gang.inGang()) {
            manageRecruitment();
            respNum = 0;
            moenyNum = 0;
            warfareNum = 0;
            members = ns.gang.getMemberNames();
            members.forEach((member) => {
                ProcessMember(ns.gang.getMemberInformation(member));
            });
            ns.clearLog();
            updateGangLog();
            duration = (await ns.gang.nextUpdate()) / 1000;
        } else {
            await ns.sleep(1000);
        }
    }
}
