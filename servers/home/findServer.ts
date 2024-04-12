export async function main(ns: NS) {
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
