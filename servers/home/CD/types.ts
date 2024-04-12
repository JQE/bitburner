import { ActivityFocus } from "./Tools/Gangs/Gangs";
import { LifeStages } from "./Tools/LifeManager/types";

export enum ServerStage {
    Buying = 1,
    Upgrading,
    Capacity,
    Unknown,
}

export interface ServerInfo {
    Stage: ServerStage;
    Message: string;
    MaxSize: number;
    CurrentSize: number;
    Cost: number;
    Enabled: boolean;
    AtRam: number;
    Max: number;
}

export enum HackType {
    Basic = 1,
    Share,
    Batch,
    Unknown,
}
export enum HackStage {
    Prepping = 1,
    Optimizing,
    Batching,
    Unknown,
}

export interface HackInfo {
    Type: HackType;
    Stage: HackStage;
    Reset: number;
    TotalPrep: number;
    Prep: number;
    Chance: number;
    Greed: number;
    GreedStep: number;
    Best: number;
    Count: number;
    Target: string;
    Tools: number;
    Enabled: boolean;
    Error: string;
}

export interface GangInfo {
    Enabled: boolean;
    BuyGear: boolean;
    BuyAugs: boolean;
    Activity: ActivityFocus;
    Duration: number;
    MemberCount: number;
    BaseRep: number;
}

export interface LifeInfo {
    Enabled: boolean;
    Stage: LifeStages;
    Action: string;
    Faction: string;
    JoinGang: boolean;
    ManageWork: boolean;
    BuyAugs: boolean;
}
