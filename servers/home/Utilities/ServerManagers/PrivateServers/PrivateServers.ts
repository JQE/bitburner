import {
    setCurrentRam,
    setMaxRam,
    setMaxServers,
    setCount,
    setAtRam,
    setBuying,
} from "servers/home/state/ServerManager/ServerManagerSlice";
import { store } from "servers/home/state/store";
import { ServerUtils } from "../ServerUtils";

export class PrivateServers {
    private ns: NS;
    private servers: string[];
    private currentRamSize: number = 0;
    private Count: number = 0;
    private Max: number = 0;
    private AtRam: number = 0;

    constructor(ns: NS) {
        this.ns = ns;
        this.Max = this.ns.getPurchasedServerLimit();
        store.dispatch(setMaxServers(this.Max));
        store.dispatch(setCurrentRam(8));
        store.dispatch(setCount(0));
        store.dispatch(setMaxRam(8));
        store.dispatch(setAtRam(0));
        this.GetPrivateServers();
    }

    GetCount = () => {
        return this.Count;
    };
    GetMax = () => {
        return this.Max;
    };
    GetCurrentRamStep = () => {
        return this.currentRamSize;
    };

    GetPrivateServers = () => {
        this.servers = this.ns.getPurchasedServers();
        this.Count = this.servers.length;
        this.servers.forEach((server) => {
            const maxRam = this.ns.getServerMaxRam(server);
            if (maxRam < this.currentRamSize) {
                this.currentRamSize = maxRam;
            }
        });
        const ramSize = store.getState().servermanager.MaxRam;
        if (this.AtRam === this.Max && this.currentRamSize < ramSize) {
            this.AtRam = 0;
            this.currentRamSize = this.currentRamSize * 2;
        }
        this.ns.printf("Current Ram Size %d", this.currentRamSize);
        store.dispatch(setCurrentRam(this.currentRamSize));
        store.dispatch(setAtRam(this.AtRam));
        store.dispatch(setCount(this.Count));
    };

    PurchaseServers = () => {
        if (
            this.ns.getServerMoneyAvailable("home") >
            this.ns.getPurchasedServerCost(this.currentRamSize)
        ) {
            const hostname = this.ns.purchaseServer(
                "pserv-" + this.Count,
                this.currentRamSize
            );
            this.Count++;
            this.AtRam++;
            store.dispatch(setCount(this.Count));
            store.dispatch(setAtRam(this.AtRam));
            this.servers.push(hostname);
        }
    };

    UpgradeServers = (): string[] => {
        const [ramSize, maxRamSize] = this.UpdateCurrentRamStep();
        const serverCount = store.getState().servermanager.Count;
        const upgradedServers: string[] = [];
        if (ramSize <= maxRamSize && serverCount < this.Max) {
            this.servers.forEach((server) => {
                const maxRam = this.ns.getServerMaxRam(server);
                if (maxRam < ramSize) {
                    const upgradeCost = this.ns.getPurchasedServerUpgradeCost(
                        server,
                        ramSize
                    );
                    if (this.ns.getServerMoneyAvailable("home") > upgradeCost) {
                        this.ns.upgradePurchasedServer(server, ramSize);
                        this.AtRam++;
                        store.dispatch(setAtRam(this.AtRam));
                        upgradedServers.push(server);
                    }
                }
            });
        }
        return upgradedServers;
    };

    UpdateCurrentRamStep = () => {
        let maxRamSize = store.getState().servermanager.MaxRam;
        let currentRamSize = maxRamSize;
        this.servers.forEach((server) => {
            const maxRam = this.ns.getServerMaxRam(server);
            if (maxRam < currentRamSize) {
                currentRamSize = maxRam;
            }
        });
        let atRamSize = 0;
        this.servers.forEach((server) => {
            const maxRam = this.ns.getServerMaxRam(server);
            if (maxRam >= currentRamSize) {
                atRamSize++;
            }
        });
        if (atRamSize === this.Max && currentRamSize < maxRamSize) {
            currentRamSize *= 2;
            atRamSize = 0;
            this.servers.forEach((server) => {
                const maxRam = this.ns.getServerMaxRam(server);
                if (maxRam == currentRamSize) {
                    atRamSize++;
                }
            });
        }
        if (this.currentRamSize != currentRamSize) {
            this.currentRamSize = currentRamSize;
            this.AtRam = atRamSize;
            store.dispatch(setCurrentRam(this.currentRamSize));
            store.dispatch(setAtRam(this.AtRam));
        }
        return [currentRamSize, maxRamSize];
    };
}
