import { BBPORT } from "../constants";
import { BBInfo } from "../types";
import {
    BBContracts,
    BBOperations,
    BBSkills,
    BladeBurnerStage,
    MySkillList,
} from "./types";

export async function main(ns: NS) {
    let contracts = ns.bladeburner.getContractNames();
    let ops = ns.bladeburner.getOperationNames();
    let currentCity = ns.bladeburner.getCity();
    let duration = 1;
    let currentStage: BladeBurnerStage = BladeBurnerStage.Stats;
    let currentAction = "none";

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
            if (work === null || work.type !== "CLASS") {
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
            currentAction = "Prepping";
        }
    };

    const findContract = () => {
        for (let i = contracts.length - 1; i >= 0; i--) {
            const contract = contracts[i];
            const contractCount = ns.bladeburner.getActionCountRemaining(
                "Contracts",
                contract,
            );
            if (contractCount >= 1) {
                const chance = ns.bladeburner.getActionEstimatedSuccessChance(
                    "Contracts",
                    contract,
                );
                if (chance[0] > 0.5) {
                    return contract;
                }
            }
        }
        return undefined;
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
            }
        } else {
            const timeIn = ns.bladeburner.getActionCurrentTime();
            const timeMin = ns.bladeburner.getActionTime(
                "Contracts",
                currentAction as BBContracts,
            );
            const count = ns.bladeburner.getActionCountRemaining(
                "Contracts",
                currentAction as BBContracts,
            );
            if (timeIn > timeMin || count < 1) {
                const contract = findContract();
                if (contract !== currentAction) {
                    if (contract !== undefined) {
                        ns.bladeburner.startAction("Contracts", contract);
                        currentAction = contract;
                    }
                }
            }
        }
    };
    const findOperation = () => {
        for (let i = ops.length - 1; i >= 0; i--) {
            const op = ops[i];
            if (op !== "Raid") {
                const contractCount = ns.bladeburner.getActionCountRemaining(
                    "Operations",
                    op,
                );
                if (contractCount >= 1) {
                    const chance =
                        ns.bladeburner.getActionEstimatedSuccessChance(
                            "Operations",
                            op,
                        );
                    if (chance[0] > 0.5) {
                        return op;
                    }
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
                currentStage = BladeBurnerStage.Contracts;
                currentAction = "Prepping";
                ProcessContracts();
            }
        } else {
            const timeIn = ns.bladeburner.getActionCurrentTime();
            const timeMin = ns.bladeburner.getActionTime(
                "Operations",
                currentAction as BBOperations,
            );
            const count = ns.bladeburner.getActionCountRemaining(
                "Operations",
                currentAction as BBOperations,
            );
            if (timeIn > timeMin || count < 1) {
                const op = findOperation();
                if (op !== currentAction) {
                    if (op !== undefined) {
                        ns.bladeburner.startAction("Operations", op);
                        currentAction = op;
                    } else {
                        currentStage = BladeBurnerStage.Contracts;
                        currentAction = "Prepping";
                        ProcessContracts();
                    }
                }
            }
        }
    };

    const findBlackOp = () => {
        const nextOp = ns.bladeburner.getNextBlackOp();
        const rank = ns.bladeburner.getRank();
        if (nextOp !== null) {
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(
                "Black Operations",
                nextOp.name,
            );
            if (nextOp.rank <= rank && chance[0] > 0.75) {
                return nextOp.name;
            }
        } /*else {
            return null;
        }*/
        return undefined;
    };

    const ProcessBlackOps = () => {
        if (currentAction === "Prepping") {
            const op = findBlackOp();
            /*if (op === null) {
                ns.singularity.destroyW0r1dD43m0n(10);
            }*/
            if (op !== undefined) {
                ns.bladeburner.startAction("Black Operations", op);
                currentAction = op;
            } else {
                currentStage = BladeBurnerStage.Operations;
                currentAction = "Prepping";
                ProcessOperations();
            }
        } else {
            const action = ns.bladeburner.getCurrentAction();
            if (action === null) {
                const op = findBlackOp();
                if (op !== undefined) {
                    ns.bladeburner.startAction("Black Operations", op);
                    currentAction = op;
                } else {
                    currentStage = BladeBurnerStage.Operations;
                    currentAction = "Prepping";
                    ProcessOperations();
                }
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
                "Hyperbolic Regeneration Chamber",
            );
            currentAction = "Healing";
        }
    };

    const ProcessRest = (chaos: number, dif: number, synthCount: number) => {
        const action = ns.bladeburner.getCurrentAction();
        if (synthCount < 1000000000 || dif > 0.1) {
            if (
                action === null ||
                (action.type !== "General" && action.name !== "Field Analysis")
            ) {
                ns.bladeburner.startAction("General", "Field Analysis");
                currentAction = "Resting";
            }
        } else if (chaos < 20) {
            if (
                action === null ||
                (action.type !== "General" && action.name !== "Diplomacy")
            ) {
                ns.bladeburner.startAction("General", "Diplomacy");
                currentAction = "Resting";
            }
        } else {
            if (
                action === null ||
                (action.type !== "General" && action.name !== "Diplomacy")
            ) {
                ns.bladeburner.startAction("General", "Diplomacy");
                currentAction = "Resting";
            }
        }
    };
    const ProcessGeneral = (citySwitchFail: boolean) => {
        const health = ns.getPlayer().hp;
        const stam = ns.bladeburner.getStamina();
        const chaos = ns.bladeburner.getCityChaos(currentCity);
        const chance = ns.bladeburner.getActionEstimatedSuccessChance(
            "Operations",
            "Assassination",
        );
        const dif = chance[1] - chance[0];
        let synthCount = 10000000000;
        if (citySwitchFail) {
            synthCount = ns.bladeburner.getCityEstimatedPopulation(currentCity);
        }
        if (
            getTrainStat() === undefined &&
            currentStage === BladeBurnerStage.Stats
        ) {
            currentStage = BladeBurnerStage.Contracts;
            currentAction = "Prepping";
        }
        if (health.current < health.max / 2 || currentAction === "Healing") {
            if (health.current >= health.max - 1) {
                currentAction = "Prepping";
            } else {
                ProcessHealth();
                return true;
            }
        } else if (
            stam[0] < stam[1] / 2 ||
            chaos > 50 ||
            dif > 0.1 ||
            synthCount < 1000000000 ||
            currentAction === "Resting"
        ) {
            if (
                stam[0] === stam[1] &&
                chaos < 20 &&
                dif < 0.1 &&
                synthCount >= 1000000000
            ) {
                currentAction = "Prepping";
            } else {
                ProcessRest(chaos, dif, synthCount);
                return true;
            }
        }
        return false;
    };

    const ProcessAction = () => {
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
            case BladeBurnerStage.Stats:
                processStats();
                break;
            case BladeBurnerStage.None:
            default:
                ns.print("Incorrect Blade Burner Stage found");
                break;
        }
    };

    const ProcessSkills = () => {
        const points = ns.bladeburner.getSkillPoints();
        let upgradeSkill = "none";
        let skillLevel = 999;
        Object.keys(MySkillList).forEach((loopSkill) => {
            if (MySkillList[loopSkill].Stage <= currentStage) {
                const level = ns.bladeburner.getSkillLevel(
                    loopSkill as BBSkills,
                );
                if (level < skillLevel && level < MySkillList[loopSkill].Max) {
                    upgradeSkill = loopSkill;
                    skillLevel = level;
                }
            }
        });
        if (upgradeSkill !== "none") {
            const cost = ns.bladeburner.getSkillUpgradeCost(
                upgradeSkill as BBSkills,
            );
            if (cost < points) {
                ns.bladeburner.upgradeSkill(upgradeSkill as BBSkills);
            }
        }
    };

    const GetNextCity = (city: string) => {
        switch (city) {
            case ns.enums.CityName.Aevum:
                return ns.enums.CityName.Sector12;
            case ns.enums.CityName.Sector12:
                return ns.enums.CityName.Chongqing;
            case ns.enums.CityName.Chongqing:
                return ns.enums.CityName.Ishima;
            case ns.enums.CityName.Ishima:
                return ns.enums.CityName.NewTokyo;
            case ns.enums.CityName.NewTokyo:
                return ns.enums.CityName.Volhaven;
            case ns.enums.CityName.Volhaven:
                return ns.enums.CityName.Aevum;
        }
    };

    const ProcessCity = (): boolean => {
        const synthCount =
            ns.bladeburner.getCityEstimatedPopulation(currentCity);
        let switchFail = false;
        let fallBack = currentCity;
        let maxPop = synthCount;
        if (synthCount < 900000000) {
            let cityIndex = currentCity;
            let looping = true;
            while (looping) {
                cityIndex = GetNextCity(cityIndex);
                if (cityIndex === currentCity) {
                    switchFail = true;
                    looping = false;
                } else {
                    const newCount =
                        ns.bladeburner.getCityEstimatedPopulation(cityIndex);
                    if (newCount > maxPop) {
                        maxPop = newCount;
                        fallBack = cityIndex;
                    }
                    if (newCount > 900000000) {
                        ns.bladeburner.switchCity(cityIndex);
                        currentCity = cityIndex;
                        looping = false;
                    }
                }
            }
        }
        if (switchFail) {
            if (fallBack !== currentCity) {
                ns.bladeburner.switchCity(fallBack);
                currentCity = fallBack;
                switchFail = false;
            }
        }
        return switchFail;
    };
    ns.disableLog("ALL");
    ns.clearPort(BBPORT);

    while (true) {
        if (ns.bladeburner.inBladeburner()) {
            ProcessSkills();
            const citySwitch = ProcessCity();
            const doingGeneral = ProcessGeneral(citySwitch);
            if (!doingGeneral) {
                ProcessAction();
            }
            ns.clearLog();
            const BBInfo: BBInfo = {
                Action: currentAction,
                City: currentCity,
            };
            ns.clearPort(BBPORT);
            ns.writePort(BBPORT, BBInfo);
            duration = (await ns.bladeburner.nextUpdate()) / 1000;
        } else {
            processStats();
            const BBInfo: BBInfo = {
                Action: "Stats",
                City: currentCity,
            };
            ns.clearPort(BBPORT);
            await ns.writePort(BBPORT, BBInfo);
            await ns.asleep(1000);
        }
    }
}
