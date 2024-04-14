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
        Level: number;
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
            "NeuroFlux Governor",
        ],
        Count: 7,
        Level: 7,
        City: "Ishima",
        Backdoor: false,
    },
    "Sector-12": {
        rep: 50000,
        augs: [
            "Neuralstimulator",
            "CashRoot Starter Kit",
            "NeuroFlux Governor",
        ],
        Count: 8,
        Level: 15,
        City: "Sector-12",
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
            "NeuroFlux Governor",
        ],
        Count: 5,
        Level: 20,
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
            "NeuroFlux Governor",
        ],
        Count: 3,
        Level: 23,
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
            "NeuroFlux Governor",
        ],
        Count: 5,
        Level: 28,
        City: "Sector-12",
        Backdoor: true,
        Server: "I.I.I.I",
    },
};
