export async function main(ns:NS) {
    ns.disableLog("ALL");
    const ram = 8;
    let i = ns.getPurchasedServers().length;
    ns.tprintf("Server Count: %d", i);
    let owned = 0;
    while (owned < i) {
      ns.printf("I: %d, Owned: %d", i, owned);
      ns.printf("Trying to hack %d", owned);
      const hostname = "pserv-" + owned;
      ns.scp("early-hack-template.js", hostname);
      ns.exec("early-hack-template.js", hostname, 3);
      owned++;
      await ns.sleep(1e3);
    }
    while (i < ns.getPurchasedServerLimit()) {
      if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
        let hostname = ns.purchaseServer("pserv-" + i, ram);
        ns.tprintf("Purchasing server %s", hostname);
        ns.scp("early-hack-template.js", hostname);
        ns.exec("early-hack-template.js", hostname, 3);
        i++;
      }
      await ns.sleep(1e3);
    }
  }