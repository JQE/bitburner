import {
    setCount,
    setMaxNodes,
    setPurchased,
} from "./state/HacknetManager/HacknetManagerSlice";
import { store } from "./state/store";

export class HacknetManager {
    private ns: NS;
    private buying: boolean;

    constructor(ns: NS) {
        this.ns = ns;
        this.buying = false;
        const maxNodes = this.ns.hacknet.maxNumNodes();
        store.dispatch(setMaxNodes(maxNodes));
        const purchased = this.ns.hacknet.numNodes();
        store.dispatch(setPurchased(purchased));
        store.dispatch(setCount(purchased));
    }

    onBuy = () => {
        this.buying = !this.buying;
    };
    isBuying = () => {
        return this.buying;
    };
    setNumServers = (count: number) => {
        if (count > store.getState().hacknetmanager.MaxNodes) {
            count = store.getState().hacknetmanager.MaxNodes;
        } else if (count < 0) {
            count = 0;
        }
        store.dispatch(setCount(count));
    };

    getNumServers = () => {
        return store.getState().hacknetmanager.Count;
    };

    getPurchasedCount = () => {
        return store.getState().hacknetmanager.Purchased;
    };

    private isUpgraded = (index: number) => {
        const hacknetInfo = this.ns.hacknet.getNodeStats(index);
        if (hacknetInfo.level < 200) {
            return 0;
        }
        if (hacknetInfo.ram < 64) {
            return 1;
        }
        if (hacknetInfo.cores < 16) {
            return 2;
        }
        return -1;
    };
    private upgradeLevel = (index: number) => {
        const cost = this.ns.hacknet.getLevelUpgradeCost(index);
        const cash = this.ns.getServerMoneyAvailable("home");
        if (cash > cost) {
            this.ns.hacknet.upgradeLevel(index);
        }
    };
    private upgradeRam = (index: number) => {
        const cost = this.ns.hacknet.getRamUpgradeCost(index);
        const cash = this.ns.getServerMoneyAvailable("home");
        if (cash > cost) {
            this.ns.hacknet.upgradeRam(index);
        }
    };
    private upgradeCore = (index: number) => {
        const cost = this.ns.hacknet.getCoreUpgradeCost(index);
        const cash = this.ns.getServerMoneyAvailable("home");
        if (cash > cost) {
            this.ns.hacknet.upgradeCore(index);
        }
    };

    private purchaseNewServer = () => {
        if (
            store.getState().hacknetmanager.Purchased <
            store.getState().hacknetmanager.Count
        ) {
            const cost = this.ns.hacknet.getPurchaseNodeCost();
            const cash = this.ns.getServerMoneyAvailable("home");
            if (cash > cost) {
                this.ns.hacknet.purchaseNode();
                store.dispatch(setPurchased(this.ns.hacknet.numNodes()));
            }
        }
    };

    private buyHacknetServer = () => {
        const max = store.getState().hacknetmanager.Purchased;
        let noUpgrade = true;
        for (let i = 0; i < max; i++) {
            const canUpgrade = this.isUpgraded(i);
            if (canUpgrade >= 0) {
                noUpgrade = false;
            }
            switch (canUpgrade) {
                case 0:
                    this.upgradeLevel(i);
                    break;
                case 1:
                    this.upgradeRam(i);
                    break;
                case 2:
                    this.upgradeCore(i);
                    break;
            }
        }
        if (noUpgrade) {
            this.purchaseNewServer();
        }
    };

    processHacknetActivity = () => {
        if (this.buying) {
            this.buyHacknetServer();
        }
    };
}
