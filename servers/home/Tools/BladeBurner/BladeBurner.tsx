import { BBPORT } from "../../Constants";
import { BladeBurnerInfo } from "../../types";
import {
    BBBlackOperations,
    BBContracts,
    BBOperations,
    BBSkills,
    MySkillList,
    SkillInfo,
} from "./types";

export const BladeBurnerStageNames: string[] = [
    "None",
    "Stats",
    "Contracts",
    "Operations",
    "Black Operations",
];

export enum BladeBurnerStage {
    None = 0,
    Stats = 1,
    Contracts,
    Operations,
    BlackOps,
}

export async function main(ns: NS) {
    let bladeInfo: BladeBurnerInfo = JSON.parse(ns.peek(BBPORT));
    const contracts = ns.bladeburner.getContractNames();
    const ops = ns.bladeburner.getOperationNames();
    let currentCity: "Sector-12" | "Aevum" = "Sector-12";
    let duration = 1;
    let currentStage: BladeBurnerStage = BladeBurnerStage.Stats;
    let currentAction = "none";
    let analyzeAction = "none";

    const getTrainStat = () => {
        const player = ns.getPlayer();
        if (player.skills.strength < 100) {
            return "str";
        }
        if (player.skills.agility < 100) {
            return "agi";
        }
        if (player.skills.dexterity < 100) {
            return "dex";
        }
        if (player.skills.defense < 100) {
            return "def";
        }
        return undefined;
    };

    const processStats = () => {
        const train = getTrainStat();
        if (train !== undefined) {
            const work = ns.singularity.getCurrentWork();
            if (work.type !== "CLASS") {
                ns.singularity.gymWorkout("Powerhouse Gym", train);
                currentAction = train;
            } else {
                if (currentAction !== train) {
                    ns.singularity.gymWorkout("Powerhouse Gym", train);
                    currentAction = train;
                }
            }
        } else {
            if (!ns.bladeburner.inBladeburner()) {
                ns.bladeburner.joinBladeburnerDivision();
            }
            currentStage = BladeBurnerStage.Contracts;
        }
    };

    const ProcessRest = () => {
        const action = ns.bladeburner.getCurrentAction();
        if (ShouldAnalyze()) {
            if (action.type !== "General" && action.name !== "Field Analysis") {
                ns.bladeburner.startAction("General", "Field Analysis");
                currentAction = "Resting";
            }
        } else {
            if (action.type !== "General" && action.name !== "Diplomacy") {
                ns.bladeburner.startAction("General", "Diplomacy");
                currentAction = "Resting";
            }
        }
    };

    const ProcessHealth = () => {
        const action = ns.bladeburner.getCurrentAction();
        if (
            action === null ||
            (action.type !== "General" &&
                action.name !== "Hyperbolic Regeneration Chamber")
        ) {
            ns.bladeburner.startAction(
                "General",
                "Hyperbolic Regeneration Chamber"
            );
            currentAction = "Healing";
        }
    };
    const findContract = () => {
        for (let i = contracts.length - 1; i >= 0; i--) {
            const contract = contracts[i];
            const contractCount = ns.bladeburner.getActionCountRemaining(
                "Contracts",
                contract
            );
            if (contractCount > 0) {
                const chance = ns.bladeburner.getActionEstimatedSuccessChance(
                    "Contracts",
                    contract
                );
                if (chance[0] > 0.5) {
                    return contract;
                }
            }
        }
        return undefined;
    };

    const GetOperations = () => {
        switch (currentStage) {
            case BladeBurnerStage.Operations:
                return "Operations";
            case BladeBurnerStage.BlackOps:
                return "Black Operations";
            case BladeBurnerStage.Contracts:
            case BladeBurnerStage.Stats:
            case BladeBurnerStage.None:
            default:
                return "Contracts";
        }
    };

    const ShouldAnalyze = () => {
        if (
            currentAction !== "Prepping" &&
            currentAction !== "Healing" &&
            currentAction !== "Resting"
        ) {
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(
                GetOperations(),
                currentAction as BBContracts | BBBlackOperations | BBOperations
            );
            const dif = chance[1] - chance[0];
            if (dif > 0.1) {
                analyzeAction = currentAction;
                return true;
            }
        } else if (currentAction === "Resting" && analyzeAction !== "none") {
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(
                GetOperations(),
                analyzeAction as BBContracts | BBBlackOperations | BBOperations
            );
            const dif = chance[1] - chance[0];
            if (dif > 0.1) {
                return true;
            }
        }
        analyzeAction = "none";
        return false;
    };

    const ProcessContracts = () => {
        if (findOperation() !== undefined) {
            currentStage = BladeBurnerStage.Operations;
            currentAction = "Prepping";
            return;
        }
        if (currentAction === "Prepping") {
            const contract = findContract();
            if (contract !== undefined) {
                ns.bladeburner.startAction("Contracts", contract);
                currentAction = contract;
            } else {
                ProcessRest();
            }
        } else {
            const timeIn = ns.bladeburner.getActionCurrentTime();
            const timeMin = ns.bladeburner.getActionTime(
                "Contracts",
                currentAction as BBContracts
            );
            const count = ns.bladeburner.getActionCountRemaining(
                "Contracts",
                currentAction as BBContracts
            );
            if (timeIn > timeMin || count < 1) {
                const contract = findContract();
                if (contract !== currentAction) {
                    if (contract !== undefined) {
                        ns.bladeburner.startAction("Contracts", contract);
                        currentAction = contract;
                    } else {
                        ProcessRest();
                    }
                }
            }
        }
    };
    const findOperation = () => {
        for (let i = ops.length - 1; i >= 0; i--) {
            const op = ops[i];
            const contractCount = ns.bladeburner.getActionCountRemaining(
                "Operations",
                op
            );
            if (contractCount > 0) {
                const chance = ns.bladeburner.getActionEstimatedSuccessChance(
                    "Operations",
                    op
                );
                if (chance[1] > 0.5) {
                    return op;
                }
            }
        }
        return undefined;
    };

    const ProcessOperations = () => {
        if (findBlackOp() !== undefined) {
            currentStage = BladeBurnerStage.BlackOps;
            currentAction = "Prepping";
            return;
        }
        if (currentAction === "Prepping") {
            const op = findOperation();
            if (op !== undefined) {
                ns.bladeburner.startAction("Operations", op);
                currentAction = op;
            } else {
                ProcessRest();
            }
        } else {
            const timeIn = ns.bladeburner.getActionCurrentTime();
            const timeMin = ns.bladeburner.getActionTime(
                "Operations",
                currentAction as BBOperations
            );
            const count = ns.bladeburner.getActionCountRemaining(
                "Operations",
                currentAction as BBOperations
            );
            if (timeIn > timeMin || count < 1) {
                const op = findOperation();
                if (op !== currentAction) {
                    if (op !== undefined) {
                        ns.bladeburner.startAction("Operations", op);
                        currentAction = op;
                    } else {
                        ProcessRest();
                    }
                }
            }
        }
    };

    const findBlackOp = () => {
        const nextOp = ns.bladeburner.getNextBlackOp();
        const rank = ns.bladeburner.getRank();
        if (nextOp.rank < rank) {
            return nextOp.name;
        }
        return undefined;
    };

    const ProcessBlackOps = () => {
        if (currentAction === "Prepping") {
            const op = findBlackOp();
            if (op !== undefined) {
                ns.bladeburner.startAction("Black Operations", op);
                currentAction = op;
            } else {
                ProcessRest();
            }
        } else {
            const timeIn = ns.bladeburner.getActionCurrentTime();
            const timeMin = ns.bladeburner.getActionTime(
                "Black Operations",
                currentAction as BBBlackOperations
            );
            if (timeIn > timeMin) {
                const op = findOperation();
                if (op !== currentAction) {
                    if (op !== undefined) {
                        ns.bladeburner.startAction("Black Operations", op);
                        currentAction = op;
                    } else {
                        currentStage = BladeBurnerStage.Operations;
                        ProcessRest();
                    }
                }
            }
        }
    };

    const ProcessAction = () => {
        const health = ns.getPlayer().hp;
        const stam = ns.bladeburner.getStamina();
        if (health.current < 10 || currentAction === "Healing") {
            if (health.current === health.max) {
                currentAction = "Prepping";
            } else {
                ProcessHealth();
            }
        } else if (stam[0] < stam[1] / 2 || currentAction === "Resting") {
            if (stam[0] === stam[1]) {
                currentAction = "Prepping";
            } else {
                ProcessRest();
            }
        } else if (ShouldAnalyze()) {
            ProcessRest();
        } else {
            switch (currentStage) {
                case BladeBurnerStage.Contracts:
                    ProcessContracts();
                    break;
                case BladeBurnerStage.Operations:
                    ProcessOperations();
                    break;
                case BladeBurnerStage.BlackOps:
                    ProcessBlackOps();
                    break;
                case BladeBurnerStage.None:
                case BladeBurnerStage.Stats:
                default:
                    ns.tprint("Incorrect Blade Burner Stage found");
                    break;
            }
        }
    };

    const ProcessSkills = () => {
        const points = ns.bladeburner.getSkillPoints();
        let upgradeSkill = "none";
        let skillLevel = 999;
        Object.keys(MySkillList).forEach((loopSkill) => {
            if (MySkillList[loopSkill].Stage > currentStage) {
                const level = ns.bladeburner.getSkillLevel(
                    loopSkill as BBSkills
                );
                if (level < skillLevel && level < MySkillList[loopSkill].Max) {
                    const maxLevel =
                        ns.formulas.bladeburner.skillMaxUpgradeCount(
                            loopSkill as BBSkills,
                            1,
                            points
                        );
                    upgradeSkill = loopSkill;
                    skillLevel = level;
                }
            }
        });
        if (upgradeSkill !== "none") {
            const cost = ns.bladeburner.getSkillUpgradeCost(
                upgradeSkill as BBSkills
            );
            if (cost < points) {
                ns.bladeburner.upgradeSkill(upgradeSkill as BBSkills);
            }
        }
    };
    const ProcessCity = () => {
        const synthCount =
            ns.bladeburner.getCityEstimatedPopulation(currentCity);
        if (synthCount < 1000000000) {
            if (currentCity === "Sector-12") {
                ns.bladeburner.switchCity("Aevum");
                currentCity = "Aevum";
            } else {
                ns.bladeburner.switchCity("Sector-12");
                currentCity = "Sector-12";
            }
        }
    };

    const updateBladeBurnerLog = () => {
        const bladePortData = ns.peek(BBPORT);
        if (bladePortData !== "NULL PORT DATA") {
            const bladeInfo: BladeBurnerInfo = JSON.parse(bladePortData);
            bladeInfo.Duration = duration;
            bladeInfo.City = currentCity;
            bladeInfo.ActionName = currentAction;
            bladeInfo.ActionType = currentStage;
            ns.clearPort(BBPORT);
            ns.writePort(BBPORT, JSON.stringify(bladeInfo));
        }
    };

    while (bladeInfo.Enabled) {
        const bladePortData = ns.peek(BBPORT);
        if (bladePortData !== "NULL PORT DATA") {
            bladeInfo = JSON.parse(bladePortData);
            updateBladeBurnerLog();
            if (ns.bladeburner.inBladeburner()) {
                if (currentStage === BladeBurnerStage.Stats) {
                    currentStage = BladeBurnerStage.Contracts;
                    currentAction = "Prepping";
                }
                ProcessSkills();
                ProcessCity();
                ProcessAction();
                duration = (await ns.bladeburner.nextUpdate()) / 1000;
            } else {
                processStats();
                await ns.asleep(1000);
            }
        }
    }
}
