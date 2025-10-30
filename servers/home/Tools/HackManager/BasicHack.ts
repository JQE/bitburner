export class BasicHack {
    private ns: NS;
    private hackScript: string = "baseHack.js";
    private scriptMem: number;
    private servers: string[] = [];
    private target: string;
    private toolCount: number = -1;

    constructor(ns: NS, target: string = "n00dles") {
        this.ns = ns;
        this.scriptMem = this.ns.getScriptRam(this.hackScript);
        this.target = target;
    }

    private getServers = (
        lambdaCondition = (hostname: string) => true,
        hostname = "home",
        toolCount = 0,
        servers: string[] = [],
        visited: string[] = []
    ) => {
        if (visited.includes(hostname)) return;
        visited.push(hostname);
        if (lambdaCondition(hostname)) servers.push(hostname);
        const connectedNodes = this.ns.scan(hostname);
        if (hostname !== "home") connectedNodes.shift();
        for (const node of connectedNodes)
            this.getServers(lambdaCondition, node, toolCount, servers, visited);
        return servers;
    };

    private copyScripts = (
        server: string,
        scripts: string[],
        overwrite = false
    ) => {
        for (const script of scripts) {
            if (
                (!this.ns.fileExists(script, server) || overwrite) &&
                this.ns.hasRootAccess(server)
            ) {
                this.ns.scp(script, server);
            }
        }
    };

    private nukeTarget = (server: string): boolean => {
        if (this.ns.hasRootAccess(server)) return true;

        const numPorts = this.ns.getServerNumPortsRequired(server);
        if (numPorts <= this.toolCount) {
            if (numPorts >= 5) {
                this.ns.sqlinject(server);
            }
            if (numPorts >= 4) {
                this.ns.httpworm(server);
            }
            if (numPorts >= 3) {
                this.ns.relaysmtp(server);
            }
            if (numPorts >= 2) {
                this.ns.ftpcrack(server);
            }
            if (numPorts >= 1) {
                this.ns.brutessh(server);
            }
            this.ns.nuke(server);
        }
    };

    private checkTarget = (server: string, target: string, forms = false) => {
        if (!this.ns.hasRootAccess(server)) return target;

        const player = this.ns.getPlayer();
        const serverSim = this.ns.getServer(server);
        const pSim = this.ns.getServer(target);

        let previousScore;
        let currentScore;

        if (
            serverSim.requiredHackingSkill <=
            player.skills.hacking / (forms ? 1 : 2)
        ) {
            if (forms) {
                serverSim.hackDifficulty = serverSim.minDifficulty;
                pSim.hackDifficulty = pSim.minDifficulty;

                previousScore =
                    (pSim.moneyMax /
                        this.ns.formulas.hacking.weakenTime(pSim, player)) *
                    this.ns.formulas.hacking.hackChance(pSim, player);
                currentScore =
                    (serverSim.moneyMax /
                        this.ns.formulas.hacking.weakenTime(
                            serverSim,
                            player
                        )) *
                    this.ns.formulas.hacking.hackChance(serverSim, player);
            } else {
                const weight = (serv) => {
                    // Calculate the difference between max and available money
                    let diff = serv.moneyMax - serv.moneyAvailable;

                    // Calculate the scaling factor as the ratio of the difference to the max money
                    // The constant here is just an adjustment to fine tune the influence of the scaling factor
                    let scalingFactor = (diff / serv.moneyMax) * 0.95;

                    // Adjust the weight based on the difference, applying the scaling penalty
                    return (
                        (serv.moneyMax / serv.minDifficulty) *
                        (1 - scalingFactor)
                    );
                };
                previousScore = weight(pSim);
                currentScore = weight(serverSim);
            }
            if (currentScore > previousScore) target = server;
        }
        return target;
    };

    private getToolCount = () => {
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

    private hackServers = () => {
        this.servers = this.getServers(
            (server) => {
                if (server === "home") return false;
                this.target = this.checkTarget(
                    server,
                    this.target,
                    this.ns.fileExists("Formulas.exe", "home")
                );
                this.copyScripts(server, [this.hackScript], true);
                this.nukeTarget(server);
                return this.ns.hasRootAccess(server);
            },
            "home",
            this.toolCount
        );
    };

    private runJobs = () => {
        this.servers.forEach((server) => {
            const numPorts = this.ns.getServerNumPortsRequired(server);
            if (numPorts <= this.toolCount) {
                if (numPorts >= 1) {
                    this.ns.brutessh(server);
                }
                if (numPorts >= 2) {
                    this.ns.ftpcrack(server);
                }
                if (numPorts >= 3) {
                    this.ns.relaysmtp(server);
                }
                if (numPorts >= 4) {
                    this.ns.httpworm(server);
                }
                if (numPorts >= 5) {
                    this.ns.sqlinject(server);
                }
                const maxRam = this.ns.getServerMaxRam(server);
                const used = this.ns.getServerUsedRam(server);
                const threads = Math.floor((maxRam - used) / this.scriptMem);
                if (threads > 0) {
                    this.ns.nuke(server);
                    this.ns.scp(this.hackScript, server);
                    this.ns.exec(this.hackScript, server, threads);
                }
            }
        });
    };
    private killall = () => {
        this.servers.forEach((server) => {
            this.ns.kill(this.hackScript, server);
        });
    };
    processHack = () => {
        const oldTools = this.toolCount;
        this.toolCount = this.getToolCount();
        if (this.toolCount > oldTools) {
            this.killall();
            this.hackServers();
            this.runJobs();
        }
        this.ns.print(
            `Server Count: ${this.servers.length}    Target: ${this.target}`
        );
        this.ns.print(`Current Tool Count: ${this.toolCount}`);
    };
}
