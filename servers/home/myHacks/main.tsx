import { Dashboard } from "./components/Dashboard/Dashboard";
import React from "react";
import ReactDOM from "react-dom";
import { MainHack } from "./mainHack";
import { ServerManager } from "./ServerManger";
import { Provider } from "react-redux";
import { store } from "./state/store";
import Style from "./bootstrap.css";
import { HacknetManager } from "./HacknetManager";

export async function main(ns: NS) {
    ns.disableLog("ALL");

    ns.disableLog("asleep");
    const sm = new ServerManager(ns);
    const mh = new MainHack(ns, sm);
    const hnm = new HacknetManager(ns);

    const body = document.body;
    body.style.overflow = "hidden";
    body.style.display = "flex";
    const root = document.getElementById("root");
    root.style.flex = "1 1";
    root.style.maxWidth = "85%";
    root.style.overflow = "scroll";
    const defaultOverview: HTMLElement = document.querySelector(
        ".react-draggable:first-of-type"
    );
    if (defaultOverview != undefined) {
        defaultOverview.style.display = "none";
    }

    const dashboard = document.createElement("div");
    ReactDOM.render(
        <Provider store={store}>
            <Style></Style>
            <Dashboard ns={ns} mh={mh} sm={sm} hnm={hnm}></Dashboard>
        </Provider>,
        document.body.appendChild(dashboard)
    );
    ns.atExit(() => {
        dashboard.remove();
        delete document.body.style.overflow;
        delete document.body.style.display;
        const rootcleanup = document.getElementById("root");
        delete rootcleanup.style.flex;
        rootcleanup.style.maxWidth = "100%";
        delete rootcleanup.style.overflow;
        const defaultOverview: HTMLElement = document.querySelector(
            ".react-draggable:first-of-type"
        );
        if (defaultOverview != undefined) {
            defaultOverview.style.display = "flex";
        }
    });

    while (ns.scriptRunning("/myHacks/main.js", "home")) {
        await ns.asleep(1000); // script must be running in bitburner for ns methods to function inside our component
        sm.processServerActivity();
        mh.processHackActivity();
        await hnm.processHacknetActivity();
    }
}
