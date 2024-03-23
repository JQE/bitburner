import { GangMemberInfo } from "NetscriptDefinitions";
import { store } from "../state/store";
import { ActivityFocus } from "../state/GangManager/GangManagerSlice";

export class GangManager {
    private ns: NS;
    private members: string[] = [];
    private equipment: string[] = [];
    private augs: string[] = [];
    private baseName = "Fredalina";
    private baseRep = 0;
    private respNum = 0;
    private moenyNum = 0;
    private warfareNum = 0;

    constructor(ns: NS) {
        this.ns = ns;
        const eqp = ns.gang.getEquipmentNames();
        eqp.forEach((item) => {
            const info = ns.gang.getEquipmentType(item);
            if (info !== "Augmentation") {
                this.equipment.push(item);
            } else {
                this.augs.push(item);
            }
        });
        this.members = ns.gang.getMemberNames();
    }

    buyUpgrades = (member: GangMemberInfo) => {
        if (member.upgrades.length < this.equipment.length) {
            this.equipment.forEach((item) => {
                if (!member.upgrades.includes(item)) {
                    const cost = this.ns.gang.getEquipmentCost(item);
                    const cash = this.ns.getServerMoneyAvailable("home");
                    if (cost < cash) {
                        this.ns.gang.purchaseEquipment(member.name, item);
                        this.ns.print(`Purchases ${item} for ${member.name}`);
                        return;
                    }
                }
            });
        } else {
            if (store.getState().gangmanager.BuyAugs) {
                this.augs.forEach((item) => {
                    if (!member.upgrades.includes(item)) {
                        const cost = this.ns.gang.getEquipmentCost(item);
                        const cash = this.ns.getServerMoneyAvailable("home");
                        if (cost < cash) {
                            if (
                                this.ns.gang.purchaseEquipment(
                                    member.name,
                                    item
                                )
                            ) {
                                this.ns.print(
                                    `Purchases ${item} for ${member.name}`
                                );
                            }
                        }
                    }
                });
            }
        }
    };

    manageRecruitment = () => {
        if (this.ns.gang.canRecruitMember()) {
            const name = `${this.baseName}${this.members.length}`;
            this.ns.gang.recruitMember(name);
            this.members.push(name);
            this.ns.print(`Recrtuiting new member ${name}`);
        }
    };

    processJob = (info: GangMemberInfo, jobFocus: ActivityFocus) => {
        if (this.ns.fileExists("Formulas.exe")) {
            const gang = this.ns.gang.getGangInformation();

            if (jobFocus === ActivityFocus.Respect) {
                const taskStats = this.ns.gang.getTaskStats("Terrorism");
                const gains = {
                    Wanted: this.ns.formulas.gang.wantedLevelGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Respect: this.ns.formulas.gang.respectGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Money: this.ns.formulas.gang.moneyGain(
                        gang,
                        info,
                        taskStats
                    ),
                };
                if (
                    gains.Wanted < gains.Respect ||
                    gains.Wanted < gains.Money
                ) {
                    return "Terrorism";
                }
            } else if (jobFocus === ActivityFocus.Money) {
                const taskStats =
                    this.ns.gang.getTaskStats("Human Trafficking");
                const gains = {
                    Wanted: this.ns.formulas.gang.wantedLevelGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Respect: this.ns.formulas.gang.respectGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Money: this.ns.formulas.gang.moneyGain(
                        gang,
                        info,
                        taskStats
                    ),
                };
                if (
                    gains.Wanted < gains.Respect ||
                    gains.Wanted < gains.Money
                ) {
                    return "Human Trafficking";
                }
            } else {
                const taskStats =
                    this.ns.gang.getTaskStats("Territory Warfare");
                const gains = {
                    Wanted: this.ns.formulas.gang.wantedLevelGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Respect: this.ns.formulas.gang.respectGain(
                        gang,
                        info,
                        taskStats
                    ),
                    Money: this.ns.formulas.gang.moneyGain(
                        gang,
                        info,
                        taskStats
                    ),
                };
                if (
                    gains.Wanted < gains.Respect ||
                    gains.Wanted < gains.Money
                ) {
                    return "Territory Warfare";
                }
            }
            return store.getState().gangmanager.BaseJob;
        } else {
            if (info.str > 700) {
                if (jobFocus === ActivityFocus.Warfare) {
                    return "Territory Warfare";
                }
                return jobFocus === ActivityFocus.Respect
                    ? "Terrorism"
                    : "Human Trafficking";
            }
            return store.getState().gangmanager.BaseJob;
        }
    };

    getJob = (info: GangMemberInfo) => {
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
        if (store.getState().gangmanager.Activity === ActivityFocus.Balance) {
            if (this.moenyNum < this.members.length / 3) {
                this.moenyNum++;
                return this.processJob(info, ActivityFocus.Money);
            } else if (this.respNum < this.members.length / 3) {
                this.respNum++;
                return this.processJob(info, ActivityFocus.Respect);
            } else {
                this.warfareNum++;
                return this.processJob(info, ActivityFocus.Warfare);
            }
        } else if (
            store.getState().gangmanager.Activity === ActivityFocus.Warfare
        ) {
            return "Territory Warfare";
        }
        return store.getState().gangmanager.Activity === ActivityFocus.Money
            ? "Human Trafficking"
            : "Terrorism";
    };

    upgradeJob = (member: GangMemberInfo) => {
        const job = this.getJob(member);
        if (job !== member.task) {
            this.ns.gang.setMemberTask(member.name, job);
            this.ns.print(`Member ${member.name} is now doing task ${job}`);
        }
    };

    ProcessMember = (member: GangMemberInfo) => {
        this.upgradeJob(member);
        if (store.getState().gangmanager.Buy) {
            this.buyUpgrades(member);
        }
        const gangInfo = this.ns.gang.getGangInformation();

        if (gangInfo.respect > this.baseRep) {
            if (this.ns.gang.getAscensionResult(member.name)?.str > 1.5) {
                this.baseRep = gangInfo.respect;
                this.ns.gang.ascendMember(member.name);
            }
        }
    };

    processGangs = async () => {
        if (this.ns.gang.inGang()) {
            this.manageRecruitment();
            this.respNum = 0;
            this.moenyNum = 0;
            this.warfareNum = 0;
            this.members = this.ns.gang.getMemberNames();
            this.members.forEach((member) => {
                this.ProcessMember(this.ns.gang.getMemberInformation(member));
            });
            const gang = this.ns.gang.getGangInformation();
            this.ns.print(`Have members: ${this.members.length}`);
            this.ns.print(`Buying Gear: ${store.getState().gangmanager.Buy}`);
            this.ns.print(
                `Buying Augments: ${store.getState().gangmanager.BuyAugs}`
            );
            this.ns.print(
                `Gang Rep: ${this.ns.formatNumber(
                    gang.respect,
                    2
                )} : Required rep for next ascension: ${this.ns.formatNumber(
                    this.baseRep,
                    2
                )}`
            );
            this.ns.print(
                `Power: ${this.ns.formatNumber(
                    gang.power
                )}   Territory: ${this.ns.formatPercent(gang.territory)}`
            );
        }
    };
}
