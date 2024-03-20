import React from "react";
import ReactDOM from "react-dom";
import { Dashboard } from "./Components/Dashboard/Dashboard";
import { ServerManager } from "./Utilities/ServerManagers/ServerManager";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { watchSelectorForCreation } from "./Utilities/bitrunnerDOM";

export async function main(ns: NS) {
    ns.disableLog("ALL");

    const sm = new ServerManager(ns);
    const doc = globalThis["document"];

    const body = doc.body;
    body.style.overflow = "hidden";
    body.style.display = "flex";
    const root = doc.getElementById("root");
    root.style.flex = "1 1";

    const menu = doc.createElement("div");
    const terminalParent = doc.getElementById("terminal").parentElement;
    const allParent = terminalParent.parentElement;
    allParent.style.position = "relative";
    terminalParent.style.height = "calc(100vh - 75px)";
    allParent.append(menu);

    watchSelectorForCreation("#terminal", (terminalElement) => {
        const terminalParent = terminalElement.parentElement;
        const allParent = terminalParent.parentElement;
        allParent.style.position = "relative";
        terminalParent.style.height = "calc(100vh - 75px)";
    });

    ReactDOM.render(
        <Provider store={store}>
            <Dashboard ns={ns} sm={sm}></Dashboard>
        </Provider>,
        menu
    );

    ns.atExit(() => {
        menu.remove();
        delete doc.body.style.overflow;
        delete doc.body.style.display;
        const rootcleanup = doc.getElementById("root");
        delete rootcleanup.style.flex;
        rootcleanup.style.maxWidth = "100%";
        delete rootcleanup.style.overflow;
        const terminalElement = doc.getElementById("terminal");
        if (terminalElement !== null) {
            const terminalParent = terminalElement.parentElement;
            terminalParent.style.height = "calc(100vh - 16px)";
        }

        const hook0 = doc.getElementById("overview-extra-hook-0");
        hook0.innerText = "";
        const hook1 = doc.getElementById("overview-extra-hook-1");
        hook1.innerText = "";
    });

    while (ns.scriptRunning("beeOs.js", "home")) {
        await ns.asleep(1000);
        sm.processActivity();
    }
}
