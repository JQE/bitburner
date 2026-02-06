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
    Contracts = 2,
    Operations = 3,
    BlackOps = 4,
}
export interface SkillInfo {
    [name: string]: {
        Max: number;
        Stage: BladeBurnerStage;
    };
}

export const MySkillList: SkillInfo = {
    "Blade's Intuition": {
        Max: 999,
        Stage: BladeBurnerStage.Contracts,
    },
    Cloak: {
        Max: 25,
        Stage: BladeBurnerStage.Contracts,
    },
    "Short-Circuit": {
        Max: 25,
        Stage: BladeBurnerStage.Contracts,
    },
    Tracer: {
        Max: 10,
        Stage: BladeBurnerStage.Contracts,
    },
    Overclock: {
        Max: 90,
        Stage: BladeBurnerStage.Operations,
    },
    Reaper: {
        Max: 999,
        Stage: BladeBurnerStage.Contracts,
    },
    "Evasive System": {
        Max: 999,
        Stage: BladeBurnerStage.Contracts,
    },
    Hyperdrive: {
        Max: 20,
        Stage: BladeBurnerStage.Contracts,
    },
    "Digital Observer": {
        Max: 999,
        Stage: BladeBurnerStage.Operations,
    },
};

export type BBSkills =
    | "Blade's Intuition"
    | "Cloak"
    | "Short-Circuit"
    | "Digital Observer"
    | "Tracer"
    | "Overclock"
    | "Reaper"
    | "Evasive System"
    | "Datamancer"
    | "Cyber's Edge"
    | "Hands of Midas"
    | "Hyperdrive";

export type BBGeneralActions = {
    Training: "Training";
    FieldAnalysis: "Field Analysis";
    Recruitment: "Recruitment";
    Diplomacy: "Diplomacy";
    HyperbolicRegen: "Hyperbolic Regeneration Chamber";
    InciteViolence: "Incite Violence";
};

export type BBContracts = "Tracking" | "Bounty Hunter" | "Retirement";

export type BBOperations =
    | "Investigation"
    | "Undercover Operation"
    | "Sting Operation"
    | "Raid"
    | "Stealth Retirement Operation"
    | "Assassination";

export type BBBlackOperations =
    | "Operation Typhoon"
    | "Operation Zero"
    | "Operation X"
    | "Operation Titan"
    | "Operation Ares"
    | "Operation Archangel"
    | "Operation Juggernaut"
    | "Operation Red Dragon"
    | "Operation K"
    | "Operation Deckard"
    | "Operation Tyrell"
    | "Operation Wallace"
    | "Operation Shoulder of Orion"
    | "Operation Hyron"
    | "Operation Morpheus"
    | "Operation Ion Storm"
    | "Operation Annihilus"
    | "Operation Ultron"
    | "Operation Centurion"
    | "Operation Vindictus"
    | "Operation Daedalus";
