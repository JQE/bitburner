import { GangMemberInfo } from "NetscriptDefinitions";
import React from "react";
import { TailModal } from "servers/home/Utils/TailModal";
import Style from "../../../tailwind.css";
import { GangControl } from "./Components/GangControl";

export enum ActivityFocus {
    Money = 1,
    Respect,
    Warfare,
    Balance,
}

export async function main(ns: NS) {
    let members: string[] = ns.gang.getMemberNames();
    const dataport = ns.getPortHandle(ns.pid);
    dataport.clear();
    const equipment: string[] = [];
    const augs: string[] = [];
    const baseName = "Fredalina";
    let baseJob = "Mug People";
    let activity: ActivityFocus = ActivityFocus.Money;
    let baseRep = 0;
    let respNum = 0;
    let moenyNum = 0;
    let warfareNum = 0;

    let buyAugs = false;
    let buyEquipment = false;

    const onBuy = (): boolean => {
        buyEquipment = !buyEquipment;
        return buyEquipment;
    };

    const onBuyAugs = (): boolean => {
        buyAugs = !buyAugs;
        return buyAugs;
    };

    const onActivity = (selection: number): ActivityFocus => {
        activity = selection;
        return activity;
    };

    const onJob = (job: string): string => {
        baseJob = job;
        return baseJob;
    };

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
                        ns.print(`Purchases ${item} for ${member.name}`);
                        return;
                    }
                }
            });
        } else {
            if (buyAugs) {
                augs.forEach((item) => {
                    if (!member.upgrades.includes(item)) {
                        const cost = ns.gang.getEquipmentCost(item);
                        const cash = ns.getServerMoneyAvailable("home");
                        if (cost < cash) {
                            if (ns.gang.purchaseEquipment(member.name, item)) {
                                ns.print(
                                    `Purchases ${item} for ${member.name}`
                                );
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
            ns.print(`Recrtuiting new member ${name}`);
        }
    };

    const processJob = (info: GangMemberInfo, jobFocus: ActivityFocus) => {
        if (ns.fileExists("Formulas.exe")) {
            const gang = ns.gang.getGangInformation();

            if (jobFocus === ActivityFocus.Respect) {
                const taskStats = ns.gang.getTaskStats("Terrorism");
                const gains = {
                    Wanted: ns.formulas.gang.wantedLevelGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Respect: ns.formulas.gang.respectGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Money: ns.formulas.gang.moneyGain(gang, info, taskStats),
                };
                if (
                    gains.Wanted < gains.Respect ||
                    gains.Wanted < gains.Money
                ) {
                    return "Terrorism";
                }
            } else if (jobFocus === ActivityFocus.Money) {
                const taskStats = ns.gang.getTaskStats("Human Trafficking");
                const gains = {
                    Wanted: ns.formulas.gang.wantedLevelGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Respect: ns.formulas.gang.respectGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Money: ns.formulas.gang.moneyGain(gang, info, taskStats),
                };
                if (
                    gains.Wanted < gains.Respect ||
                    gains.Wanted < gains.Money
                ) {
                    return "Human Trafficking";
                }
            } else {
                const taskStats = ns.gang.getTaskStats("Territory Warfare");
                const gains = {
                    Wanted: ns.formulas.gang.wantedLevelGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Respect: ns.formulas.gang.respectGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Money: ns.formulas.gang.moneyGain(gang, info, taskStats),
                };
                if (
                    gains.Wanted < gains.Respect ||
                    gains.Wanted < gains.Money
                ) {
                    return "Territory Warfare";
                }
            }
            return baseJob;
        } else {
            if (info.str > 700) {
                if (jobFocus === ActivityFocus.Warfare) {
                    return "Territory Warfare";
                }
                return jobFocus === ActivityFocus.Respect
                    ? "Terrorism"
                    : "Human Trafficking";
            }
            return baseJob;
        }
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
        if (activity === ActivityFocus.Balance) {
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
        } else if (activity === ActivityFocus.Warfare) {
            return "Territory Warfare";
        }
        return activity === ActivityFocus.Money
            ? "Human Trafficking"
            : "Terrorism";
    };

    const upgradeJob = (member: GangMemberInfo) => {
        const job = getJob(member);
        if (job !== member.task) {
            ns.gang.setMemberTask(member.name, job);
            ns.print(`Member ${member.name} is now doing task ${job}`);
        }
    };

    const ProcessMember = (member: GangMemberInfo) => {
        upgradeJob(member);
        if (buyEquipment) {
            buyUpgrades(member);
        }
        const gangInfo = ns.gang.getGangInformation();

        if (gangInfo.respect > baseRep) {
            if (ns.gang.getAscensionResult(member.name)?.str > 1.5) {
                baseRep = gangInfo.respect;
                ns.gang.ascendMember(member.name);
            }
        }
    };

    /** Alias for document to prevent excessive RAM use */
    const doc = (0, eval)("document") as Document;
    ns.disableLog("ALL");
    ns.tail();

    const tm = new TailModal(ns, doc);

    tm.renderCustomModal(
        <>
            <Style></Style>
            <GangControl
                ns={ns}
                defaultActivity={activity}
                onActivity={onActivity}
                defaultBuy={buyEquipment}
                onBuy={onBuy}
                defaultBuyAugs={buyAugs}
                onBuyAugs={onBuyAugs}
                defaultJob={baseJob}
                onJob={onJob}
            ></GangControl>
        </>,
        "Gang Control Panel",
        300
    );

    ns.atExit(() => {
        ns.closeTail();
    });
    let duration = 1;

    while (dataport.empty()) {
        if (ns.gang.inGang()) {
            manageRecruitment();
            respNum = 0;
            moenyNum = 0;
            warfareNum = 0;
            members = ns.gang.getMemberNames();
            members.forEach((member) => {
                ProcessMember(ns.gang.getMemberInformation(member));
            });
            const gang = ns.gang.getGangInformation();
            ns.clearLog();
            ns.print(
                `Have members: ${members.length}    Money: ${ns.formatNumber(
                    gang.moneyGainRate * duration,
                    2
                )}/s`
            );
            ns.print(
                `Buying Gear: ${buyEquipment}   Buying Augments: ${buyAugs}`
            );
            ns.print(``);
            ns.print(
                `Respect: ${ns.formatNumber(
                    gang.respectGainRate * duration,
                    2
                )}/s    Wanted: ${ns.formatNumber(
                    gang.wantedLevelGainRate * duration,
                    2
                )}/s`
            );
            ns.print(
                `Gang Rep: ${ns.formatNumber(
                    gang.respect,
                    2
                )} : Ascension: ${ns.formatNumber(baseRep, 2)}`
            );
            ns.print(
                `Power: ${ns.formatNumber(
                    gang.power
                )}   Territory: ${ns.formatPercent(gang.territory)}`
            );
            duration = (await ns.gang.nextUpdate()) / 1000;
        } else {
            await ns.sleep(1000);
        }
    }
}
