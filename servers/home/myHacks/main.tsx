import { Dashboard } from "./components/Dashboard";
import React from "react";
import ReactDOM from "react-dom";
import { ServerManager } from "./Managers/ServerManger";
import { Provider } from "react-redux";
import { store } from "./state/store";
import Style from "./bootstrap.css";
import { GangManager } from "./Managers/GangManager";

export async function main(ns: NS) {
    ns.disableLog("ALL");

    ns.disableLog("asleep");
    ns.tail();
    let running = true;
    const sm = new ServerManager(ns);
    //const hnm = new HacknetManager(ns);
    const gm = new GangManager(ns);

    /*const body = document.body;
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
    }*/

    const table = document.getElementById("overview-extra-hook-0").parentElement
        .parentElement.parentElement.parentElement;
    table.style.display = "table";
    table.style.width = "90%";
    const menu = document.createElement("div");
    table.after(menu);
    //const hook1 = document.getElementById("overview-extra-hook-1");
    const onQuit = async () => {
        running = false;
        await sm.cleanup();
        menu.remove();
        const db = document.getElementById("dashboard");
        if (db) db.remove();
        /*dashboard.remove();
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
        }*/
    };
    ReactDOM.render(
        <Provider store={store}>
            <Style></Style>
            <Dashboard
                ns={ns}
                sm={sm}
                /*hnm={hnm}*/ onQuit={onQuit}
            ></Dashboard>
        </Provider>,
        menu
    );
    ns.atExit(() => {
        onQuit();
    });

    while (running) {
        if (!ns.gang.inGang()) await ns.asleep(1000);
        // script must be running in bitburner for ns methods to function inside our component
        else await ns.gang.nextUpdate();
        ns.clearLog();
        await sm.processServerActivity();
        await gm.processGangs();
        //hnm.processHacknetActivity();
    }
}
