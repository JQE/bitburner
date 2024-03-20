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

    const recursiveScan = (current: string, parent: string[]) => {
        if (current === target) {
            let i = 0;
            parent.forEach((server) => {
                ++i;
                if (i === 10) {
                    ns.tprintf(`\u001b[33m${server}`);
                } else {
                    ns.tprintf(server);
                }
            });
            return;
        }
        const servers = ns.scan(current);
        if (current !== "home") servers.shift();
        for (const server of servers) {
            parent.push(server);
            recursiveScan(server, parent);
            parent.pop();
        }
    };
    recursiveScan("home", []);
}
