export enum LifeStages {
    University = 1,
    Crime,
    Factions,
    Unknown,
    Unmanaged,
}

export interface FactionInfo {
    [name: string]: {
        rep: number;
        augs: string[];
        Count: number;
        City: string;
        Backdoor: boolean;
        Server?: string;
    };
}

export const MyFactionList: FactionInfo = {
    "Tian Di Hui": {
        rep: 75000,
        augs: [
            "Neuroreceptor Management Implant",
            "Social Negotiation Assistant (S.N.A)",
            "ADR-V1 Pheromone Gene",
        ],
        Count: 7,
        City: "Ishima",
        Backdoor: false,
    },
    "Sector-12": {
        rep: 50000,
        augs: ["Neuralstimulator", "CashRoot Starter Kit"],
        City: "Sector-12",
        Count: 15,
        Backdoor: false,
    },
    CyberSec: {
        rep: 18750,
        augs: [
            "Cranial Signal Processors - Gen I",
            "Cranial Signal Processors - Gen II",
            "BitWire",
            "Synaptic Enhancement Implant",
            "Neurotrainer I",
        ],
        Count: 20,
        City: "Sector-12",
        Backdoor: true,
        Server: "CSEC",
    },
    NiteSec: {
        rep: 112500,
        augs: [
            "DataJack",
            "Neurotrainer II",
            "Artificial Synaptic Potentiation",
            "CRTX42-AA Gene Modification",
            "Neural-Retention Enhancement",
            "Embedded Netburner Module",
            "Cranial Signal Processors - Gen III",
        ],
        Count: 23,
        City: "Sector-12",
        Backdoor: true,
        Server: "avmnite-02h",
    },
    "The Black Hand": {
        rep: 175000,
        augs: [
            "Embedded Netburner Module Core Implant",
            "Enhanced Myelin Sheathing",
            "Cranial Signal Processors - Gen IV",
            "The Black Hand",
        ],
        Count: 29,
        City: "Sector-12",
        Backdoor: true,
        Server: "I.I.I.I",
    },
    BitRunners: {
        rep: 1000000,
        augs: [
            "Embedded Netburner Module Core Implant",
            "Embedded Netburner Module Core V2 Upgrade",
            "BitRunners Neurolink",
            "Artificial Bio-neural Network Implant",
            "Cranial Signal Processors - Gen V",
            "Neural Accelerator",
        ],
        Count: 33,
        Backdoor: true,
        Server: "run4theh111z",
        City: "Sector-12",
    },
    Daedalus: {
        rep: 2500000,
        augs: [
            "Synfibril Muscle",
            "The Red Pill",
            "NEMEAN Subdermal Weave",
            "Synthetic Heart",
        ],
        Count: 39,
        Backdoor: false,
        Server: "",
        City: "Sector-12",
    },
    EndGame: {
        rep: 99999999,
        augs: [],
        Count: 999,
        Backdoor: false,
        Server: "",
        City: "Sector-12",
    },
};
