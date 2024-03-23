import { HacknetManager } from "../Managers/HacknetManager";
import { ServerManager } from "../Managers/ServerManger";
import { ControlButtons } from "./Overview/ControlButtons";
import { HackDisplay } from "./Overview/HackDisplay";
import { ServerDisplay } from "./Overview/ServerDisplay";
import React, { useState } from "react";
import { ServerPanel } from "./ServerPanel/ServerPanel";
import { GangPanel } from "./GangPanel/GangPanel";

export interface IDashboardProps {
    ns: NS;
    sm: ServerManager;
    //hnm: HacknetManager;
    onQuit: () => void;
}

export const Dashboard = ({ ns, sm /*, hnm*/, onQuit }: IDashboardProps) => {
    const [showServerPanel, setShowServerPanel] = useState(false);
    const [showGangPanel, setShowGangPanel] = useState(false);
    return (
        <div
            className="dashboard"
            id="dashboard"
            style={{ paddingRight: "10px" }}
        >
            <ControlButtons
                ns={ns}
                sm={sm}
                //hnm={hnm}
                onShowServer={() => {
                    setShowServerPanel(true);
                }}
                onShowGang={() => {
                    setShowGangPanel(true);
                }}
                onQuit={onQuit}
            ></ControlButtons>
            <ServerDisplay ns={ns} sm={sm}></ServerDisplay>
            <HackDisplay ns={ns}></HackDisplay>
            <ServerPanel
                ns={ns}
                sm={sm}
                show={showServerPanel}
                onClose={() => {
                    setShowServerPanel(false);
                }}
            ></ServerPanel>
            <GangPanel
                ns={ns}
                show={showGangPanel}
                onClose={() => {
                    setShowGangPanel(false);
                }}
            ></GangPanel>
        </div>
    );
};
