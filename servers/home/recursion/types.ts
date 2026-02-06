export interface GangInfo {
    Members: number;
    Action: string;
    MoneyGain: number;
}

export interface HacknetInfo {
    HashCount: number;
}

export interface SleeveInfo {
    InShock: number;
    Count: number;
}

export interface BBInfo {
    Action: string;
    City: string;
}

export const HackStage = {
    Starting: 0,
    Prepping: 1,
    Optimizing: 3,
    startingBatch: 4,
    Batching: 5,
    Unknown: 6,
} as const;

export interface HackInfo {
    Stage: number;
    TotalPrep: number;
    Prep: number;
    Count: number;
    Target: string;
    Tools: number;
}

export interface ServerInfo {
    AtRam: number;
    Max: number;
    Current: number;
    MaxRam: number;
}
