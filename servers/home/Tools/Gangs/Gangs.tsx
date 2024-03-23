import { GangMemberInfo } from "NetscriptDefinitions";

export enum ActivityFocus {
    Money = 1,
    Respect = 2,
    Warfare = 3,
    Balance = 4,
}

export async function main(ns: NS) {
    let members: string[] = ns.gang.getMemberNames();
    const dataport = ns.getPortHandle(this.pid);
    dataport.clear();
    const equipment: string[] = [];
    const augs: string[] = [];
    const baseName = "Fredalina";
    const baseJob = "Mug People";
    let activity: ActivityFocus = ActivityFocus.Money;
    let baseRep = 0;
    let respNum = 0;
    let moenyNum = 0;
    let warfareNum = 0;

    let buyAugs = false;
    let buyEquipment = false;

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
            const name = `${baseName}${members.length}`;
            ns.gang.recruitMember(name);
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
            ns.print(`Have members: ${members.length}`);
            ns.print(`Buying Gear: ${buyEquipment}`);
            ns.print(`Buying Augments: ${buyAugs}`);
            ns.print(
                `Gang Rep: ${ns.formatNumber(
                    gang.respect,
                    2
                )} : Required rep for next ascension: ${ns.formatNumber(
                    baseRep,
                    2
                )}`
            );
            ns.print(
                `Power: ${ns.formatNumber(
                    gang.power
                )}   Territory: ${ns.formatPercent(gang.territory)}`
            );
        }
    }
}
