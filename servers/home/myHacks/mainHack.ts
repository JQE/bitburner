import React from "react";
import { Server } from "NetscriptDefinitions";
import { ServerManager } from "./ServerManger";

export class MainHack {
    private ns: NS;
    private numTools: number = 0;
    private hacking: boolean = false;
    private initialized: boolean = false;
    private sm: ServerManager;

    constructor(ns: NS, sm: ServerManager) {
        this.ns = ns;
        this.sm = sm;
    }

    hack = () => {
        this.hacking = !this.hacking;
        if (this.hacking === true) {
            if (this.initialized === false) {
                this.initialize();
            } else {
                this.restartHack();
            }
        } else {
            this.killAll(false);
            this.ns.kill("early-hack-template.js");
        }
    };

    isHacking = () => {
        return this.hacking;
    };

    isInitialized = () => {
        return this.initialized;
    };

    checkTools = () => {
        const newToolCount = this.countTools();
        if (newToolCount !== this.numTools) {
            this.numTools = newToolCount;
            return true;
        }
        return false;
    };

    countTools = (): number => {
        this.ns.printf("Checking number of tools");
        let numTools = 0;
        if (this.ns.fileExists("BruteSSH.exe")) {
            numTools++;
        }
        if (this.ns.fileExists("FTPCrack.exe")) {
            numTools++;
        }
        if (this.ns.fileExists("relaySMTP.exe")) {
            numTools++;
        }
        if (this.ns.fileExists("HTTPWorm.exe")) {
            numTools++;
        }
        if (this.ns.fileExists("SQLInject.exe")) {
            numTools++;
        }
        return numTools;
    };

    hackServers = () => {
        this.ns.printf("Hacking servers.");
        const servers = this.sm.getPublicServers();
        const pservers = this.sm.getPrivateServers();
        servers.forEach((server) => {
            const numOpenPortsRequired =
                this.ns.getServerNumPortsRequired(server);
            if (numOpenPortsRequired <= this.numTools) {
                this.sm.prepServer(server, true);
            }
        });
        pservers.forEach((server) => {
            this.ns.printf("Hacking server %s", server);
            this.sm.prepServer(server, true);
        });
    };

    killAll = (includeHome: boolean = false) => {
        const servers = this.sm.getPublicServers();
        servers.forEach((server) => {
            if ((includeHome && server !== "home") || includeHome === false) {
                this.ns.killall(server);
            }
        });
        const pservers = this.sm.getPrivateServers();
        pservers.forEach((server) => {
            this.ns.killall(server);
        });
        this.ns.kill("early-hack-template.js");
    };

    restartHack = () => {
        this.killAll(false);
        this.hackServers();
        this.sm.prepHome();
    };

    initialize = () => {
        this.numTools = this.countTools();
        this.hackServers();
        this.sm.prepHome();
        this.initialized = true;
    };

    processHackActivity = () => {
        if (this.hacking) {
            const newNumTools = this.countTools();
            if (newNumTools > this.numTools) {
                this.numTools = newNumTools;
                this.restartHack();
            }
        }
    };
}
