import React from "react";
import { TailModal } from "./Utils/TailModal";
import { NS } from "NetscriptDefinitions";
import { ControlPanel } from "./Components/ControlPanel/ControlPanel";
import Style from "./bootstrap.css";

export async function main(ns: NS) {
    /** Alias for document to prevent excessive RAM use */
    const doc = (0, eval)("document") as Document;
    ns.disableLog("ALL");
    ns.tail();

    const tm = new TailModal(ns, doc);

    tm.renderCustomModal(
        <>
            <Style></Style>
            <ControlPanel></ControlPanel>
        </>
    );
    ns.print("testing the print function");

    ns.atExit(() => {
        ns.closeTail();
    });

    while (true) {
        await ns.sleep(1000);
    }
}
