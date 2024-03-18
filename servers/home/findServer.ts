export async function main(ns: NS) {
    const getServers = (
        lambdaCondition = (hostname: string) => true,
        hostname = "home",
        servers: string[] = [],
        visited: string[] = []
    ) => {
        if (visited.includes(hostname)) return;
        visited.push(hostname);
        if (lambdaCondition(hostname)) servers.push(hostname);
        const connectedNodes = this.ns.scan(hostname);
        if (hostname !== "home") connectedNodes.shift();
        for (const node of connectedNodes)
            this.getServers(lambdaCondition, node, servers, visited);
        return servers;
    };

    const target = ns.args[0];
    ns.tprint(`Looking for ${target}`);
    if (!target || target == "") {
        throw new Error("target is required");
    }

    let found = false;
    const recursiveScan = (current: string) => {
        if (current === target) {
            found = true;
            ns.tprint(`Step: ${current}`);
            return;
        }
        if (found === true) {
            ns.tprint(`Step ${current}`);
            return;
        }
        const servers = ns.scan(current);
        for (const server of servers) {
            recursiveScan(server);
        }
    };
    recursiveScan("home");
}
