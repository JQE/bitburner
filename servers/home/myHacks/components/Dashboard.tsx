import { HacknetManager } from "../HacknetManager";
import { ServerManager } from "../ServerManger";
import { ActionBar } from "./Overview/ActionBar";
import { ControlButtons } from "./Overview/ControlButtons";
import { HackDisplay } from "./Overview/HackDisplay";
import { HacknetDisplay } from "./Overview/HacknetDisplay";
import { ServerDisplay } from "./Overview/ServerDisplay";
import { StatsBar } from "./Overview/StatsBar";
import React, { useState } from "react";
import { ServerPanel } from "./ServerPanel/ServerPanel";

export interface IDashboardProps {
    ns: NS;
    sm: ServerManager;
    hnm: HacknetManager;
    onQuit: () => void;
}

/*

            style={{
                font: "12px",
                height: "100%",
                width: "15%",
                border: "2px solid",
                borderColor: "yellow",
                position: "fixed",
                zIndex: 1,
                top: 0,
                right: 2,
                overflowX: "hidden",
            }}
            */
export const Dashboard = ({ ns, sm, hnm, onQuit }: IDashboardProps) => {
    const [showServerPanel, setShowServerPanel] = useState(false);
    return (
        <div className="dashboard" style={{ paddingRight: "10px" }}>
            {/*<ActionBar ns={ns} sm={sm}></ActionBar>*/}
            {/*<StatsBar ns={ns}></StatsBar>*/}
            <ControlButtons
                ns={ns}
                sm={sm}
                hnm={hnm}
                onShowServer={() => {
                    setShowServerPanel(true);
                }}
                onQuit={onQuit}
            ></ControlButtons>
            <ServerDisplay ns={ns} sm={sm}></ServerDisplay>
            {/*<HacknetDisplay hnm={hnm} ns={ns}></HacknetDisplay>*/}
            <HackDisplay ns={ns}></HackDisplay>
            <ServerPanel
                ns={ns}
                sm={sm}
                show={showServerPanel}
                onClose={() => {
                    setShowServerPanel(false);
                }}
            ></ServerPanel>
        </div>
    );
};
